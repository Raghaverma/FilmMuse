"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import SearchBar from "./SearchBar";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            id="hero-title"
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Find the perfect film for your mood.
          </motion.h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            FilmMuse learns what you like and curates watchlists and hidden
            gems — all without the endless scroll.
          </p>
          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 text-xs text-neutral-400 sm:grid-cols-3">
            {["Mood graphs", "Smart lists", "Spoiler-free synopses"].map(
              (t) => (
                <div
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {t}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <HeroVisual />
    </section>
  );
}

