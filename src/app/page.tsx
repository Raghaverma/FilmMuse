"use client";

import React from "react";
import dynamic from "next/dynamic";
import NavBar from "@/components/home/NavBar";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Footer from "@/components/home/Footer";
import DottedBG from "@/components/home/DottedBG";

const SectionDiscover = dynamic(() => import("@/components/home/SectionDiscover"), {
  loading: () => (
    <section className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/5 aspect-[2/3]" />
          ))}
        </div>
      </div>
    </section>
  ),
  ssr: false,
});

export default function Page() {
  return (
    <main
      id="main"
      className="min-h-screen bg-[#0a0a0a] text-neutral-100 selection:bg-emerald-300/20 selection:text-emerald-200"
    >
      <DottedBG />
      <NavBar />
      <Hero />
      <TrustBar />
      <SectionDiscover />
      <Footer />
    </main>
  );
}
