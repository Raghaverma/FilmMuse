"use client";

import * as React from "react";
import BackdropCarousel from "./BackdropCarousel";

export default function Hero() {
  return (
    <section className="relative w-full" aria-labelledby="hero-title">
      <BackdropCarousel />
    </section>
  );
}

