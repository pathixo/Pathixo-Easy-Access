"use client";

import { useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { Positioning } from "@/components/public/Positioning";
import { ProductShowcase } from "@/components/public/ProductShowcase";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { Approach } from "@/components/public/Approach";
import { WhyPathixo } from "@/components/public/WhyPathixo";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { InquiryModal } from "@/components/public/InquiryModal";
import { Footer } from "@/components/public/Footer";

export default function HomePage() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar onOpenInquiry={() => setIsInquiryOpen(true)} />

      {/* Hero Section */}
      <Hero onOpenInquiry={() => setIsInquiryOpen(true)} />

      {/* Positioning / Two Core Pillars */}
      <Positioning />

      {/* Product Showcase (Vakxo, Crock PDF, Custom Engineering) */}
      <ProductShowcase onOpenInquiry={() => setIsInquiryOpen(true)} />

      {/* Services Grid (from pathixo.com) */}
      <ServicesGrid onOpenInquiry={() => setIsInquiryOpen(true)} />

      {/* Our Engineering Approach / How We Work */}
      <Approach />

      {/* Why Pathixo */}
      <WhyPathixo />

      {/* Registration & Lead Capture Form */}
      <RegistrationForm />

      {/* Footer */}
      <Footer />

      {/* Project Inquiry Modal / Bottom Sheet */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
}
