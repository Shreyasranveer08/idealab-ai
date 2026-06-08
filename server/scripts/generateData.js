const fs = require('fs');

const categories = {
  "Generic AI wrapper": [
    { name: "ChatDoc AI", desc: "Upload a PDF and chat with it. Uses ChatGPT API." },
    { name: "TwitterBot Pro", desc: "Generate viral tweets using AI." },
    { name: "BlogWriter", desc: "Write SEO blog posts in seconds with AI." },
    { name: "EmailGenie", desc: "AI email assistant that writes replies for you." },
    { name: "SummaryBot", desc: "Summarize long YouTube videos using AI." },
    { name: "CoverLetter AI", desc: "Generate perfect cover letters with OpenAI." },
    { name: "InstaCaption", desc: "AI-generated captions for your Instagram posts." }
  ],
  "AI Agents": [
    { name: "DevAgent", desc: "Autonomous AI software engineer that fixes GitHub issues." },
    { name: "SalesOps Agent", desc: "AI agent that researches leads, drafts emails, and updates Salesforce." },
    { name: "CustomerCare.ai", desc: "Autonomous voice and text agent that resolves tier-1 customer tickets." },
    { name: "DataScrape Agent", desc: "AI agent that navigates websites and extracts structured data autonomously." },
    { name: "HR Onboarder", desc: "AI agent that manages new employee onboarding workflows and Q&A." },
    { name: "QA Agent X", desc: "Autonomous agent that writes and runs end-to-end tests for web apps." },
    { name: "ResearchMate", desc: "AI agent that autonomously performs academic literature reviews." },
    { name: "Agentic Cloud", desc: "Orchestrate swarms of specialized AI agents for enterprise workflows." }
  ],
  "Cybersecurity SaaS": [
    { name: "ZeroTrust OS", desc: "Enterprise zero-trust network access (ZTNA) platform." },
    { name: "PhishGuard", desc: "AI-powered phishing simulation and employee training platform." },
    { name: "CloudSec Monitor", desc: "Continuous monitoring for AWS, GCP, and Azure misconfigurations." },
    { name: "SecretScanner", desc: "Prevent secret leaks in CI/CD pipelines before they happen." },
    { name: "IAM Auditor", desc: "Automated identity and access management auditing for compliance." },
    { name: "RansomwareShield", desc: "Endpoint detection and response tailored for ransomware prevention." },
    { name: "API Sentinel", desc: "Runtime API security and vulnerability scanning." }
  ],
  "Healthcare SaaS": [
    { name: "MediSchedule", desc: "HIPAA-compliant appointment booking for private clinics." },
    { name: "CareTeam Sync", desc: "Secure communication and care coordination for hospital staff." },
    { name: "TeleHealth Pro", desc: "All-in-one telemedicine platform with integrated billing." },
    { name: "PatientPortalX", desc: "Patient engagement and remote monitoring software." },
    { name: "DentalCRM", desc: "Specialized CRM and patient retention software for dental practices." },
    { name: "EHR Connect", desc: "Interoperability API for seamless data transfer between EHR systems." },
    { name: "MedBilling AI", desc: "Automated medical coding and claim denial management." },
    { name: "ClinicalTrial Match", desc: "Platform to match patients with ongoing clinical trials based on EHR." }
  ],
  "FinTech tools": [
    { name: "SpendTrack", desc: "Automated expense management and corporate cards for startups." },
    { name: "InvoiceFlow", desc: "B2B invoicing and automated accounts receivable collections." },
    { name: "CryptoTax Pro", desc: "Automated cryptocurrency tax calculation and reporting." },
    { name: "PayrollGlobal", desc: "Unified global payroll API for remote teams." },
    { name: "CreditBuilder", desc: "App that helps consumers build credit through rent payments." },
    { name: "OpenBank API", desc: "Unified API for open banking connections in emerging markets." },
    { name: "WealthRobo", desc: "Robo-advisor infrastructure for modern wealth management firms." },
    { name: "FraudDetect", desc: "Real-time transaction fraud detection using machine learning." }
  ],
  "Developer tools": [
    { name: "LogStream", desc: "High-performance distributed logging platform for microservices." },
    { name: "DeployPreview", desc: "Instant staging environments for every pull request." },
    { name: "DB Branch", desc: "Database branching and schema migration management tool." },
    { name: "AuthKit", desc: "Drop-in authentication and user management component for React." },
    { name: "API Mocker", desc: "Generate mock APIs from OpenAPI specs in seconds." },
    { name: "StateInspector", desc: "Advanced debugging tool for complex state machines." },
    { name: "KubeDeploy", desc: "Simplified Kubernetes deployment manager for small teams." },
    { name: "LoadTest Pro", desc: "Distributed load testing framework for high-scale APIs." },
    { name: "Tailwind UI Builder", desc: "Visual drag-and-drop builder that exports raw Tailwind React code." }
  ],
  "Vertical SaaS": [
    { name: "YogaStudio Manager", desc: "Management software specifically built for independent yoga studios." },
    { name: "RoofingCRM", desc: "Lead tracking, estimating, and job management for roofing contractors." },
    { name: "BreweryOps", desc: "Inventory and production management for craft breweries." },
    { name: "MarinaMaster", desc: "Dock management and billing software for boat marinas." },
    { name: "AutoShop Pro", desc: "Repair tracking and customer communication for auto mechanics." },
    { name: "NannyAgency OS", desc: "Placement tracking and payroll for nanny placement agencies." },
    { name: "Landscaper Route", desc: "Route optimization and billing for landscaping businesses." },
    { name: "Gymnastics Score", desc: "Meet management and scoring software for competitive gymnastics." },
    { name: "PestControl Flow", desc: "Scheduling and chemical usage tracking for pest control companies." }
  ],
  "Marketplaces": [
    { name: "FindAFounder", desc: "Marketplace connecting technical and non-technical co-founders." },
    { name: "EquipRent", desc: "Peer-to-peer marketplace for renting heavy construction equipment." },
    { name: "VintageWatch Hub", desc: "Verified marketplace for buying and selling vintage luxury watches." },
    { name: "LocalTutor Match", desc: "Connects parents with verified local in-person tutors." },
    { name: "DevShop Network", desc: "B2B marketplace for finding vetted software development agencies." },
    { name: "CreatorSponsor", desc: "Platform connecting niche newsletter creators with relevant sponsors." },
    { name: "ChefAtHome", desc: "Marketplace to hire private chefs for dinner parties." }
  ],
  "Productivity apps": [
    { name: "FocusTime", desc: "Pomodoro timer integrated with calendar block scheduling." },
    { name: "TaskSync", desc: "Unified inbox for GitHub, Jira, and Asana tasks." },
    { name: "MindMap AI", desc: "AI-assisted brainstorming and mind-mapping tool." },
    { name: "NoteFlow", desc: "Bi-directional linked note-taking app for researchers." },
    { name: "MeetingSummarizer", desc: "Automatically record and transcribe Google Meets." },
    { name: "HabitTracker X", desc: "Gamified habit tracking app with social accountability." },
    { name: "TimeBlocker Pro", desc: "Visual calendar planner for deep work sessions." },
    { name: "TabManager AI", desc: "Browser extension that automatically categorizes and closes tabs." }
  ],
  "E-commerce tools": [
    { name: "CartAbandon", desc: "SMS and email sequences to recover abandoned Shopify carts." },
    { name: "ReviewAnalyzer", desc: "AI tool that extracts insights from thousands of Amazon product reviews." },
    { name: "DynamicPricing", desc: "Algorithmic pricing optimization for independent D2C brands." },
    { name: "ReturnFlow", desc: "Automated returns portal and logistics for ecommerce." },
    { name: "UGC Source", desc: "Platform for brands to collect and license user-generated content." },
    { name: "LoyaltyBoost", desc: "Points and referral program software for Shopify stores." },
    { name: "InventorySync", desc: "Multi-channel inventory synchronization across Shopify, Amazon, and Etsy." }
  ],
  "Voice AI": [
    { name: "VoiceClone", desc: "Generate ultra-realistic voice clones from a 10-second sample." },
    { name: "PodcastDub", desc: "Automatically dub podcasts into 20+ languages using AI voice." },
    { name: "CallCenter AI", desc: "Inbound voice AI agent that handles reservations and FAQs." },
    { name: "AudioBook Maker", desc: "Convert text to high-quality audiobooks with emotive voices." },
    { name: "AccentCoach", desc: "AI voice analysis app for accent reduction and pronunciation." },
    { name: "VoiceAuth", desc: "Biometric voice authentication API for banking apps." },
    { name: "SonicBrand", desc: "AI generator for custom sound logos and brand jingles." }
  ],
  "Education technology": [
    { name: "MathGenius", desc: "Adaptive math learning platform for K-12 students." },
    { name: "VocabBuilder", desc: "Spaced-repetition flashcard app for learning foreign languages." },
    { name: "CourseCreator AI", desc: "Generate full curriculum and slide decks from a topic prompt." },
    { name: "StudentEngage", desc: "Real-time polling and Q&A platform for large university lectures." },
    { name: "CodeCamp Kids", desc: "Gamified platform teaching Python to children 8-12." },
    { name: "AlumniConnect", desc: "Networking platform for university alumni mentoring programs." },
    { name: "GradeAssist", desc: "AI grading assistant for long-form essays and written assignments." },
    { name: "SpecialEd Tracker", desc: "IEP goal tracking and reporting software for special education teachers." }
  ],
  "Enterprise software": [
    { name: "ProcurePro", desc: "Enterprise procurement and vendor management software." },
    { name: "ERPSync", desc: "Modern integration layer for legacy SAP and Oracle ERPs." },
    { name: "ComplianceOS", desc: "Centralized platform for managing SOC2, ISO27001, and GDPR compliance." },
    { name: "CorpComms", desc: "Internal communications platform for distributed enterprises." },
    { name: "SupplyChain Tower", desc: "End-to-end visibility and risk management for global supply chains." },
    { name: "FacilityManager", desc: "IoT-enabled facility management and maintenance scheduling." },
    { name: "Enterprise Search", desc: "Unified internal search across Drive, Notion, Slack, and Salesforce." }
  ]
};

let startups = [];
const catNames = Object.keys(categories);

for (const cat of catNames) {
  for (const s of categories[cat]) {
    startups.push({
      name: s.name,
      category: cat,
      description: s.desc,
      url: "https://example.com/" + s.name.replace(/\s+/g, '').toLowerCase(),
      externalId: "mock_" + Math.floor(Math.random() * 10000000),
      launchedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    });
  }
}

while (startups.length < 100) {
  const base = startups[Math.floor(Math.random() * startups.length)];
  startups.push({
    ...base,
    name: base.name + " Pro",
    externalId: "mock_" + Math.floor(Math.random() * 10000000)
  });
}

startups = startups.slice(0, 100);

fs.writeFileSync('./server/scripts/data/realistic_startups.json', JSON.stringify(startups, null, 2));
console.log("Generated " + startups.length + " realistic startups.");
