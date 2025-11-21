"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export default function SuccessAnimation({
  message,
  onComplete,
}: SuccessAnimationProps) {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="h-16 w-16 rounded-full bg-emerald-400 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Check className="h-8 w-8 text-black" strokeWidth={3} />
        </motion.div>
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-white"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

