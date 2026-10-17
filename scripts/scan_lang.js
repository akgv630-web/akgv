const fs = require('fs');
const path = require('path');

function scanDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDir(fullPath, results);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = scanDir('src');

// 1. Check for binary ternaries (language === 'hi' ? '...' : '...') missing hinglish
const binaryTernaries = [];
// 2. Check for Devanagari lines completely outside tLang and outside any language check
const hardcodedHindi = [];

for (const f of allFiles) {
  if (f.includes('i18n.ts')) continue;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check binary ternary
    if (line.includes("language === 'hi'") && !line.includes("hinglish")) {
      // Check next 3 lines to see if hinglish is checked
      const nextFew = lines.slice(idx, idx + 4).join(' ');
      if (!nextFew.includes('hinglish') && !nextFew.includes('tLang')) {
        binaryTernaries.push({ file: f, lineNum: idx + 1, line: line.trim() });
      }
    }

    // Check Devanagari
    if (/[\u0900-\u097F]/.test(line)) {
      // Is it a comment?
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
      // Is it a data dictionary entry (e.g. nameHi, etc.)
      if (/^\s*[a-zA-Z0-9_]*(Hi|hi)\s*:/.test(line)) return;

      // Check if wrapped in tLang or language check within 10 lines
      let handled = false;
      for (let k = Math.max(0, idx - 10); k <= Math.min(lines.length - 1, idx + 5); k++) {
        if (lines[k].includes('tLang(') || lines[k].includes("language ===") || lines[k].includes("language !==") || lines[k].includes("lang ===")) {
          handled = true;
          break;
        }
      }

      if (!handled) {
        hardcodedHindi.push({ file: f, lineNum: idx + 1, line: line.trim() });
      }
    }
  });
}

console.log(`=== 1. BINARY TERNARIES (missing Hinglish): ${binaryTernaries.length} ===`);
const bGrouped = {};
binaryTernaries.forEach(b => { bGrouped[b.file] = (bGrouped[b.file] || 0) + 1; });
Object.entries(bGrouped).sort((a,b) => b[1] - a[1]).forEach(([file, cnt]) => {
  console.log(`${cnt.toString().padStart(3)} in ${file}`);
});

console.log(`\n=== 2. HARDCODED HINDI (no language condition at all): ${hardcodedHindi.length} ===`);
const hGrouped = {};
hardcodedHindi.forEach(h => { hGrouped[h.file] = (hGrouped[h.file] || 0) + 1; });
Object.entries(hGrouped).sort((a,b) => b[1] - a[1]).forEach(([file, cnt]) => {
  console.log(`${cnt.toString().padStart(3)} in ${file}`);
});

if (hardcodedHindi.length > 0) {
  console.log('\nSample Hardcoded Hindi lines:');
  hardcodedHindi.slice(0, 20).forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.line}`));
}
