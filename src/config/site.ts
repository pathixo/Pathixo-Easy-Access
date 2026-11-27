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
    website: "https://www.pathixo.com",
    email: "founder@pathixo.com",
    phone: "+91 9711015569",
    displayPhone: "+91 97110 15569",
    linkedIn: "https://www.linkedin.com/company/pathixo/",
    instagram: "https://www.instagram.com/pathixo/",
    facebook: "https://www.facebook.com/pathixo/",
  },
  products: {
    vakxo: {
      id: "vakxo",
      name: "Vakxo",
      status: "Building Vakxo",
      tagline: "World's First Voice-Native Autonomous Dev Agent",
      description: "Speak your intent — it writes the code, controls your desktop, runs your terminal, and ships.",
      website: "https://vakxo.com",
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
      status: "Enterprise Product",
      tagline: "Fast, Secure Enterprise Document & PDF Intelligence",
      description: "High-throughput document processing, intelligent extraction, and privacy-first PDF automation for modern businesses.",
      website: "https://www.pathixo.com/products/kroc-pdf",
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
