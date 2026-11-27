/**
 * PATHIXO SITE CONFIGURATION
 * Single source of truth for company identity, verified contact info, and exhibition details.
 */
export const siteConfig = {
  company: {
    legalName: "PATHIXO PRIVATE LIMITED",
    brandName: "PATHIXO",
    tagline: "We Build Intelligent Products. We Engineer Business Solutions.",
    subTagline: "From Ideas to Intelligent Digital Products.",
    description:
      "Pathixo is an AI-first technology and product engineering company that builds intelligent proprietary digital products and customized technology solutions for visionary businesses.",
    website: "https://pathixo.com/",
    email: "founder@pathixo.com",
    gmailComposeUrl:
      "https://mail.google.com/mail/?view=cm&fs=1&to=founder@pathixo.com&su=Inquiry%20from%20Meerut%20Trade%20Show%202026&body=Hello%20Pathixo%20Team,%0A%0AI%20connected%20with%20you%20at%20the%20Meerut%20Trade%20Show%202026%20and%20would%20like%20to%20learn%20more%20about%20your%20services.",
    phone: "+91 9711015569",
    displayPhone: "+91 97110 15569",
    linkedIn: "https://www.linkedin.com/company/pathixopvtltd/",
    instagram: "https://www.instagram.com/pathixopvtltd/?utm_source=qr&r=nametag",
    facebook: "https://www.facebook.com/profile.php?id=61596111725576",
  },
  products: {
    vakxo: {
      id: "vakxo",
      name: "Vakxo",
      status: "Building Vakxo",
      tagline: "Voice-Native, Local-First Autonomous Desktop AI Dev Agent",
      description: "Listens to spoken commands, writes code, navigates IDEs, runs terminal commands, and controls desktop workflows.",
      website: "https://vakxo.pathixo.com/",
      metrics: [
        { label: "FASTER DEV CYCLES", value: "3x" },
        { label: "CONTEXT SWITCHES", value: "0" },
        { label: "AVG TASK COMPLETION", value: "38s" },
      ],
      badges: ["VOICE ACTIVE", "AUTONOMOUS", "DESKTOP CONTROL", "PR MERGED"],
    },
    krocPDF: {
      id: "kroc-pdf",
      name: "krocPDF",
      status: "Document Suite",
      tagline: "Every Document Tool You Need, Pure & Private",
      description: "Convert, merge, and organize your documents in seconds right on your device. 100% private, free, and secure.",
      website: "https://www.krocpdf.app",
    },
  },
  expo: {
    eventName: "Meerut Trade Show 2026",
    venue: "Meerut Trade Show Ground",
    dates: "2026",
    booth: "Pathixo Technology Pavilion",
    campaignId: "meerut_trade_show_2026",
  },
  navigation: [
    { label: "Products", href: "#products" },
    { label: "Services", href: "#services" },
    { label: "Our Approach", href: "#approach" },
    { label: "Why Us", href: "#why-pathixo" },
    { label: "Lucky Draw", href: "/spin" },
  ],
  services: [
    {
      id: "web-development",
      title: "Web Engineering",
      tagline: "High-Performance Modern Web Platforms",
      description: "Ultra-fast Next.js, React, and full-stack web applications engineered for speed, conversion, and global scale.",
      icon: "Globe",
    },
    {
      id: "mobile-development",
      title: "Mobile Development",
      tagline: "Native & Cross-Platform Mobile Apps",
      description: "Polished iOS and Android applications with native performance, fluid micro-interactions, and offline resilience.",
      icon: "Smartphone",
    },
    {
      id: "ai-solutions",
      title: "AI & Intelligent Systems",
      tagline: "Autonomous Agents & Custom LLM Workflows",
      description: "End-to-end AI integration, document intelligence, custom model fine-tuning, and task automation pipelines.",
      icon: "Sparkles",
    },
    {
      id: "cloud-solutions",
      title: "Cloud Infrastructure",
      tagline: "Resilient Microservices & DevOps",
      description: "Automated CI/CD pipelines, container orchestration, Kubernetes, serverless backends, and fault-tolerant architecture.",
      icon: "Cloud",
    },
    {
      id: "backend-api",
      title: "Backend & API Systems",
      tagline: "Robust APIs & Scalable Databases",
      description: "Secure, low-latency REST and GraphQL APIs, optimized database design, and real-time event streaming systems.",
      icon: "Server",
    },
  ],
  whyUs: [
    {
      title: "Enterprise-Grade Security",
      description: "Zero-trust architecture, strict row-level security, encrypted sessions, and rigorous automated testing across every layer.",
    },
    {
      title: "Fast & Reliable Delivery",
      description: "Milestone-driven engineering sprints with real deployed increments. No unnecessary delays or ambiguous timelines.",
    },
    {
      title: "Architecture-First Mindset",
      description: "We don't just write code; we design resilient systems that handle sudden traffic spikes and grow with your business.",
    },
    {
      title: "Direct Engineering Access",
      description: "Collaborate directly with senior architects and product engineers dedicated to your technical success.",
    },
  ],
};
