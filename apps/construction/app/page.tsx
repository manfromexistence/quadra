"use client";

import { useEffect, useState } from "react";
import { CTA } from "@/components/edms-home/cta";
import { FAQ } from "@/components/edms-home/faq";
import { Features } from "@/components/edms-home/features";
import { Hero } from "@/components/edms-home/hero";
import { HowItWorks } from "@/components/edms-home/how-it-works";
import { Testimonials } from "@/components/edms-home/testimonials";
import { Footer } from "@/components/footer";
import { Header } from "@/components/home/header";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-background text-foreground flex min-h-[100dvh] flex-col items-center justify-items-center">
      <Header
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="w-full flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
