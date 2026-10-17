export type Language = 'en' | 'hi' | 'hinglish';

export function tLang(lang: Language, en: string, hi: string, hinglish: string): string {
  if (lang === 'hi') return hi;
  if (lang === 'hinglish') return hinglish;
  return en;
}

export const DICTIONARY = {
  "en": {
    "brandName": "AKGV Infra City",
    "companyLegalName": "AKGV Infra City Private Limited",
    "tagline": "Where Dreams Find Their Address",
    "phoneLabel": "Helpline: +91 6306917991",
    "nav": {
      "home": "Home",
      "projects": "Projects",
      "masterPlan": "Master Plan",
      "houseViewer3d": "3D Elevation",
      "villa3d": "3D Villa",
      "siteVisit": "Site Visit",
      "rewards": "Rewards & Levels",
      "joiningKit": "Joining Kit",
      "about": "About Us",
      "contact": "Contact Us",
      "portalLogin": "Portal Login",
      "buyerPortal": "Buyer Portal",
      "memberPortal": "Member Portal",
      "adminPortal": "Super Admin",
      "dashboard": "Open Dashboard",
      "account": "Account",
      "signOut": "Sign Out",
      "roleSimulator": "Role:",
      "switchRoleTitle": "Switch Active Role",
      "roleLabels": {
        "super_admin": "Super Admin",
        "sub_admin": "Sub-Admin",
        "senior_member": "Senior Member",
        "junior_member": "Junior Member",
        "buyer": "Plot Buyer"
      }
    },
    "hero": {
      "badge": "Approved Plotted Township & Infrastructure Development",
      "title": "Own Your Approved Residential Plot with Ready Infrastructure",
      "titleHighlight": "AKGV Infra City Private Limited",
      "subtitle": "Fully demarcated residential land parcels with 30ft entrance boulevard, 25ft internal roads, underground drainage, dedicated power transformer & immediate registry in Rampur, Lahartara & Mirza Murad.",
      "explorePlots": "Explore Plotted Master Plan",
      "townshipLocations": "Township Locations",
      "bookVisit": "Book Guided Site Visit",
      "sampleElevations": "Architectural Guidance",
      "directDesk": "Direct Sales Desk:",
      "immediateAssistance": "Immediate Site Visit Assistance",
      "whatsappDesk": "WhatsApp Inquiry Desk",
      "watch3d": "Launch 3D Elevation Viewer"
    },
    "locations": {
      "badge": "Regional Branch Network",
      "title": "Our Branch Offices & Helpdesks in Varanasi",
      "subtitle": "Visit our nearest branch office for authenticated plot documentation, registry consultation, and site visit departures.",
      "branchOffice": "Branch Office",
      "callBranch": "Call Branch Office",
      "visitBranch": "Book Site Visit from this Branch",
      "officeHours": "Office Hours: 9:30 AM – 6:30 PM (Mon – Sat)",
      "servicesTitle": "Branch Services & Consultation"
    },
    "masterPlan": {
      "badge": "55 Approved Plots",
      "title": "A.K.G.V. INFRA CITY VARANASI — COMPLETE MASTER LAYOUT PLAN",
      "subtitle": "Approved Blueprint Scale: 1:500 | Area: 77,550 sqft | Er. Rajesh Kumar Patel (R.P. Home Design)",
      "viewOriginalPhoto": "Original Brochure Photo",
      "fullscreen": "Fullscreen",
      "exitFullscreen": "Exit Fullscreen",
      "viewModes": {
        "plots": "Plotted Layout (Residential Plots)",
        "villas": "3D Future Home Simulation",
        "cad": "CAD Blueprint View",
        "landscape": "Satellite Landscape View"
      },
      "plotTapInstruction": "Tap or click any plot — it will smoothly enlarge with 3D elevation details & booking options.",
      "plotsSalesOnlyNotice": "Residential Plots Only • Infrastructure Ready",
      "legend": {
        "available": "Green: Available",
        "booked": "Yellow: Booked",
        "reserved": "Red: Vacant / Reserved"
      },
      "statusLabels": {
        "available": "Available for Booking",
        "booked": "Confirmed Booked",
        "reserved": "Vacant / Reserved"
      },
      "vastu": {
        "approved100": "100% Vastu Approved",
        "eastNote": "East facing: Promotes health, solar warmth, and financial prosperity.",
        "northNote": "North facing: Governed by Kuber; ideal for abundance and career growth.",
        "southNote": "South facing: Elevated entry design recommended; high energy and vitality.",
        "generalNote": "Balanced energy alignment with wide frontage."
      },
      "showDimensions": "Dimensions",
      "showVehicles": "Vehicles",
      "showLandscaping": "Landscaping",
      "filters": {
        "allBlocks": "All Blocks",
        "allStatus": "All Status",
        "availableOnly": "Available Only (Green)",
        "bookedOnly": "Booked Only (Yellow)",
        "vacantOnly": "Vacant / Reserved (Red)",
        "allSizes": "All Sizes",
        "compactSize": "Compact (<1000 sqft)",
        "midSize": "Mid-Sized (1000-1500 sqft)",
        "luxurySize": "Luxury (1500+ sqft)",
        "searchPlaceholder": "Search plot number (e.g. A-04, C-12)...",
        "reset": "Reset Zoom & View"
      },
      "inspector": {
        "selectedPlotHeader": "Plot Details",
        "block": "Block",
        "cornerPlot": "Corner Plot",
        "vastuTitle": "Vastu Compliance",
        "totalArea": "Total Plot Area",
        "squareYards": "Square Yards (Gaj)",
        "dimensions": "Dimensions",
        "dimensionsSub": "Length x Width",
        "roadFrontage": "Road Frontage",
        "roadFrontageSub": "Asphalt Road with Drainage",
        "basePrice": "Base Price (INR)",
        "sampleElevationTitle": "Sample House Elevations (For Reference Only)",
        "sampleElevationNote": "*AKGV Infra City strictly sells plots. You can construct a customized house like this on your purchased plot.",
        "estimatedConstruction": "Est. Construction",
        "inspect3dBtn": "3D Preview",
        "holdPlotBtn": "Hold / Book Plot Online (72h Token Hold)",
        "vacantNotice": "This plot is currently reserved. Check available green plots or contact support.",
        "scheduleVisitBtn": "Schedule an On-Site Visit",
        "areaScheduleTitle": "AREA SCHEDULE (BLUEPRINT GROUND TRUTH)",
        "scaleText": "Scale 1:500",
        "townshipArea": "Total Township Area:",
        "netPlotArea": "Net Plot Area:",
        "internalRoadArea": "Internal Road Area:",
        "roadRatio": "Road Area Ratio:",
        "sloganTitle": "Purchase Your Dream Residential Plot",
        "sloganSubtitle": "Well-planned plots at affordable rates | Peaceful, secure and rapidly developing area | Water, electricity, and drainage ready",
        "emptyPrompt": "Select any plot on the master plan to inspect dimensions, road width, and suitable 3D house designs.",
        "enlargeBtn": "Enlarge"
      },
      "spotlightModal": {
        "title": "3D Villa Architectural Elevation Spotlight",
        "enlargeBtn": "Enlarge 3D Villa",
        "plotDimensions": "Plot Dimensions",
        "lengthWidth": "Length x Width",
        "totalArea": "Total Area",
        "squareYards": "Square Yards",
        "proposedBoulevard": "Proposed Boulevard",
        "drainageLights": "Drainage & Lights",
        "bookingStatus": "Booking Status",
        "immediateRegistry": "Immediate Registry",
        "plotValue": "Plot Value",
        "importantNoticeTitle": "Important Notice:",
        "importantNoticeText": "AKGV Infra City Private Limited exclusively develops and sells approved residential plots with full infrastructure. The 3D villa shown above is a sample architectural elevation provided for future construction reference and visualization.",
        "holdBtn": "Hold Plot (72h Token Hold)",
        "whatsAppBtn": "WhatsApp Inquiry",
        "orbitViewerBtn": "360° 3D Orbit Viewer"
      },
      "brochureModal": {
        "modalTitle": "Original Approved Brochure Photographs — AKGV Infra City",
        "tabLayout": "Blueprint Layout Plan",
        "tabPhoto": "Physical Yellow Brochure Photo",
        "tabRewards": "11-Tier Rewards & Commission Plan",
        "footerNotice": "Authentic documents provided by AKGV Infra City Private Limited.",
        "scaleArea": "Scale 1:500 | Area: 77,550 sqft"
      }
    },
    "houseViewer": {
      "badge": "Sample Elevation Simulation",
      "title": "3D Future Home Simulation",
      "subtitle": "Sample Elevation on Plot",
      "fitApproved": "Plot-Fit Approved",
      "fitFailed": "Plot Area Insufficient for this Model",
      "noticeBadge": "Plot Sales Policy",
      "noticeText": "AKGV Infra City exclusively develops and sells approved residential plots. The company does NOT construct houses. This 3D simulation is provided purely to help you visualize how your future home, car parking, and Vastu alignment can fit on your purchased plot.",
      "noticeTag": "Township Plots Only",
      "chooseModel": "Choose Sample House Architectural Model",
      "simulateOnPlot": "Simulate on Plot",
      "finishesLabel": "Exterior Palette & Finishes",
      "highlightsTitle": "Architectural Layout Highlights:",
      "canvasHoldBtn": "Hold Plot",
      "canvasGuide": "Sample 3D Elevation • AKGV Infra Sells Plots",
      "drawerHoldBtn": "Place 72-Hour Hold on Plot",
      "drawerWhatsAppBtn": "Inquire About Plot on WhatsApp"
    },
    "loanCalc": {
      "badge": "Interactive Financial Planning",
      "title": "Bank Loan, EMI & Stamp Duty Estimator",
      "subtitle": "Calculate your monthly repayment, loan eligibility, and Uttar Pradesh government registry stamp duty for your plot in Varanasi.",
      "bankAssistance": "Bank Loan Assistance",
      "bankAssistanceSub": "Tie-ups with leading PSU & Private Banks",
      "propertyValuation": "Plot / Land Valuation",
      "downPayment": "Down Payment",
      "tenure": "Loan Tenure",
      "years": "Years",
      "months": "Months",
      "interestRate": "Annual Interest Rate",
      "stampDutyTitle": "UP Stamp Duty Calculator",
      "stampDutyDept": "Uttar Pradesh Revenue Dept",
      "femaleRegistry": "Women / Joint Registry",
      "femaleDesc": "6% Stamp + 1% Reg (1% State Subsidy)",
      "maleRegistry": "Male Registry",
      "maleDesc": "7% Stamp + 1% Registration Fee",
      "estimatedRepayment": "Estimated Repayment",
      "monthlyEmiTitle": "Monthly Equated Installment (EMI)",
      "perMonth": "/ month",
      "forPrincipal": "For loan principal of",
      "principalLoanAmount": "Principal Loan Amount:",
      "totalInterestPayable": "Total Interest Payable:",
      "totalAmountPayable": "Total Amount (P + I):",
      "estRegistryCost": "Est. Registry & Stamp Duty (UP):",
      "checkEligibilityWhatsApp": "Check Loan Eligibility via WhatsApp",
      "approvedBanksTitle": "Approved Bank Partners in Varanasi",
      "rateDisclaimer": "*Interest rates are subject to applicant credit score (CIBIL 750+) and bank appraisal guidelines."
    },
    "trust": {
      "badge": "Uncompromising Standards",
      "title": "Why Discerning Families Choose AKGV Infra City",
      "subtitle": "Engineered for high capital appreciation, legal certainty, and peaceful community living in Varanasi.",
      "verifiedStandard": "Verified Township Standard",
      "pillars": [
        {
          "title": "30ft & 25ft Wide Roads",
          "desc": "Transcribed directly from our approved blueprint: 30ft entrance boulevard with 25ft internal corridors paved with heavy-duty RCC/damar.",
          "highlight": "27.82% Road Ratio"
        },
        {
          "title": "100% Freehold Title",
          "desc": "Clear legal ownership with zero litigation. Guaranteed immediate Registry and administrative Dakhil-Kharij (Mutation) support.",
          "highlight": "Clear Land Title"
        },
        {
          "title": "Underground Power & Solar",
          "desc": "Dedicated on-site electricity transformer with underground conduit cabling and automatic solar avenue lighting along all curbs.",
          "highlight": "24/7 Power Ready"
        },
        {
          "title": "Botanical Green Buffer",
          "desc": "15ft 10in landscaped botanical setback buffer along perimeter with native shade trees, jogging trails, and park greens.",
          "highlight": "15'10\" Buffer"
        },
        {
          "title": "100% Vastu Approval",
          "desc": "Planned by Er. Rajesh Kumar Patel with optimal East and North road frontage to maximize natural ventilation and morning sunlight.",
          "highlight": "Er. Rajesh Patel Seal"
        },
        {
          "title": "Sweet Water & Modern Drainage",
          "desc": "Deep aquifer borewells with sweet drinking water and engineered underground stormwater drainage lines preventing waterlogging.",
          "highlight": "Zero Waterlogging"
        }
      ],
      "proximityBadge": "Prime Proximity",
      "proximityTitle": "Strategic Varanasi Growth Corridors",
      "proximitySub": "Rapid access to major railway hubs, expressways, premier hospitals, and universities.",
      "scheduleVisitBtn": "Schedule Free Guided Site Visit",
      "connectivity": [
        {
          "name": "Varanasi Cantt Railway Station",
          "dist": "15 Mins",
          "type": "Railway Hub"
        },
        {
          "name": "Banaras Railway Station (Manduadih)",
          "dist": "12 Mins",
          "type": "Superfast Trains"
        },
        {
          "name": "NH-19 (Grand Trunk Expressway)",
          "dist": "5 Mins",
          "type": "National Highway"
        },
        {
          "name": "BHU & Sir Sunderlal Hospital",
          "dist": "20 Mins",
          "type": "Premier Healthcare"
        },
        {
          "name": "Lal Bahadur Shastri Airport",
          "dist": "35 Mins",
          "type": "International Flights"
        },
        {
          "name": "Ring Road Phase-2 Varanasi",
          "dist": "8 Mins",
          "type": "Signal-Free Corridor"
        }
      ],
      "reviewsBadge": "Corporate Guarantees",
      "reviewsTitle": "Our 100% Legal & Possession Commitments",
      "reviewsSub": "Direct statutory guarantees provided by AKGV Infra City Private Limited under approved Master Plan.",
      "verifiedBuyer": "Official Guarantee",
      "reviews": [
        {
          "name": "100% Freehold Title & Immediate Registry",
          "role": "Legal Registry Department, Varanasi",
          "plot": "Sub-Registrar Office Varanasi",
          "date": "Statutory Commitment",
          "review": "All 55 demarcated plots feature 100% clear freehold title with zero bank liens or litigation. Complete legal assistance provided for sub-registrar deed execution and administrative Dakhil-Kharij (Mutation) certification."
        },
        {
          "name": "Er. Rajesh Kumar Patel Certified Blueprint",
          "role": "Chief Architect (R.P. Home Design)",
          "plot": "Scale 1:500 Demarcated Layout",
          "date": "Engineering Guarantee",
          "review": "Directly executed on 77,550 sqft land parcel with 27.82% area dedicated to internal roads. Every plot has stone pillar boundary demarcation, 30ft entrance avenue, and 25ft sector corridors."
        },
        {
          "name": "3 Physical Offline Branch Offices in Varanasi",
          "role": "Customer Support & Document Verification",
          "plot": "Rampur • Lahartara • Mirza Murad",
          "date": "Direct Branch Service",
          "review": "Visit our registered head office in Rampur or branch offices in Lahartara (near Cantt) and Mirza Murad (NH-19) for physical document inspection, payment receipts, and accompanied site visits in company vehicles."
        }
      ]
    },
    "certificate": {
      "modalTitleGenerating": "Instant Plot Hold Booking",
      "modalTitleGenerated": "Official 72-Hour Plot Hold Certificate",
      "selectedAsset": "Selected Asset",
      "basePrice": "Base Price",
      "area": "Area:",
      "dimensions": "Dimensions:",
      "facing": "Facing:",
      "buyerName": "Buyer Full Name",
      "buyerNamePlaceholder": "e.g. Ramesh Chandra Sharma",
      "mobileNumber": "Mobile Number (WhatsApp Enabled)",
      "mobilePlaceholder": "e.g. 9839123456",
      "sampleElevationIdea": "Sample House Elevation Idea (Optional — For Reference Only)",
      "sampleElevationDisclaimer": "*Notice: AKGV Infra City sells residential plots only. House construction is done independently by the buyer.",
      "guaranteeTitle": "Zero-Risk 72-Hour Legal Plot Hold",
      "guaranteeDesc": "Residential Plot #{plotNumber} will be temporarily locked in your name across our system for 72 hours. AKGV Infra City provides freehold land with 30ft/25ft wide roads, sweet water, drainage, and direct registry.",
      "cancelBtn": "Cancel",
      "generateBtn": "Generate 72-Hour Hold Certificate",
      "countdownLabel": "Hold Expiry Countdown:",
      "watermarkCrest": "AKGV",
      "certBadge": "Official Temporary Holding Certificate",
      "companyHeader": "AKGV INFRA CITY PRIVATE LIMITED",
      "companySub": "Township Development & Infrastructure • Varanasi (U.P.) | Phone: +91 6306917991",
      "refNo": "REF NO:",
      "allocatedPlot": "Allocated Plot",
      "plotAreaLabel": "Plot Area",
      "beneficiary": "Beneficiary (Buyer)",
      "plotValuationLabel": "Base Plot Valuation",
      "tokenPayableLabel": "Token:",
      "frontageRoad": "Frontage Road:",
      "approvedFacing": "Facing (100% Vastu)",
      "plannerNote": "Layout Planned & Approved by: Er. Rajesh Kumar Patel (R.P. Home Design) • Total Township: 77,550 sqft",
      "digitalRegistered": "Digital Hold Registered",
      "validityNotice": "Valid for 72 Hours from issuance",
      "authorizedEngineer": "Authorized Reg. Civil Engineer",
      "sendWhatsAppCta": "Send Certificate to WhatsApp (+91 6306917991)",
      "printCertBtn": "Print Certificate",
      "openBuyerPortalBtn": "Open Buyer Portal"
    },
    "whatsAppPopup": {
      "buttonLabel": "Chat on WhatsApp (6306917991)",
      "title": "AKGV Infra City Support",
      "onlineStatus": "Online • Direct WhatsApp",
      "helplineText": "Official Helpline: +91 6306917991",
      "promptText": "You can chat directly with our sales desk on WhatsApp. Click any option below:",
      "chooseTemplate": "Choose an inquiry topic:",
      "customLabel": "Or type your custom message:",
      "customPlaceholder": "Type your message here...",
      "repliesNote": "Replies within minutes • AKGV Infra City Private Limited",
      "templates": [
        {
          "id": "book-plot",
          "title": "Book a Residential Plot",
          "text": "Hello AKGV Infra City! I am interested in purchasing a residential plot in Varanasi (Rampur / Lahartara / Mirza Murad). Please share available plot numbers, dimensions, and token hold details."
        },
        {
          "id": "site-visit",
          "title": "Schedule Free Site Visit",
          "text": "Hello! I would like to schedule a free guided site visit to AKGV Infra City with complimentary cab pickup. Please coordinate available dates."
        },
        {
          "id": "rewards",
          "title": "Associate Rewards & Commission Plan",
          "text": "Hello! I want to join AKGV Infra City as an Associate Member and understand the 11-Tier Commission & Rewards Plan. Please guide me through onboarding."
        },
        {
          "id": "joining-kit",
          "title": "₹999 Physical Joining Kit",
          "text": "Hello! Please provide details regarding the ₹999 Physical Associate Joining Kit (Executive Bag, Pen, Diary, and Project File)."
        }
      ]
    },
    "rewards": {
      "title": "Level, Commission & Rewards System",
      "subtitle": "Brochure-grounded compensation tiers for verified business performance.",
      "level": "Level",
      "rank": "Rank / Post",
      "target": "Business Target",
      "commission": "Commission",
      "reward": "Brochure Reward",
      "offlineKitNotice": "Joining Kit: ₹999 collected offline in cash. Includes Bag, Pen, Diary, and Folder. Non-commissionable.",
      "headerTagline": "\"Work hard, increase your level, and achieve your dream rewards!\"",
      "viewOriginalBrochureBtn": "View Original Brochure Chart",
      "simulatorTitle": "Interactive Performance Simulator",
      "simulatorSubtitle": "Simulate Your Eligible Commission & Unlocked Reward",
      "celebrateBtn": "Celebrate Level",
      "verifiedVolumeLabel": "Total Verified Business Volume:",
      "currentTierLabel": "Current Tier:",
      "quickPresetsLabel": "Quick Presets:",
      "commissionRateLabel": "Commission Rate",
      "brochureLevelLabel": "Brochure Level",
      "calculatedCommissionLabel": "Calculated Commission",
      "onBusinessOf": "On business of",
      "brochureRewardCardTitle": "Brochure Reward (Click to Inquire)",
      "clickToEnquire": "Click to Inquire / Book",
      "nextMilestone": "Next Milestone:",
      "needsMore": "Needs",
      "more": "more",
      "officialChartTitle": "Official 11-Tier Commission & Rewards Chart",
      "officialChartSubtitle": "Click on any level to book plots, target that rank, or contact on WhatsApp",
      "approvedRanksBadge": "11 Approved Ranks • Click Any to Book",
      "actionHeader": "Action / Booking",
      "bookAtLevelBtn": "Book Plot / Inquire on this Level",
      "modalPlotBookingBtn": "Book Plot / Inquire on WhatsApp",
      "modalMasterPlanBtn": "View Plots on Master Plan",
      "lakhUnit": "Lakh",
      "croreUnit": "Crore"
    },
    "joiningKit": {
      "badge": "Offline Transparency",
      "title": "Member Joining Kit (₹999 Cash Ledger)",
      "subtitle": "Physical onboarding kit with Bag, Pen, Diary and File. Strictly collected in cash offline and tracked in our administrative ledger.",
      "kpiTotalCash": "Total Offline Cash Collected",
      "kpiTreasurySub": "Verified offline treasury",
      "kpiTotalKits": "Total Physical Kits Issued",
      "kpiAcknowledgedSub": "Acknowledged by members",
      "kpiStandardAmount": "Standard Kit Amount",
      "kpiNonCommissionable": "Non-commissionable",
      "kpiInventory": "Kit Physical Inventory",
      "kpiInStock": "in Stock",
      "kpiCentralWarehouse": "Central office warehouse",
      "recordKitBtn": "Record New ₹999 Cash Kit",
      "mandatoryContentsTitle": "Official Member Joining Kit Mandatory Contents",
      "cashTag": "₹999 Cash Offline",
      "bagTitle": "Executive Member Bag",
      "bagDesc": "Heavy-duty durable laptop & documents carrying briefcase bag with AKGV Infra City branding.",
      "penTitle": "Engraved Metallic Executive Pen",
      "penDesc": "Premium blue-ink metal rollerball pen for signing registry documents and buyer contracts.",
      "diaryTitle": "Hardbound Executive Diary",
      "diaryDesc": "Gold foil stamped annual business planning journal for recording client plot visits.",
      "fileTitle": "Legal Document Project File",
      "fileDesc": "Multi-pocket plastic folder containing approved blueprints, layout sheets, and price lists."
    },
    "faqs": [
      {
        "q": "Does AKGV Infra City construct houses or only sell residential plots?",
        "a": "AKGV Infra City Private Limited exclusively develops and sells approved residential plots. We develop complete township infrastructure including 30ft & 25ft paved roads, underground drainage, electricity transformers, solar streetlights, potable water, and boundary walls. The 3D House Viewer on our website is purely a visual simulation to help plot buyers visualize how a future home can look on their plot. House construction is undertaken independently by the buyer."
      },
      {
        "q": "Where are the flagship project locations of AKGV Infra City?",
        "a": "Initial flagship townships are strategically located in Rampur (peaceful corridor with direct 30ft entrance roads), Lahartara (central Varanasi near Cantt Station), and Mirza Murad (industrial & expressway growth corridor along NH-19)."
      },
      {
        "q": "What road widths and infrastructure amenities are provided?",
        "a": "As transcribed in our official blueprint, the development features a 30'-0\" wide main proposed boulevard and 25'-0\" wide internal cross-roads, complete with underground drainage lines, electricity transformer infrastructure, and water connectivity ready for immediate residential construction."
      },
      {
        "q": "How does the plot booking and hold workflow function?",
        "a": "Buyers can select an available green plot on our interactive digital master plan and place a 72-hour temporary hold. Payment proofs (UPI QR or Bank NEFT) are verified manually by authorized staff before issuing an official receipt and marking the plot yellow."
      },
      {
        "q": "What is the ₹999 Joining Kit and how is payment collected?",
        "a": "The ₹999 Joining Kit is strictly collected in cash offline and provides physical business materials: 1 Executive Bag, 1 Metallic Pen, 1 Executive Diary, and 1 Project File. An official printed cash receipt is generated in the portal."
      },
      {
        "q": "Can buyers visualize compatible houses in 3D before booking?",
        "a": "Yes! Our interactive 3D House Viewer allows you to rotate sample house designs 360 degrees, inspect dimensions, and verify how your proposed villa fits on your selected plot dimensions."
      }
    ],
    "ctaBanner": {
      "title": "Ready to Secure Your Plot in Varanasi?",
      "subtitle": "Schedule a guided site inspection with our senior representatives in Rampur, Lahartara or Mirza Murad today.",
      "callBtn": "Call",
      "siteVisitBtn": "Book Site Visit Online"
    },
    "footer": {
      "tagline": "Leading township developers delivering planned residential colonies with 30ft and 25ft wide roads, underground electrification, and transparent registry readiness in Uttar Pradesh.",
      "bookingLine": "Official Booking Line",
      "locationsTitle": "Project Locations",
      "portalsTitle": "Portals & Tools",
      "masterPlanLink": "Interactive Master Plan",
      "houseViewerLink": "Architectural 3D Plot-Fit Visualizer",
      "rewardsLink": "Level Commission & Rewards",
      "joiningKitLink": "Offline Joining Kit (₹999 Cash)",
      "buyerPortalLink": "Buyer Portal & Booking Status",
      "memberPortalLink": "Member Hierarchy & Digital ID",
      "adminPortalLink": "Super Admin Control Centre",
      "complianceTitle": "Compliance & Policies",
      "privacyPolicy": "Privacy Policy",
      "termsConditions": "Terms & Conditions",
      "bookingPolicy": "Booking & Cancellation Policy",
      "grievanceSupport": "Grievance & Customer Support",
      "blueprintRefTitle": "Verified Blueprint Reference",
      "blueprintRefText": "Layout Plan of A.K.G.V. Infra City Varanasi designed by Er. Rajesh Kumar Patel (R.P. Home Design).",
      "disclaimer": "AKGV Infra City Private Limited is dedicated to transparent township development in Uttar Pradesh. The company exclusively sells approved residential plots with full infrastructure. Plot availability, dimensions, and rates are subject to administrative verification and official registration.",
      "allRights": "All Rights Reserved. AKGV Infra City Private Limited."
    },
    "mobileNav": {
      "home": "Home",
      "plots": "Plots",
      "projects": "Locations",
      "siteVisit": "Site Visit",
      "emiCalc": "EMI Calc",
      "portal": "Dashboard"
    },
    "architecturalGuidance": {
      "badge": "Plot Planning Assistance",
      "title": "Architectural Guidance for Your Purchased Plot",
      "subtitle": "Visualize how your future home, car porch, and Vastu alignment can fit on your purchased land parcel.",
      "policyBadge": "Plot Sales Policy",
      "policyTitle": "Important Company Policy:",
      "policyNotice": "AKGV Infra City Private Limited exclusively develops and sells approved residential plots. The company does NOT construct houses. Buyers construct their homes independently according to their own preferences and budget.",
      "visualizerIntro": "To help you plan setbacks, car parking, lawn space, and Vastu orientation before buying land, use our 3D Plot-Fit Simulation tool to preview how compatible architectural layouts fit on your selected plot dimensions.",
      "exploreVisualizerBtn": "Launch 3D Plot-Fit Visualizer",
      "sampleTag": "Sample Elevation Reference Only",
      "models": [
        {
          "name": "Compact 2-BHK Villa",
          "suitablePlot": "Plots < 1,000 sqft (e.g. 20x40 ft)",
          "desc": "Optimized East/North facing single-floor layout with parking porch and terrace garden."
        },
        {
          "name": "Executive 3-BHK Duplex",
          "suitablePlot": "Plots 1,000 - 1,500 sqft (e.g. 25x50 ft)",
          "desc": "Double-height living room, 2-car covered parking, and rear ventilation setback."
        },
        {
          "name": "Imperial 4-BHK Luxury Villa",
          "suitablePlot": "Plots 1,500+ sqft (e.g. 30x60 ft)",
          "desc": "Grand entry lobby, private landscaped lawn, and separate servant quarters."
        }
      ]
    },
    "faqSection": {
      "title": "Frequently Asked Questions",
      "subtitle": "Clear answers regarding residential plot bookings, registry process, and company infrastructure."
    }
  },
  "hi": {
    "brandName": "एकेजीवी इन्फ्रा सिटी",
    "companyLegalName": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड",
    "tagline": "जहां सपने पाते हैं अपना ठिकाना",
    "phoneLabel": "हेल्पलाइन: +91 6306917991",
    "nav": {
      "home": "होम",
      "projects": "प्रोजेक्ट्स",
      "masterPlan": "मास्टर प्लान",
      "houseViewer3d": "3D एलिवेशन",
      "villa3d": "3D विला",
      "siteVisit": "साइट विजिट",
      "rewards": "रिवार्ड एवं लेवल्स",
      "joiningKit": "जॉइनिंग किट",
      "about": "हमारे बारे में",
      "contact": "संपर्क करें",
      "portalLogin": "पोर्टल लॉगिन",
      "buyerPortal": "क्रेता पोर्टल",
      "memberPortal": "सदस्य पोर्टल",
      "adminPortal": "सुपर एडमिन",
      "dashboard": "डैशबोर्ड खोलें",
      "account": "खाता",
      "signOut": "लॉगआउट",
      "roleSimulator": "पद:",
      "switchRoleTitle": "सक्रिय पद बदलें",
      "roleLabels": {
        "super_admin": "सुपर एडमिन",
        "sub_admin": "सब-एडमिन",
        "senior_member": "वरिष्ठ सदस्य",
        "junior_member": "कनिष्ठ सदस्य",
        "buyer": "प्लॉट खरीदार"
      }
    },
    "hero": {
      "badge": "स्वीकृत आवासीय टाउनशिप एवं भूमि विकास",
      "title": "अपने सपनों का आवासीय प्लॉट खरीदें सुव्यवस्थित सुविधाओं के साथ",
      "titleHighlight": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड",
      "subtitle": "30 फीट चौड़ा मुख्य मार्ग, 25 फीट आंतरिक सड़कें, मीठा पानी, बिजली, नाली और तुरंत रजिस्ट्री की तैयारी के साथ रामपुर, लहरतारा एवं मिर्ज़ा मुराद में।",
      "explorePlots": "मास्टर लेआउट प्लान देखें",
      "townshipLocations": "टाउनशिप लोकेशन्स",
      "bookVisit": "मुफ्त साइट विजिट बुक करें",
      "sampleElevations": "वास्तुशिल्प मार्गदर्शन",
      "directDesk": "सीधा बिक्री केंद्र:",
      "immediateAssistance": "त्वरित साइट विजिट सहायता",
      "whatsappDesk": "व्हाट्सएप सहायता केंद्र",
      "watch3d": "3D मकान डिज़ाइन देखें"
    },
    "locations": {
      "badge": "शाखा नेटवर्क",
      "title": "वाराणसी में हमारे शाखा कार्यालय एवं सहायता केंद्र",
      "subtitle": "प्लॉट रजिस्ट्री परामर्श, मूल दस्तावेज़ सत्यापन एवं साइट विजिट प्रस्थान के लिए हमारे नजदीकी शाखा कार्यालय पर संपर्क करें।",
      "branchOffice": "शाखा कार्यालय",
      "callBranch": "शाखा पर कॉल करें",
      "visitBranch": "इस शाखा से साइट विजिट बुक करें",
      "officeHours": "कार्यालय समय: प्रातः 9:30 से सायं 6:30 (सोम – शनि)",
      "servicesTitle": "शाखा सेवाएं एवं परामर्श"
    },
    "masterPlan": {
      "badge": "55 स्वीकृत प्लॉट्स",
      "title": "एकेजीवी इन्फ्रा सिटी वाराणसी — सम्पूर्ण मास्टर लेआउट प्लान",
      "subtitle": "स्वीकृत ब्लूप्रिंट स्केल: 1:500 | कुल क्षेत्रफल: 77,550 वर्गफुट | ई. राजेश कुमार पटेल (आर.पी. होम डिज़ाइन)",
      "viewOriginalPhoto": "मूल विवरणिका फोटो",
      "fullscreen": "फुलस्क्रीन",
      "exitFullscreen": "फुलस्क्रीन बंद करें",
      "viewModes": {
        "plots": "आवासीय प्लॉट्स लेआउट (ज़मीन)",
        "villas": "3D भावी मकान सिमुलेशन (संदर्भ)",
        "cad": "सीएडी ब्लूप्रिंट दृश्य",
        "landscape": "हरियाली सैटेलाइट दृश्य"
      },
      "plotTapInstruction": "💡 किसी भी प्लॉट पर टैप/क्लिक करें — वह 3D विला डिज़ाइन और विवरण के साथ बड़ा (Enlarge) हो जाएगा।",
      "plotsSalesOnlyNotice": "केवल ज़मीन/प्लॉट्स की बिक्री • संपूर्ण इंफ्रास्ट्रक्चर",
      "legend": {
        "available": "हरा: उपलब्ध",
        "booked": "पीला: बुक",
        "reserved": "लाल: आरक्षित / रिक्त"
      },
      "statusLabels": {
        "available": "बुकिंग हेतु उपलब्ध",
        "booked": "बुक किया जा चुका है",
        "reserved": "आरक्षित / रिक्त"
      },
      "vastu": {
        "approved100": "100% वास्तु स्वीकृत",
        "eastNote": "पूर्व मुखी: उत्तम स्वास्थ्य, सकारात्मक ऊर्जा एवं समृद्धि कारक।",
        "northNote": "उत्तर मुखी: कुबेर देवता का वास; धन-धान्य एवं व्यापार वृद्धि हेतु सर्वोत्तम।",
        "southNote": "दक्षिण मुखी: एलिवेटेड प्रवेश द्वार प्रस्तावित; उच्च ऊर्जा एवं दीर्घायु।",
        "generalNote": "संतुलित ऊर्जा संरेखण एवं चौड़ा फ्रंट।"
      },
      "showDimensions": "नाप (साइज)",
      "showVehicles": "गाड़ियां",
      "showLandscaping": "पेड़-पौधे",
      "filters": {
        "allBlocks": "सभी ब्लॉक",
        "allStatus": "सभी स्थिति",
        "availableOnly": "केवल उपलब्ध (हरा)",
        "bookedOnly": "केवल बुक (पीला)",
        "vacantOnly": "खाली / आरक्षित (लाल)",
        "allSizes": "सभी साइज",
        "compactSize": "छोटा (<1000 वर्गफुट)",
        "midSize": "मध्यम (1000-1500 वर्गफुट)",
        "luxurySize": "बड़ा (1500+ वर्गफुट)",
        "searchPlaceholder": "प्लॉट नंबर खोजें (उदा. A-04, C-12)...",
        "reset": "ज़ूम रीसेट करें"
      },
      "inspector": {
        "selectedPlotHeader": "प्लॉट विवरण",
        "block": "ब्लॉक",
        "cornerPlot": "कॉर्नर प्लॉट",
        "vastuTitle": "वास्तु अनुकूलता",
        "totalArea": "कुल प्लॉट क्षेत्रफल",
        "squareYards": "वर्ग गज",
        "dimensions": "प्लॉट नाप",
        "dimensionsSub": "लंबाई x चौड़ाई",
        "roadFrontage": "सामने की सड़क",
        "roadFrontageSub": "पक्की डामर सड़क एवं नाली",
        "basePrice": "आधार मूल्य (रुपये)",
        "sampleElevationTitle": "प्रस्तावित मकान डिज़ाइन (केवल संदर्भ हेतु)",
        "sampleElevationNote": "*एकेजीवी इन्फ्रा सिटी केवल प्लॉट्स बेचती है। आप अपने खरीदे गए प्लॉट पर इस प्रकार का सुंदर मकान स्वयं बनवा सकते हैं।",
        "estimatedConstruction": "अनुमानित निर्माण",
        "inspect3dBtn": "3D दृश्य",
        "holdPlotBtn": "प्लॉट ऑनलाइन होल्ड / बुक करें (72 घंटे का टोकन)",
        "vacantNotice": "यह प्लॉट वर्तमान में आरक्षित है। कृपया हरे रंग के उपलब्ध प्लॉट्स देखें।",
        "scheduleVisitBtn": "साइट विजिट बुक करें",
        "areaScheduleTitle": "क्षेत्रफल विवरण (ब्लूप्रिंट सत्यता)",
        "scaleText": "स्केल 1:500",
        "townshipArea": "कुल टाउनशिप क्षेत्रफल:",
        "netPlotArea": "शुद्ध प्लॉट क्षेत्रफल:",
        "internalRoadArea": "आंतरिक सड़क क्षेत्रफल:",
        "roadRatio": "सड़क क्षेत्रफल अनुपात:",
        "sloganTitle": "अपने सपनों का प्लॉट खरीदें",
        "sloganSubtitle": "सुव्यवस्थित प्लॉट्स अफोर्डेबल रेट्स में | शांत, सुरक्षित एवं विकासशील क्षेत्र | पानी, बिजली, नाली की सुविधाएं उपलब्ध",
        "emptyPrompt": "प्लॉट की नाप, सड़क की चौड़ाई और 3D मकान डिज़ाइन देखने के लिए मास्टर प्लान पर किसी भी प्लॉट को चुनें।",
        "enlargeBtn": "बड़ा करें"
      },
      "spotlightModal": {
        "title": "3D विला वास्तुशिल्प एलिवेशन स्पॉटलाइट",
        "enlargeBtn": "3D विला बड़ा करें",
        "plotDimensions": "प्लॉट की नाप",
        "lengthWidth": "लंबाई x चौड़ाई",
        "totalArea": "कुल क्षेत्रफल",
        "squareYards": "वर्ग गज",
        "proposedBoulevard": "प्रस्तावित मुख्य मार्ग",
        "drainageLights": "नाली एवं सोलर लाइट्स",
        "bookingStatus": "बुकिंग स्थिति",
        "immediateRegistry": "तुरंत रजिस्ट्री उपलब्ध",
        "plotValue": "प्लॉट मूल्य",
        "importantNoticeTitle": "महत्वपूर्ण सूचना:",
        "importantNoticeText": "एकेजीवी इन्फ्रा सिटी केवल स्वीकृत आवासीय प्लॉट्स (ज़मीन) की बिक्री करती है। ऊपर दिखाया गया 3D विला आपकी भावी निर्माण योजना एवं वास्तु अनुकूलन को समझने हेतु एक वास्तुशिल्प सिमुलेशन (Sample Architectural Elevation) है।",
        "holdBtn": "प्लॉट टोकन होल्ड करें (72 घंटे)",
        "whatsAppBtn": "व्हाट्सएप पूछताछ",
        "orbitViewerBtn": "360° 3D ऑर्बिट व्यूअर"
      },
      "brochureModal": {
        "modalTitle": "स्वीकृत मूल विवरणिका फोटो — एकेजीवी इन्फ्रा सिटी",
        "tabLayout": "ब्लूप्रिंट लेआउट प्लान",
        "tabPhoto": "भौतिक पीली विवरणिका फोटो",
        "tabRewards": "11-स्तरीय रिवार्ड्स एवं कमीशन प्लान",
        "footerNotice": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड द्वारा प्रदान किए गए प्रामाणिक दस्तावेज़।",
        "scaleArea": "स्केल 1:500 | कुल क्षेत्रफल: 77,550 वर्गफुट"
      }
    },
    "houseViewer": {
      "badge": "सैंपल एलिवेशन सिमुलेशन",
      "title": "3D भावी मकान सिमुलेशन",
      "subtitle": "प्लॉट पर प्रस्तावित एलिवेशन",
      "fitApproved": "प्लॉट-साइज स्वीकृत",
      "fitFailed": "इस मॉडल के लिए प्लॉट साइज कम है",
      "noticeBadge": "प्लॉट बिक्री नीति",
      "noticeText": "एकेजीवी इन्फ्रा सिटी केवल पूर्ण विकसित और स्वीकृत आवासीय प्लॉट्स की बिक्री करती है। कंपनी मकान निर्माण नहीं करती है। यह 3D सिमुलेशन केवल यह दर्शाने के लिए है कि आपके खरीदे गए प्लॉट पर भविष्य का मकान (वास्तु, सेटबैक व कार पार्किंग) कैसा बन सकता है।",
      "noticeTag": "केवल टाउनशिप प्लॉट्स",
      "chooseModel": "प्रस्तावित मकान मॉडल चुनें",
      "simulateOnPlot": "प्लॉट पर सिमुलेट करें",
      "finishesLabel": "बाहरी रंग व फिनिशिंग",
      "highlightsTitle": "वास्तुशिल्प विशेषताएं:",
      "canvasHoldBtn": "प्लॉट होल्ड करें",
      "canvasGuide": "सैंपल 3D डिज़ाइन • एकेजीवी केवल प्लॉट बेचती है",
      "drawerHoldBtn": "प्लॉट पर 72 घंटे का होल्ड लगाएं",
      "drawerWhatsAppBtn": "व्हाट्सएप पर प्लॉट की जानकारी लें"
    },
    "loanCalc": {
      "badge": "वित्तीय योजना कैलकुलेटर",
      "title": "बैंक लोन, ईएमआई एवं स्टाम्प शुल्क कैलकुलेटर",
      "subtitle": "वाराणसी में अपने प्लॉट के लिए मासिक किस्त (EMI), ऋण पात्रता और उत्तर प्रदेश सरकारी रजिस्ट्री स्टाम्प ड्यूटी की गणना करें।",
      "bankAssistance": "बैंक लोन सहायता",
      "bankAssistanceSub": "अग्रणी सरकारी एवं निजी बैंकों से सहायता",
      "propertyValuation": "प्लॉट / भूमि का मूल्य",
      "downPayment": "डाउन पेमेंट (प्रारंभिक जमा)",
      "tenure": "लोन अवधि",
      "years": "वर्ष",
      "months": "महीने",
      "interestRate": "वार्षिक ब्याज दर",
      "stampDutyTitle": "उत्तर प्रदेश स्टाम्प ड्यूटी कैलकुलेटर",
      "stampDutyDept": "उत्तर प्रदेश राजस्व विभाग",
      "femaleRegistry": "महिला / संयुक्त रजिस्ट्री",
      "femaleDesc": "6% स्टाम्प + 1% रजिस्ट्री शुल्क (1% छूट)",
      "maleRegistry": "पुरुष रजिस्ट्री",
      "maleDesc": "7% स्टाम्प + 1% रजिस्ट्री शुल्क",
      "estimatedRepayment": "अनुमानित भुगतान",
      "monthlyEmiTitle": "मासिक किस्त (EMI)",
      "perMonth": "/ महीना",
      "forPrincipal": "कुल लोन राशि:",
      "principalLoanAmount": "मूल लोन राशि:",
      "totalInterestPayable": "कुल देय ब्याज:",
      "totalAmountPayable": "कुल देय राशि (मूल + ब्याज):",
      "estRegistryCost": "अनुमानित रजिस्ट्री व स्टाम्प शुल्क (यूपी):",
      "checkEligibilityWhatsApp": "व्हाट्सएप पर लोन पात्रता जांचें",
      "approvedBanksTitle": "वाराणसी में सहयोगी बैंक",
      "rateDisclaimer": "*ब्याज दरें आवेदक के सिबिल स्कोर (750+) और बैंक नियमों के अधीन हैं।"
    },
    "trust": {
      "badge": "उत्कृष्ट मानक",
      "title": "ग्राहक एकेजीवी इन्फ्रा सिटी को क्यों चुनते हैं?",
      "subtitle": "वाराणसी में तेज़ पूंजीगत वृद्धि, कानूनी पारदर्शिता और शांत पारिवारिक जीवन के लिए विकसित टाउनशिप।",
      "verifiedStandard": "प्रमाणित टाउनशिप मानक",
      "pillars": [
        {
          "title": "30ft व 25ft चौड़ी सड़कें",
          "desc": "स्वीकृत ब्लूप्रिंट के अनुसार 30 फीट मुख्य प्रवेश मार्ग और 25 फीट आंतरिक मार्ग, मजबूत आरसीसी एवं डामर से निर्मित।",
          "highlight": "27.82% सड़क अनुपात"
        },
        {
          "title": "100% फ्रीहोल्ड मालिकाना हक",
          "desc": "विवाद रहित स्वच्छ कानूनी दस्तावेज। तुरंत रजिस्ट्री और दाखिल-खारिज (म्यूटेशन) की पूर्ण प्रशासनिक सहायता।",
          "highlight": "स्पष्ट कानूनी टाइटल"
        },
        {
          "title": "भूमिगत बिजली व सोलर लाइट्स",
          "desc": "साइट पर समर्पित विद्युत ट्रांसफार्मर, भूमिगत वायरिंग और सभी सड़कों पर स्वचालित सोलर स्ट्रीट लाइट्स।",
          "highlight": "24/7 बिजली तैयार"
        },
        {
          "title": "हरियाली व पार्क बफर",
          "desc": "टाउनशिप की सीमा पर 15 फीट 10 इंच का सुंदर वनस्पति बफर, छायादार वृक्ष और जॉगिंग ट्रैक।",
          "highlight": "15'10\" ग्रीन बफर"
        },
        {
          "title": "100% वास्तु स्वीकृत लेआउट",
          "desc": "ई. राजेश कुमार पटेल द्वारा तैयार, पूर्व और उत्तर दिशा वाले प्लॉट्स जो प्राकृतिक रोशनी और हवा सुनिश्चित करते हैं।",
          "highlight": "ई. राजेश पटेल मोहर"
        },
        {
          "title": "मीठा पानी व भूमिगत नाली",
          "desc": "मीठे पेयजल के लिए गहरे बोरवेल और जलभराव रोकने के लिए वैज्ञानिक रूप से बनाई गई भूमिगत जलनिकासी प्रणाली।",
          "highlight": "जलभराव मुक्त"
        }
      ],
      "proximityBadge": "प्राइम कनेक्टिविटी",
      "proximityTitle": "वाराणसी के प्रमुख केंद्रों से निकटता",
      "proximitySub": "रेलवे स्टेशनों, राष्ट्रीय राजमार्गों, अस्पतालों और विश्वविद्यालयों तक त्वरित पहुंच।",
      "scheduleVisitBtn": "मुफ्त साइट विजिट बुक करें",
      "connectivity": [
        {
          "name": "वाराणसी कैंट रेलवे स्टेशन",
          "dist": "15 मिनट",
          "type": "रेलवे जंक्शन"
        },
        {
          "name": "बनारस रेलवे स्टेशन (मंडुआडीह)",
          "dist": "12 मिनट",
          "type": "सुपरफास्ट ट्रेनें"
        },
        {
          "name": "NH-19 (जीटी रोड एक्सप्रेसवे)",
          "dist": "5 मिनट",
          "type": "राष्ट्रीय राजमार्ग"
        },
        {
          "name": "बीएचयू एवं सर सुंदरलाल अस्पताल",
          "dist": "20 मिनट",
          "type": "शीर्ष स्वास्थ्य सेवा"
        },
        {
          "name": "लालबहादुर शास्त्री हवाई अड्डा (बाबतपुर)",
          "dist": "35 मिनट",
          "type": "अंतरराष्ट्रीय उड़ानें"
        },
        {
          "name": "रिंग रोड फेज-2 वाराणसी",
          "dist": "8 मिनट",
          "type": "सिग्नल-फ्री मार्ग"
        }
      ],
      "reviewsBadge": "आधिकारिक कॉर्पोरेट गारंटी",
      "reviewsTitle": "हमारी 100% कानूनी एवं कब्ज़ा प्रतिबद्धताएं",
      "reviewsSub": "स्वीकृत मास्टर प्लान के अंतर्गत एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड द्वारा दी जाने वाली प्रत्यक्ष वैधानिक गारंटी।",
      "verifiedBuyer": "आधिकारिक गारंटी",
      "reviews": [
        {
          "name": "100% फ्रीहोल्ड मालिकाना हक एवं तत्काल रजिस्ट्री",
          "role": "कानूनी रजिस्ट्री विभाग, वाराणसी",
          "plot": "उप-निबंधक कार्यालय (सबरजिस्ट्रार), वाराणसी",
          "date": "वैधानिक प्रतिबद्धता",
          "review": "सभी 55 सीमांकित भूखंड 100% स्पष्ट फ्रीहोल्ड मालिकाना हक के साथ हैं, जिन पर कोई बैंक बंधक या विवाद नहीं है। उप-निबंधक विलेख निष्पादन एवं दाखिल-खारिज प्रमाणन हेतु संपूर्ण कानूनी सहायता प्रदान की जाती है।"
        },
        {
          "name": "ई. राजेश कुमार पटेल द्वारा प्रमाणित ब्लूप्रिंट",
          "role": "मुख्य वास्तुकार (आर.पी. होम डिज़ाइन)",
          "plot": "पैमाना 1:500 सीमांकित लेआउट",
          "date": "इंजीनियरिंग गारंटी",
          "review": "77,550 वर्गफीट भूमि पर निर्मित, जिसका 27.82% हिस्सा आंतरिक सड़कों को समर्पित है। प्रत्येक प्लॉट पर पत्थर के खंभे का सीमांकन, 30 फीट चौड़ा प्रवेश मार्ग और 25 फीट चौड़ी सेक्टर सड़कें उपलब्ध हैं।"
        },
        {
          "name": "वाराणसी में 3 प्रत्यक्ष भौतिक शाखा कार्यालय",
          "role": "ग्राहक सेवा एवं दस्तावेज़ सत्यापन",
          "plot": "रामपुर • लहरतारा • मिर्ज़ा मुराद",
          "date": "प्रत्यक्ष शाखा सेवा",
          "review": "दस्तावेज़ों के भौतिक निरीक्षण, भुगतान रसीद और कंपनी के वाहनों में साइट विजिट के लिए रामपुर स्थित हमारे पंजीकृत मुख्य कार्यालय या लहरतारा (कैंट के पास) और मिर्ज़ा मुराद (एनएच-19) शाखाओं में पधारें।"
        }
      ]
    },
    "certificate": {
      "modalTitleGenerating": "त्वरित प्लॉट होल्ड बुकिंग",
      "modalTitleGenerated": "आधिकारिक 72-घंटे का प्लॉट होल्ड प्रमाण पत्र",
      "selectedAsset": "चयनित प्लॉट",
      "basePrice": "आधार मूल्य",
      "area": "क्षेत्रफल:",
      "dimensions": "नाप:",
      "facing": "दिशा:",
      "buyerName": "खरीदार का पूरा नाम",
      "buyerNamePlaceholder": "उदा. रमेश चंद्र शर्मा",
      "mobileNumber": "मोबाइल नंबर (व्हाट्सएप नंबर)",
      "mobilePlaceholder": "उदा. 9839123456",
      "sampleElevationIdea": "प्रस्तावित मकान डिज़ाइन (वैकल्पिक — केवल संदर्भ हेतु)",
      "sampleElevationDisclaimer": "*सूचना: एकेजीवी इन्फ्रा सिटी केवल आवासीय प्लॉट्स बेचती है। मकान निर्माण खरीदार स्वयं अपनी पसंद से कराते हैं।",
      "guaranteeTitle": "शून्य-जोखिम 72-घंटे का कानूनी प्लॉट होल्ड",
      "guaranteeDesc": "आवासीय प्लॉट #{plotNumber} 72 घंटों के लिए आपके नाम पर सुरक्षित कर दिया जाएगा। एकेजीवी इन्फ्रा सिटी 30ft/25ft चौड़ी सड़कों, मीठे पानी, नाली और पक्की रजिस्ट्री के साथ जमीन उपलब्ध कराती है।",
      "cancelBtn": "रद्द करें",
      "generateBtn": "72-घंटे का होल्ड प्रमाण पत्र बनाएं",
      "countdownLabel": "होल्ड समाप्ति समय:",
      "watermarkCrest": "एकेजीवी",
      "certBadge": "आधिकारिक अस्थायी होल्डिंग प्रमाण पत्र",
      "companyHeader": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड",
      "companySub": "टाउनशिप विकास एवं बुनियादी ढांचा • वाराणसी (उ.प्र.) | फोन: +91 6306917991",
      "refNo": "संदर्भ संख्या:",
      "allocatedPlot": "आवंटित प्लॉट",
      "plotAreaLabel": "प्लॉट क्षेत्रफल",
      "beneficiary": "लाभार्थी (क्रेता)",
      "plotValuationLabel": "प्लॉट का आधार मूल्य",
      "tokenPayableLabel": "टोकन राशि:",
      "frontageRoad": "सामने की सड़क:",
      "approvedFacing": "दिशा (100% वास्तु स्वीकृत)",
      "plannerNote": "स्वीकृत लेआउट प्लान: ई. राजेश कुमार पटेल (आर.पी. होम डिज़ाइन) • कुल टाउनशिप: 77,550 वर्गफुट",
      "digitalRegistered": "डिजिटल होल्ड पंजीकृत",
      "validityNotice": "जारी होने से 72 घंटे तक वैध",
      "authorizedEngineer": "अधिकृत पंजीकृत सिविल इंजीनियर",
      "sendWhatsAppCta": "व्हाट्सएप पर प्रमाण पत्र भेजें (+91 6306917991)",
      "printCertBtn": "प्रमाण पत्र प्रिंट करें",
      "openBuyerPortalBtn": "क्रेता पोर्टल खोलें"
    },
    "whatsAppPopup": {
      "buttonLabel": "व्हाट्सएप पर चैट करें (6306917991)",
      "title": "एकेजीवी इन्फ्रा सिटी सहायता",
      "onlineStatus": "ऑनलाइन • सीधा व्हाट्सएप",
      "helplineText": "आधिकारिक हेल्पलाइन: +91 6306917991",
      "promptText": "आप सीधे हमारी टीम से व्हाट्सएप पर बात कर सकते हैं। नीचे दिए गए विकल्प चुनें:",
      "chooseTemplate": "पूछताछ का विषय चुनें:",
      "customLabel": "या अपना संदेश लिखें:",
      "customPlaceholder": "अपना संदेश यहां लिखें...",
      "repliesNote": "कुछ ही मिनटों में जवाब • एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड",
      "templates": [
        {
          "id": "book-plot",
          "title": "आवासीय प्लॉट बुक करें",
          "text": "नमस्ते एकेजीवी इन्फ्रा सिटी! मैं वाराणसी (रामपुर / लहरतारा / मिर्ज़ा मुराद) में आवासीय प्लॉट खरीदने का इच्छुक हूं। कृपया उपलब्ध प्लॉट नंबर, नाप और टोकन होल्ड की जानकारी साझा करें।"
        },
        {
          "id": "site-visit",
          "title": "मुफ्त साइट विजिट शेड्यूल करें",
          "text": "नमस्ते! मैं एकेजीवी इन्फ्रा सिटी की साइट देखने के लिए मुफ्त साइट विजिट और कैब पिकअप बुक करना चाहता/चाहती हूं। कृपया तारीख तय करें।"
        },
        {
          "id": "rewards",
          "title": "एसोसिएट रिवार्ड एवं कमीशन प्लान",
          "text": "नमस्ते! मैं एकेजीवी इन्फ्रा सिटी के साथ एसोसिएट सदस्य के रूप में जुड़ना चाहता हूं और 11-लेवल कमीशन प्लान समझना चाहता हूं। कृपया पंजीकरण की जानकारी दें।"
        },
        {
          "id": "joining-kit",
          "title": "₹999 भौतिक जॉइनिंग किट",
          "text": "नमस्ते! कृपया ₹999 की एसोसिएट किट (बैग, पेन, डायरी और प्रोजेक्ट फाइल) के बारे में जानकारी प्रदान करें।"
        }
      ]
    },
    "rewards": {
      "title": "लेवल – कमीशन एवं रिवार्ड प्लान",
      "subtitle": "मेहनत कीजिए, लेवल बढ़ाइए और अपने सपनों का रिवार्ड पाइए!",
      "level": "लेवल",
      "rank": "पद / रैंक",
      "target": "बिजनेस टारगेट",
      "commission": "कमीशन",
      "reward": "रिवार्ड",
      "offlineKitNotice": "जॉइनिंग किट: ₹999 केवल ऑफलाइन नकद लिया जाता है। इसमें बैग, पेन, डायरी और फाइल शामिल है।",
      "headerTagline": "\"मेहनत कीजिए, लेवल बढ़ाइए और अपने सपनों का रिवार्ड पाइए!\"",
      "viewOriginalBrochureBtn": "मूल विवरणिका चार्ट देखें",
      "simulatorTitle": "इंटरएक्टिव प्रदर्शन सिमुलेटर",
      "simulatorSubtitle": "अपनी पात्र कमीशन राशि और अनलॉक उपहार देखें",
      "celebrateBtn": "लेवल उत्सव मनाएं",
      "verifiedVolumeLabel": "कुल सत्यापित बिजनेस वॉल्यूम:",
      "currentTierLabel": "वर्तमान स्तर:",
      "quickPresetsLabel": "त्वरित विकल्प:",
      "commissionRateLabel": "कमीशन दर",
      "brochureLevelLabel": "विवरणिका स्तर",
      "calculatedCommissionLabel": "गणना की गई कमीशन राशि",
      "onBusinessOf": "कुल व्यापार पर:",
      "brochureRewardCardTitle": "विवरणिका उपहार (पूछताछ हेतु क्लिक करें)",
      "clickToEnquire": "पूछताछ / प्लॉट बुकिंग हेतु क्लिक करें",
      "nextMilestone": "अगला लक्ष्य:",
      "needsMore": "आवश्यकता है:",
      "more": "और",
      "officialChartTitle": "आधिकारिक 11-स्तरीय कमीशन एवं रिवार्ड चार्ट",
      "officialChartSubtitle": "प्लॉट बुक करने, पद लक्ष्य निर्धारित करने या व्हाट्सएप पर संपर्क करने हेतु किसी भी स्तर पर क्लिक करें",
      "approvedRanksBadge": "11 स्वीकृत पद • विवरण हेतु किसी पर भी क्लिक करें",
      "actionHeader": "कार्रवाई / बुकिंग",
      "bookAtLevelBtn": "इस स्तर पर प्लॉट बुक करें / विवरण",
      "modalPlotBookingBtn": "व्हाट्सएप पर प्लॉट बुकिंग पूछताछ",
      "modalMasterPlanBtn": "मास्टर प्लान पर प्लॉट देखें",
      "lakhUnit": "लाख",
      "croreUnit": "करोड़"
    },
    "joiningKit": {
      "badge": "ऑफलाइन पारदर्शिता",
      "title": "सदस्य जॉइनिंग किट (₹999 नकद खाता)",
      "subtitle": "भौतिक किट जिसमें बैग, पेन, डायरी और फाइल दी जाती है। यह पूर्णतया ऑफलाइन नकद ली जाती है।",
      "kpiTotalCash": "कुल एकत्रित ऑफलाइन नकद",
      "kpiTreasurySub": "सत्यापित तिजोरी खाता",
      "kpiTotalKits": "कुल वितरित भौतिक किट",
      "kpiAcknowledgedSub": "सदस्यों द्वारा प्राप्त एवं हस्ताक्षरित",
      "kpiStandardAmount": "मानक किट शुल्क",
      "kpiNonCommissionable": "गैर-कमीशन योग्य",
      "kpiInventory": "किट का भौतिक स्टॉक",
      "kpiInStock": "स्टॉक में उपलब्ध",
      "kpiCentralWarehouse": "केंद्रीय कार्यालय गोदाम",
      "recordKitBtn": "नई ₹999 नकद किट दर्ज करें",
      "mandatoryContentsTitle": "अधिकृत सदस्य जॉइनिंग किट की अनिवार्य सामग्री",
      "cashTag": "₹999 नकद ऑफलाइन",
      "bagTitle": "कार्यकारी सदस्य बैग",
      "bagDesc": "एकेजीवी इन्फ्रा सिटी ब्रांडिंग के साथ मजबूत और टिकाऊ लैपटॉप व दस्तावेज़ ब्रीफकेस बैग।",
      "penTitle": "धातु का प्रीमियम एक्जीक्यूटिव पेन",
      "penDesc": "रजिस्ट्री दस्तावेजों और ग्राहक अनुबंधों पर हस्ताक्षर हेतु उच्च गुणवत्ता वाला रोलरबॉल पेन।",
      "diaryTitle": "हार्डबाउंड एक्जीक्यूटिव डायरी",
      "diaryDesc": "ग्राहकों की प्लॉट विजिट और दैनिक बैठकों के विवरण दर्ज करने हेतु स्वर्ण अक्षरों वाली डायरी।",
      "fileTitle": "दस्तावेज़ प्रोजेक्ट फाइल",
      "fileDesc": "स्वीकृत ब्लूप्रिंट, लेआउट नक्शे और मूल्य सूचियों को सुरक्षित रखने हेतु मल्टी-पॉकेट फाइल।"
    },
    "faqs": [
      {
        "q": "क्या एकेजीवी इन्फ्रा सिटी मकान बनाती है या केवल आवासीय प्लॉट्स बेचती है?",
        "a": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड केवल प्रमाणित आवासीय प्लॉट्स (Developed Residential Plots) की बिक्री करती है। हम 30ft व 25ft चौड़ी पक्की सड़कें, भूमिगत नाली, बिजली ट्रांसफार्मर, सोलर स्ट्रीट लाइट्स, मीठा पानी एवं बाउंड्री जैसी पूर्ण टाउनशिप सुविधाएं विकसित करके देते हैं। वेबसाइट पर दिया गया 3D हाउस व्यूअर केवल संदर्भ व विज़ुअलाइज़ेशन के लिए है ताकि आप देख सकें कि आपके प्लॉट पर भविष्य का मकान कैसा बन सकता है। मकान निर्माण खरीदार स्वयं अपनी पसंद से कराते हैं।"
      },
      {
        "q": "एकेजीवी इन्फ्रा सिटी के प्रमुख प्रोजेक्ट कहां स्थित हैं?",
        "a": "प्रमुख टाउनशिप परियोजनाएं रामपुर (30ft मुख्य प्रवेश सड़क के साथ), लहरतारा (कैंट रेलवे स्टेशन के निकट) और मिर्ज़ा मुराद (NH-19 हाईवे के पास औद्योगिक व विकास क्षेत्र) में स्थित हैं।"
      },
      {
        "q": "सड़कों की चौड़ाई और क्या-क्या सुविधाएं दी जाती हैं?",
        "a": "स्वीकृत ब्लूप्रिंट के अनुसार 30 फीट मुख्य मार्ग और 25 फीट आंतरिक मार्ग दिए गए हैं। साथ ही भूमिगत नाली, बिजली ट्रांसफार्मर और घर-घर मीठे पानी की पाइपलाइन तैयार है।"
      },
      {
        "q": "प्लॉट बुकिंग और 72 घंटे के होल्ड की प्रक्रिया क्या है?",
        "a": "ग्राहक हमारे डिजिटल मास्टर प्लान पर उपलब्ध हरे रंग का प्लॉट चुनकर 72 घंटे का होल्ड लगा सकते हैं। भुगतान प्रमाण सत्यापित होने के बाद आधिकारिक रसीद जारी कर दी जाती है।"
      },
      {
        "q": "₹999 की जॉइनिंग किट क्या है और इसका भुगतान कैसे होता है?",
        "a": "₹999 की किट केवल ऑफलाइन नकद ली जाती है। इसमें 1 बैग, 1 पेन, 1 डायरी और 1 प्रोजेक्ट फाइल दी जाती है। इसकी आधिकारिक रसीद पोर्टल में दर्ज होती है।"
      },
      {
        "q": "क्या खरीदार प्लॉट बुक करने से पहले 3D में देख सकते हैं?",
        "a": "जी हां! हमारे 3D व्यूअर में आप 360 डिग्री में देख सकते हैं कि आपके चुने गए प्लॉट की चौड़ाई व लंबाई पर भविष्य का मकान कैसा दिखेगा।"
      }
    ],
    "ctaBanner": {
      "title": "क्या आप वाराणसी में अपना प्लॉट सुरक्षित करने के लिए तैयार हैं?",
      "subtitle": "आज ही रामपुर, लहरतारा या मिर्ज़ा मुराद में हमारे प्रतिनिधियों के साथ मुफ्त साइट विजिट करें।",
      "callBtn": "कॉल करें",
      "siteVisitBtn": "ऑनलाइन साइट विजिट बुक करें"
    },
    "footer": {
      "tagline": "उत्तर प्रदेश में 30 फीट एवं 25 फीट चौड़ी पक्की सड़कें, भूमिगत बिजली, मीठा पानी और पारदर्शी तुरंत रजिस्ट्री के साथ सुनियोजित आवासीय कॉलोनियां विकसित करने वाले अग्रणी टाउनशिप डेवलपर्स।",
      "bookingLine": "आधिकारिक बुकिंग हेल्पलाइन",
      "locationsTitle": "प्रोजेक्ट लोकेशन्स",
      "portalsTitle": "पोर्टल्स एवं टूल्स",
      "masterPlanLink": "इंटरएक्टिव मास्टर प्लान",
      "houseViewerLink": "3D वास्तुशिल्प प्लॉट-फिट विज़ुअलाइज़र",
      "rewardsLink": "लेवल कमीशन एवं रिवार्ड्स",
      "joiningKitLink": "ऑफलाइन जॉइनिंग किट (₹999 नकद)",
      "buyerPortalLink": "क्रेता पोर्टल एवं बुकिंग स्थिति",
      "memberPortalLink": "सदस्य पदानुक्रम एवं डिजिटल पहचान",
      "adminPortalLink": "सुपर एडमिन कंट्रोल सेंटर",
      "complianceTitle": "कानूनी नीतियां एवं अनुपालन",
      "privacyPolicy": "गोपनीयता नीति (Privacy Policy)",
      "termsConditions": "नियम एवं शर्तें (Terms & Conditions)",
      "bookingPolicy": "बुकिंग एवं रद्दीकरण नीति",
      "grievanceSupport": "शिकायत निवारण एवं ग्राहक सहायता",
      "blueprintRefTitle": "प्रमाणित ब्लूप्रिंट संदर्भ",
      "blueprintRefText": "ए.के.जी.वी. इन्फ्रा सिटी वाराणसी का लेआउट प्लान ई. राजेश कुमार पटेल (आर.पी. होम डिज़ाइन) द्वारा अधिकृत है।",
      "disclaimer": "एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड उत्तर प्रदेश में सुव्यवस्थित एवं सुरक्षित टाउनशिप विकास के लिए प्रतिबद्ध है। कंपनी केवल स्वीकृत आवासीय प्लॉट्स बेचती है। प्लॉट उपलब्धता एवं दरें प्रशासनिक सत्यापन और आधिकारिक रजिस्ट्री के अधीन हैं।",
      "allRights": "सर्वाधिकार सुरक्षित। एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड।"
    },
    "mobileNav": {
      "home": "होम",
      "plots": "प्लॉट्स",
      "projects": "लोकेशन्स",
      "siteVisit": "साइट विजिट",
      "emiCalc": "ईएमआई",
      "portal": "डैशबोर्ड"
    },
    "architecturalGuidance": {
      "badge": "प्लॉट निर्माण मार्गदर्शन",
      "title": "आपके खरीदे गए प्लॉट के लिए वास्तुशिल्प मार्गदर्शन",
      "subtitle": "देखें कि आपके खरीदे गए प्लॉट पर भविष्य का मकान, कार पोर्च और वास्तु दिशा कैसे व्यवस्थित हो सकते हैं।",
      "policyBadge": "प्लॉट बिक्री नीति",
      "policyTitle": "महत्वपूर्ण कंपनी नीति:",
      "policyNotice": "एकेजीवी इन्फ्रा सिटी केवल स्वीकृत आवासीय प्लॉट्स (ज़मीन) विकसित करके बेचती है। कंपनी मकान निर्माण नहीं करती है। मकान निर्माण खरीदार स्वयं अपनी पसंद और बजट से स्वतंत्र रूप से कराते हैं।",
      "visualizerIntro": "ज़मीन खरीदने से पहले सेटबैक, कार पार्किंग, बगीचे और वास्तु दिशा को समझने में आपकी सहायता के लिए, हमारा 3D प्लॉट-फिट सिमुलेशन टूल देखें कि आपके चुने गए प्लॉट साइज पर कैसा सुंदर मकान बन सकता है।",
      "exploreVisualizerBtn": "3D प्लॉट-फिट विज़ुअलाइज़र खोलें",
      "sampleTag": "केवल संदर्भ हेतु सैंपल एलिवेशन",
      "models": [
        {
          "name": "कॉम्पैक्ट 2-BHK विला",
          "suitablePlot": "1,000 वर्गफुट से छोटे प्लॉट्स (उदा. 20x40 फीट)",
          "desc": "पूर्व/उत्तर मुखी सिंगल-फ्लोर लेआउट, कार पार्किंग पोर्च और टेरेस गार्डन।"
        },
        {
          "name": "एग्जीक्यूटिव 3-BHK डुप्लेक्स",
          "suitablePlot": "1,000 - 1,500 वर्गफुट प्लॉट्स (उदा. 25x50 फीट)",
          "desc": "डबल-हाइट लिविंग हॉल, 2-कार पार्किंग और खुला वेंटिलेशन सेटबैक।"
        },
        {
          "name": "इंपीरियल 4-BHK लक्ज़री विला",
          "suitablePlot": "1,500+ वर्गफुट के बड़े प्लॉट्स (उदा. 30x60 फीट)",
          "desc": "भव्य प्रवेश लॉबी, निजी लॉन और सर्वेंट क्वार्टर के साथ।"
        }
      ]
    },
    "faqSection": {
      "title": "अक्सर पूछे जाने वाले प्रश्न",
      "subtitle": "प्लॉट बुकिंग, रजिस्ट्री प्रक्रिया और टाउनशिप सुविधाओं से जुड़े स्पष्ट उत्तर।"
    }
  },
  "hinglish": {
    "brandName": "AKGV Infra City",
    "companyLegalName": "AKGV Infra City Private Limited",
    "tagline": "Where Dreams Find Their Address",
    "phoneLabel": "Call us: +91 6306917991",
    "nav": {
      "home": "Home",
      "projects": "Projects",
      "masterPlan": "Master Plan",
      "houseViewer3d": "3D Elevation",
      "villa3d": "3D Villa",
      "siteVisit": "Site Visit",
      "rewards": "Rewards & Commission",
      "joiningKit": "Joining Kit",
      "about": "Hamare Baare Me",
      "contact": "Contact Karein",
      "portalLogin": "Login Portal",
      "buyerPortal": "Buyer Portal",
      "memberPortal": "Member Portal",
      "adminPortal": "Super Admin",
      "dashboard": "Dashboard Kholein",
      "account": "Account",
      "signOut": "Sign Out",
      "roleSimulator": "Role:",
      "switchRoleTitle": "Switch Active Role",
      "roleLabels": {
        "super_admin": "Super Admin",
        "sub_admin": "Sub-Admin",
        "senior_member": "Senior Member",
        "junior_member": "Junior Member",
        "buyer": "Plot Buyer"
      }
    },
    "hero": {
      "badge": "UP Ka Most Trusted Plotted Township Project",
      "title": "Apne Sapno Ka Residential Plot Kharidein Ready Infrastructure Ke Sath",
      "titleHighlight": "AKGV Infra City Private Limited",
      "subtitle": "30ft wide main road, 25ft internal roads, meethe pani, bijli, nali aur clean registry readiness. Rampur, Lahartara aur Mirza Murad ke prime corridors me.",
      "explorePlots": "Explore Plotted Master Plan",
      "townshipLocations": "Township Locations",
      "bookVisit": "Book Site Visit",
      "sampleElevations": "Architectural Guidance",
      "directDesk": "Direct Sales Desk:",
      "immediateAssistance": "Immediate Site Visit Assistance",
      "whatsappDesk": "WhatsApp Inquiry Desk",
      "watch3d": "Launch 3D Elevation Viewer"
    },
    "locations": {
      "badge": "Regional Branch Network",
      "title": "Hamare Branch Offices & Helpdesks (Varanasi)",
      "subtitle": "Plot registry consultation, genuine document verification aur site visit ke liye nearest branch office visit karein.",
      "branchOffice": "Branch Office",
      "callBranch": "Branch ko Call Karein",
      "visitBranch": "Is Branch se Site Visit Book Karein",
      "officeHours": "Office Hours: 9:30 AM – 6:30 PM (Mon – Sat)",
      "servicesTitle": "Branch Services & Consultation"
    },
    "masterPlan": {
      "badge": "55 Approved Plots",
      "title": "A.K.G.V. INFRA CITY VARANASI — COMPLETE MASTER LAYOUT PLAN",
      "subtitle": "Approved Blueprint Scale: 1:500 | Area: 77,550 sqft | Er. Rajesh Kumar Patel (R.P. Home Design)",
      "viewOriginalPhoto": "Original Brochure Photo",
      "fullscreen": "Fullscreen",
      "exitFullscreen": "Exit Fullscreen",
      "viewModes": {
        "plots": "Plotted Layout (Residential Land)",
        "villas": "3D Future Home Simulation (Reference)",
        "cad": "CAD Blueprint View",
        "landscape": "Satellite Landscape View"
      },
      "plotTapInstruction": "💡 Kisi bhi plot par tap/click karein — woh 3D villa design aur details ke saath bada (Enlarge) ho jayega.",
      "plotsSalesOnlyNotice": "Sirf Plots Ki Bikri • Infrastructure Ready",
      "legend": {
        "available": "Green: Available",
        "booked": "Yellow: Booked",
        "reserved": "Red: Vacant / Reserved"
      },
      "statusLabels": {
        "available": "Booking Ke Liye Available",
        "booked": "Book Ho Chuka Hai",
        "reserved": "Reserved / Vacant"
      },
      "vastu": {
        "approved100": "100% Vastu Approved",
        "eastNote": "East facing: Health, morning positive energy aur prosperity ke liye best.",
        "northNote": "North facing: Governed by Kuber; wealth aur business growth ke liye ideal.",
        "southNote": "South facing: Elevated entry design recommended; high energy & vitality.",
        "generalNote": "Balanced energy alignment with wide road frontage."
      },
      "showDimensions": "Dimensions",
      "showVehicles": "Vehicles",
      "showLandscaping": "Greenery",
      "filters": {
        "allBlocks": "All Blocks",
        "allStatus": "All Status",
        "availableOnly": "Available Only (Green)",
        "bookedOnly": "Booked Only (Yellow)",
        "vacantOnly": "Vacant / Reserved (Red)",
        "allSizes": "All Sizes",
        "compactSize": "Compact (<1000 sqft)",
        "midSize": "Mid-Sized (1000-1500 sqft)",
        "luxurySize": "Luxury (1500+ sqft)",
        "searchPlaceholder": "Search plot number (e.g. A-04, C-12)...",
        "reset": "Reset Zoom & View"
      },
      "inspector": {
        "selectedPlotHeader": "Plot Details",
        "block": "Block",
        "cornerPlot": "Corner Plot",
        "vastuTitle": "Vastu Compliance",
        "totalArea": "Total Plot Area",
        "squareYards": "Square Yards (Gaj)",
        "dimensions": "Dimensions",
        "dimensionsSub": "Length x Width",
        "roadFrontage": "Road Frontage",
        "roadFrontageSub": "Asphalt Road with Drainage",
        "basePrice": "Base Price (INR)",
        "sampleElevationTitle": "Sample House Elevations (Reference Only)",
        "sampleElevationNote": "*AKGV Infra City strictly plots sell karti hai. Aap is type ka makaan apne plot par khud banwa sakte hain.",
        "estimatedConstruction": "Est. Construction",
        "inspect3dBtn": "3D Preview",
        "holdPlotBtn": "Hold / Book Plot Online (72h Token Hold)",
        "vacantNotice": "Ye plot currently reserved hai. Green available plots check karein ya support se baat karein.",
        "scheduleVisitBtn": "Schedule an On-Site Visit",
        "areaScheduleTitle": "AREA SCHEDULE (BLUEPRINT GROUND TRUTH)",
        "scaleText": "Scale 1:500",
        "townshipArea": "Total Township Area:",
        "netPlotArea": "Net Plot Area:",
        "internalRoadArea": "Internal Road Area:",
        "roadRatio": "Road Area Ratio:",
        "sloganTitle": "Apne Sapno Ka Plot Kharidein",
        "sloganSubtitle": "Suvyavasthit plots affordable rates me | Safe, peaceful aur developing area | Pani, bijli, nali ready",
        "emptyPrompt": "Plot ke dimensions, road width aur 3D house design dekhne ke liye master plan par kisi bhi plot ko select karein.",
        "enlargeBtn": "Enlarge"
      },
      "spotlightModal": {
        "title": "3D Villa Architectural Elevation Spotlight",
        "enlargeBtn": "3D Villa Enlarge Karein",
        "plotDimensions": "Plot Dimensions",
        "lengthWidth": "Length x Width",
        "totalArea": "Total Area",
        "squareYards": "Square Yards (Gaj)",
        "proposedBoulevard": "Proposed Boulevard",
        "drainageLights": "Drainage & Solar Lights",
        "bookingStatus": "Booking Status",
        "immediateRegistry": "Immediate Registry Ready",
        "plotValue": "Plot Value",
        "importantNoticeTitle": "Important Notice:",
        "importantNoticeText": "AKGV Infra City strictly approved residential plots (zameen) sell karti hai. Upar dikhaya gaya 3D villa aapke future home construction aur Vastu fit ko samajhne ke liye ek architectural sample simulation hai.",
        "holdBtn": "Plot Hold Karein (72h Token Hold)",
        "whatsAppBtn": "WhatsApp Inquiry",
        "orbitViewerBtn": "360° 3D Orbit Viewer"
      },
      "brochureModal": {
        "modalTitle": "Original Approved Brochure Photographs — AKGV Infra City",
        "tabLayout": "Blueprint Layout Plan",
        "tabPhoto": "Physical Yellow Brochure Photo",
        "tabRewards": "11-Tier Rewards & Commission Plan",
        "footerNotice": "AKGV Infra City Private Limited ke authentic approved documents.",
        "scaleArea": "Scale 1:500 | Area: 77,550 sqft"
      }
    },
    "houseViewer": {
      "badge": "Sample Elevation Simulation",
      "title": "3D Future Home Simulation",
      "subtitle": "Sample Elevation on Plot",
      "fitApproved": "Plot-Fit Approved",
      "fitFailed": "Plot Area Insufficient for this Model",
      "noticeBadge": "Plot Sales Policy",
      "noticeText": "AKGV Infra City strictly verified residential plots sell karti hai. Company house construction nahi karti hai. Ye 3D viewer sirf ye dekhne ke liye hai ki aapke plot par future home (Vastu, setback aur parking) kaisa ban sakta hai.",
      "noticeTag": "Township Plots Only",
      "chooseModel": "Choose Sample House Architectural Model",
      "simulateOnPlot": "Simulate on Plot",
      "finishesLabel": "Exterior Palette & Finishes",
      "highlightsTitle": "Architectural Layout Highlights:",
      "canvasHoldBtn": "Hold Plot",
      "canvasGuide": "Sample 3D Elevation • AKGV Infra Sells Plots",
      "drawerHoldBtn": "Place 72-Hour Hold on Plot",
      "drawerWhatsAppBtn": "Inquire About Plot on WhatsApp"
    },
    "loanCalc": {
      "badge": "Financial Planning Calculator",
      "title": "Bank Loan, EMI aur Stamp Duty Calculator",
      "subtitle": "Varanasi me apne plot ke liye monthly EMI, loan eligibility aur UP government stamp duty calculate karein.",
      "bankAssistance": "Bank Loan Assistance",
      "bankAssistanceSub": "Tie-ups with leading PSU & Private Banks",
      "propertyValuation": "Plot / Land Valuation",
      "downPayment": "Down Payment",
      "tenure": "Loan Tenure",
      "years": "Years",
      "months": "Months",
      "interestRate": "Annual Interest Rate",
      "stampDutyTitle": "UP Stamp Duty Calculator",
      "stampDutyDept": "Uttar Pradesh Revenue Dept",
      "femaleRegistry": "Women / Joint Registry",
      "femaleDesc": "6% Stamp + 1% Reg (1% State Subsidy)",
      "maleRegistry": "Male Registry",
      "maleDesc": "7% Stamp + 1% Registration Fee",
      "estimatedRepayment": "Estimated Repayment",
      "monthlyEmiTitle": "Monthly Equated Installment (EMI)",
      "perMonth": "/ month",
      "forPrincipal": "For loan principal of",
      "principalLoanAmount": "Principal Loan Amount:",
      "totalInterestPayable": "Total Interest Payable:",
      "totalAmountPayable": "Total Amount (P + I):",
      "estRegistryCost": "Est. Registry & Stamp Duty (UP):",
      "checkEligibilityWhatsApp": "Check Loan Eligibility via WhatsApp",
      "approvedBanksTitle": "Approved Bank Partners in Varanasi",
      "rateDisclaimer": "*Interest rates applicant ke CIBIL score (750+) aur bank appraisal guidelines par depend karte hain."
    },
    "trust": {
      "badge": "Uncompromising Standards",
      "title": "Kyu Chunein AKGV Infra City?",
      "subtitle": "Varanasi me high capital appreciation, legal certainty aur peaceful living ke liye developed township.",
      "verifiedStandard": "Verified Township Standard",
      "pillars": [
        {
          "title": "30ft & 25ft Wide Roads",
          "desc": "Approved blueprint ke according: 30ft entrance boulevard aur 25ft internal roads, heavy RCC/damar paved.",
          "highlight": "27.82% Road Ratio"
        },
        {
          "title": "100% Freehold Title",
          "desc": "Clear legal ownership zero litigation ke sath. Instant Registry aur administrative Dakhil-Kharij support.",
          "highlight": "Clear Land Title"
        },
        {
          "title": "Underground Power & Solar",
          "desc": "Dedicated on-site electricity transformer, underground conduit cabling aur automatic solar street lights.",
          "highlight": "24/7 Power Ready"
        },
        {
          "title": "Botanical Green Buffer",
          "desc": "Boundary par 15ft 10in landscaped botanical setback buffer, shade trees aur walking park ke sath.",
          "highlight": "15'10\" Buffer"
        },
        {
          "title": "100% Vastu Approval",
          "desc": "Er. Rajesh Kumar Patel dwara planned: East aur North road facing plots fresh air aur morning sun ke liye.",
          "highlight": "Er. Rajesh Patel Seal"
        },
        {
          "title": "Sweet Water & Modern Drainage",
          "desc": "Meethe pani ke deep aquifer borewells aur zero-waterlogging underground drainage lines.",
          "highlight": "Zero Waterlogging"
        }
      ],
      "proximityBadge": "Prime Proximity",
      "proximityTitle": "Varanasi Ke Major Hubs Se Distance",
      "proximitySub": "Railway stations, expressways, top hospitals aur universities tak easy access.",
      "scheduleVisitBtn": "Schedule Free Guided Site Visit",
      "connectivity": [
        {
          "name": "Varanasi Cantt Railway Station",
          "dist": "15 Mins",
          "type": "Railway Hub"
        },
        {
          "name": "Banaras Railway Station (Manduadih)",
          "dist": "12 Mins",
          "type": "Superfast Trains"
        },
        {
          "name": "NH-19 (Grand Trunk Expressway)",
          "dist": "5 Mins",
          "type": "National Highway"
        },
        {
          "name": "BHU & Sir Sunderlal Hospital",
          "dist": "20 Mins",
          "type": "Premier Healthcare"
        },
        {
          "name": "Lal Bahadur Shastri Airport",
          "dist": "35 Mins",
          "type": "Airport Corridor"
        },
        {
          "name": "Ring Road Phase-2 Varanasi",
          "dist": "8 Mins",
          "type": "Signal-Free Road"
        }
      ],
      "reviewsBadge": "Corporate Guarantees",
      "reviewsTitle": "Hamari 100% Legal & Possession Commitments",
      "reviewsSub": "Approved Master Plan ke tehat AKGV Infra City Private Limited dwara direct statutory guarantees.",
      "verifiedBuyer": "Official Guarantee",
      "reviews": [
        {
          "name": "100% Freehold Title & Immediate Registry",
          "role": "Legal Registry Department, Varanasi",
          "plot": "Sub-Registrar Office Varanasi",
          "date": "Statutory Commitment",
          "review": "Sabhi 55 demarcated plots 100% clear freehold title ke sath hain, jisme zero bank liens ya legal disputes hain. Sub-registrar deed execution aur administrative Dakhil-Kharij ke liye complete legal support uplabdh hai."
        },
        {
          "name": "Er. Rajesh Kumar Patel Certified Blueprint",
          "role": "Chief Architect (R.P. Home Design)",
          "plot": "Scale 1:500 Demarcated Layout",
          "date": "Engineering Guarantee",
          "review": "Direct 77,550 sqft land parcel par based, jisme 27.82% area internal roads ko dedicated hai. Har plot par stone pillar boundary demarcation, 30ft entrance avenue aur 25ft sector corridors hain."
        },
        {
          "name": "3 Physical Offline Branch Offices in Varanasi",
          "role": "Customer Support & Document Verification",
          "plot": "Rampur • Lahartara • Mirza Murad",
          "date": "Direct Branch Service",
          "review": "Document inspection, payment receipts lene aur company vehicles se accompanied site visits ke liye hamare Rampur registered head office ya Lahartara (near Cantt) aur Mirza Murad (NH-19) branch visit karein."
        }
      ]
    },
    "certificate": {
      "modalTitleGenerating": "Instant Plot Hold Booking",
      "modalTitleGenerated": "Official 72-Hour Plot Hold Certificate",
      "selectedAsset": "Selected Plot",
      "basePrice": "Base Price",
      "area": "Area:",
      "dimensions": "Dimensions:",
      "facing": "Facing:",
      "buyerName": "Buyer Full Name",
      "buyerNamePlaceholder": "e.g. Ramesh Chandra Sharma",
      "mobileNumber": "Mobile Number (WhatsApp Enabled)",
      "mobilePlaceholder": "e.g. 9839123456",
      "sampleElevationIdea": "Sample House Elevation Idea (Optional — Reference Only)",
      "sampleElevationDisclaimer": "*Notice: AKGV Infra City residential plots sell karti hai. House construction buyer swayam karate hain.",
      "guaranteeTitle": "Zero-Risk 72-Hour Legal Plot Hold",
      "guaranteeDesc": "Residential Plot #{plotNumber} 72 hours ke liye aapke name par system me lock rahega. AKGV Infra City 30ft/25ft wide roads, sweet water, drainage aur clean registry provide karti hai.",
      "cancelBtn": "Cancel",
      "generateBtn": "Generate 72-Hour Hold Certificate",
      "countdownLabel": "Hold Expiry Countdown:",
      "watermarkCrest": "AKGV",
      "certBadge": "Official Temporary Holding Certificate",
      "companyHeader": "AKGV INFRA CITY PRIVATE LIMITED",
      "companySub": "Township Development & Infrastructure • Varanasi (U.P.) | Phone: +91 6306917991",
      "refNo": "REF NO:",
      "allocatedPlot": "Allocated Plot",
      "plotAreaLabel": "Plot Area",
      "beneficiary": "Beneficiary (Buyer)",
      "plotValuationLabel": "Base Plot Valuation",
      "tokenPayableLabel": "Token:",
      "frontageRoad": "Frontage Road:",
      "approvedFacing": "Facing (100% Vastu)",
      "plannerNote": "Layout Planned & Approved by: Er. Rajesh Kumar Patel (R.P. Home Design) • Total Township: 77,550 sqft",
      "digitalRegistered": "Digital Hold Registered",
      "validityNotice": "Valid for 72 Hours from issuance",
      "authorizedEngineer": "Authorized Reg. Civil Engineer",
      "sendWhatsAppCta": "Send Certificate to WhatsApp (+91 6306917991)",
      "printCertBtn": "Print Certificate",
      "openBuyerPortalBtn": "Open Buyer Portal"
    },
    "whatsAppPopup": {
      "buttonLabel": "Chat on WhatsApp (6306917991)",
      "title": "AKGV Infra City Support",
      "onlineStatus": "Online • Direct WhatsApp",
      "helplineText": "Official Helpline: +91 6306917991",
      "promptText": "Aap directly hamari team se WhatsApp par baat kar sakte hain. Niche diye gaye options choose karein:",
      "chooseTemplate": "Inquiry topic choose karein:",
      "customLabel": "Ya apna custom message likhein:",
      "customPlaceholder": "Apna message yahan type karein...",
      "repliesNote": "Replies within minutes • AKGV Infra City Private Limited",
      "templates": [
        {
          "id": "book-plot",
          "title": "Book a Residential Plot",
          "text": "Namaste AKGV Infra City! Main Varanasi (Rampur / Lahartara / Mirza Murad) me residential plot book karna chahta/chahti hoon. Please available plot numbers, dimensions aur token hold details share karein."
        },
        {
          "id": "site-visit",
          "title": "Free Site Visit Schedule Karein",
          "text": "Namaste! Main AKGV Infra City township visit karne ke liye free site visit aur cab pickup book karna chahta hoon. Please available dates coordinate karein."
        },
        {
          "id": "rewards",
          "title": "Associate Commission & Rewards Plan",
          "text": "Namaste! Main AKGV Infra City me Associate Member join karna chahta hoon aur 11-Tier Commission Plan samajhna chahta hoon. Please registration details guide karein."
        },
        {
          "id": "joining-kit",
          "title": "₹999 Joining Kit Information",
          "text": "Namaste! Please ₹999 physical associate kit (Bag, Pen, Diary, File) ke details provide karein."
        }
      ]
    },
    "rewards": {
      "title": "Level, Commission aur Rewards Chart",
      "subtitle": "Mehnat kijiye, level badhaiye aur apne sapno ka reward paiye!",
      "level": "Level",
      "rank": "Post / Rank",
      "target": "Business Target",
      "commission": "Commission",
      "reward": "Reward",
      "offlineKitNotice": "Joining Kit: ₹999 cash offline collect hota hai. Bag, Pen, Diary aur Folder included.",
      "headerTagline": "\"Mehnat kijiye, level badhaiye aur apne sapno ka reward paiye!\"",
      "viewOriginalBrochureBtn": "Original Brochure Chart Dekhein",
      "simulatorTitle": "Interactive Performance Simulator",
      "simulatorSubtitle": "Apni Eligible Commission aur Unlocked Reward Simulate Karein",
      "celebrateBtn": "Celebrate Level",
      "verifiedVolumeLabel": "Total Verified Business Volume:",
      "currentTierLabel": "Current Tier:",
      "quickPresetsLabel": "Quick Presets:",
      "commissionRateLabel": "Commission Rate",
      "brochureLevelLabel": "Brochure Level",
      "calculatedCommissionLabel": "Calculated Commission",
      "onBusinessOf": "On business of",
      "brochureRewardCardTitle": "Brochure Reward (Click to Inquire)",
      "clickToEnquire": "Click to Inquire / Book",
      "nextMilestone": "Next Milestone:",
      "needsMore": "Needs",
      "more": "more",
      "officialChartTitle": "Official 11-Tier Commission & Rewards Chart",
      "officialChartSubtitle": "Plots book karne, rank target karne ya WhatsApp par contact karne ke liye kisi bhi level par click karein",
      "approvedRanksBadge": "11 Approved Ranks • Click Any to Book",
      "actionHeader": "Action / Booking",
      "bookAtLevelBtn": "Is Level Par Plot Book Karein / Inquire",
      "modalPlotBookingBtn": "WhatsApp Par Plot Booking Inquiry",
      "modalMasterPlanBtn": "Master Plan Par Plots Dekhein",
      "lakhUnit": "Lakh",
      "croreUnit": "Cr"
    },
    "joiningKit": {
      "badge": "Offline Transparency",
      "title": "Member Joining Kit (₹999 Cash Ledger)",
      "subtitle": "Physical onboarding kit with Bag, Pen, Diary and File. Strictly collected in cash offline and tracked in our administrative ledger.",
      "kpiTotalCash": "Total Offline Cash Collected",
      "kpiTreasurySub": "Verified offline treasury",
      "kpiTotalKits": "Total Physical Kits Issued",
      "kpiAcknowledgedSub": "Acknowledged by members",
      "kpiStandardAmount": "Standard Kit Amount",
      "kpiNonCommissionable": "Non-commissionable",
      "kpiInventory": "Kit Physical Inventory",
      "kpiInStock": "in Stock",
      "kpiCentralWarehouse": "Central office warehouse",
      "recordKitBtn": "Record New ₹999 Cash Kit",
      "mandatoryContentsTitle": "Official Member Joining Kit Mandatory Contents",
      "cashTag": "₹999 Cash Offline",
      "bagTitle": "Executive Member Bag",
      "bagDesc": "Heavy-duty durable laptop & documents carrying briefcase bag with AKGV Infra City branding.",
      "penTitle": "Engraved Metallic Executive Pen",
      "penDesc": "Premium blue-ink metal rollerball pen for signing registry documents and buyer contracts.",
      "diaryTitle": "Hardbound Executive Diary",
      "diaryDesc": "Gold foil stamped annual business planning journal for recording client plot visits.",
      "fileTitle": "Legal Document Project File",
      "fileDesc": "Multi-pocket plastic folder containing approved blueprints, layout sheets, and price lists."
    },
    "faqs": [
      {
        "q": "Kya AKGV Infra City makaan banati hai ya sirf residential plots bechti hai?",
        "a": "AKGV Infra City Private Limited strictly approved residential plots develop aur sell karti hai. Ham 30ft aur 25ft wide roads, underground drainage, transformer, solar streetlights, sweet water aur boundary wall develop karke dete hain. Website par diya gaya 3D House Viewer sirf sample visualization ke liye hai taaki aap dekh sakein ki aapke plot par future home kaisa ban sakta hai. House construction buyer swayam karate hain."
      },
      {
        "q": "AKGV Infra City ke flagship project locations kahan hain?",
        "a": "Flagship townships Rampur (direct 30ft entrance road corridor), Lahartara (central Varanasi near Cantt Station) aur Mirza Murad (NH-19 highway growth corridor) me hain."
      },
      {
        "q": "Road widths aur amenities kya di jaati hain?",
        "a": "Approved blueprint ke according 30ft main road aur 25ft internal cross-roads hain. Sath hi underground drainage lines, electric transformer aur potable water ready hai."
      },
      {
        "q": "Plot booking aur 72 hours hold ka process kya hai?",
        "a": "Buyers interactive master plan par green plot select karke 72 hours ka hold laga sakte hain. Payment proof verify hone ke baad official receipt issue hoti hai."
      },
      {
        "q": "₹999 Joining Kit kya hai aur payment kaise hota hai?",
        "a": "₹999 kit strictly offline cash collect hoti hai. Isme 1 Executive Bag, 1 Pen, 1 Diary aur 1 Project File milti hai. Iska cash ledger record portal me maintained hai."
      },
      {
        "q": "Kya buyers plot book karne se pehle 3D me dekh sakte hain?",
        "a": "Yes! 3D House Viewer me aap 360 degree rotate karke dekh sakte hain ki aapke selected plot dimensions par house kaisa fit hoga."
      }
    ],
    "ctaBanner": {
      "title": "Varanasi Me Apna Plot Book Karne Ke Liye Ready Hain?",
      "subtitle": "Aaj hi Rampur, Lahartara ya Mirza Murad me hamari team ke sath guided site visit schedule karein.",
      "callBtn": "Call Karein",
      "siteVisitBtn": "Book Site Visit Online"
    },
    "footer": {
      "tagline": "Uttar Pradesh me 30ft aur 25ft wide roads, underground electricity, sweet drinking water aur transparent immediate registry ke sath planned residential colonies deliver karne wale leading township developers.",
      "bookingLine": "Official Booking Line",
      "locationsTitle": "Project Locations",
      "portalsTitle": "Portals & Tools",
      "masterPlanLink": "Interactive Master Plan",
      "houseViewerLink": "Architectural 3D Plot-Fit Visualizer",
      "rewardsLink": "Level Commission & Rewards",
      "joiningKitLink": "Offline Joining Kit (₹999 Cash)",
      "buyerPortalLink": "Buyer Portal & Booking Status",
      "memberPortalLink": "Member Hierarchy & Digital ID",
      "adminPortalLink": "Super Admin Control Centre",
      "complianceTitle": "Compliance & Policies",
      "privacyPolicy": "Privacy Policy",
      "termsConditions": "Terms & Conditions",
      "bookingPolicy": "Booking & Cancellation Policy",
      "grievanceSupport": "Grievance & Customer Support",
      "blueprintRefTitle": "Verified Blueprint Reference",
      "blueprintRefText": "Layout Plan of A.K.G.V. Infra City Varanasi planned by Er. Rajesh Kumar Patel (R.P. Home Design).",
      "disclaimer": "AKGV Infra City Private Limited transparent real estate delivery ensure karta hai. Company exclusively approved residential plots sell karti hai. Plot availability aur rates official registration ke according valid hain.",
      "allRights": "All Rights Reserved. AKGV Infra City Private Limited."
    },
    "mobileNav": {
      "home": "Home",
      "plots": "Plots",
      "projects": "Locations",
      "siteVisit": "Site Visit",
      "emiCalc": "EMI Calc",
      "portal": "Dashboard"
    },
    "architecturalGuidance": {
      "badge": "Plot Planning Guidance",
      "title": "Aapke Kharide Gaye Plot Ke Liye Architectural Guidance",
      "subtitle": "Dekhein ki aapke plot par future home, car porch aur Vastu alignment kaise fit ho sakte hain.",
      "policyBadge": "Plot Sales Policy",
      "policyTitle": "Important Company Policy:",
      "policyNotice": "AKGV Infra City Private Limited strictly approved residential plots (zameen) develop aur sell karti hai. Company house construction nahi karti hai. Makaan buyers swayam apni pasand aur budget ke according banwate hain.",
      "visualizerIntro": "Zameen lene se pehle setback, car parking, garden space aur Vastu alignment samajhne ke liye hamara 3D Plot-Fit Simulation tool use karein aur dekhein ki aapke plot dimension par kaisa layout fit ho sakta hai.",
      "exploreVisualizerBtn": "Launch 3D Plot-Fit Visualizer",
      "sampleTag": "Sirf Reference Ke Liye Sample Elevation",
      "models": [
        {
          "name": "Compact 2-BHK Villa",
          "suitablePlot": "Plots < 1,000 sqft (jaise 20x40 ft)",
          "desc": "Optimized East/North facing single-floor layout, parking porch aur terrace garden."
        },
        {
          "name": "Executive 3-BHK Duplex",
          "suitablePlot": "Plots 1,000 - 1,500 sqft (jaise 25x50 ft)",
          "desc": "Double-height living room, 2-car covered parking aur rear ventilation setback."
        },
        {
          "name": "Imperial 4-BHK Luxury Villa",
          "suitablePlot": "Plots 1,500+ sqft (jaise 30x60 ft)",
          "desc": "Grand entry lobby, private landscaped lawn aur servant quarters."
        }
      ]
    },
    "faqSection": {
      "title": "Aksar Puche Jane Wale Sawal (FAQs)",
      "subtitle": "Plot booking, registry process aur township facilities se jude clear answers."
    }
  }
} ;
