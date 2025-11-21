"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  progress?: number; // 0-100
  message?: string;
  showSpinner?: boolean;
}

export default function ProgressIndicator({
  progress,
  message,
  showSpinner = false,
}: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {showSpinner && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-emerald-400" />
        </motion.div>
      )}
      
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          {progress > 0 && (
            <p className="text-xs text-neutral-400 mt-2 text-center">
              {Math.round(progress)}%
            </p>
          )}
        </div>
      )}
      
      {message && (
        <p className="text-sm text-neutral-400 text-center">{message}</p>
      )}
    </div>
  );
}

