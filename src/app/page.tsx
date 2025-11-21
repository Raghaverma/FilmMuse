"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import NavBar from "@/components/home/NavBar";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Footer from "@/components/home/Footer";
import DottedBG from "@/components/home/DottedBG";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";

const SectionDiscover = dynamic(() => import("@/components/home/SectionDiscover"), {
  loading: () => (
    <section className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <MovieCardGridSkeleton count={8} />
      </div>
    </section>
  ),
  ssr: false,
});

export default function Page() {
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground selection:bg-emerald-300/20 selection:text-emerald-200 dark:bg-[#0a0a0a] dark:text-neutral-100"
    >
      <DottedBG />
      <NavBar />
      <Hero />
      <TrustBar />
      <SectionDiscover />
      <Footer />
    </motion.main>
  );
}
