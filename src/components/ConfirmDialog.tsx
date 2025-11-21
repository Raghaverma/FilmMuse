"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: Props) {
  React.useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-full p-2 ${
                variant === "danger" ? "bg-red-500/20" : 
                variant === "warning" ? "bg-amber-500/20" : 
                "bg-blue-500/20"
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  variant === "danger" ? "text-red-400" : 
                  variant === "warning" ? "text-amber-400" : 
                  "text-blue-400"
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-neutral-300 mb-6">{message}</p>
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-white/10 hover:bg-white/15 text-neutral-200"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type="button"
                    onClick={onConfirm}
                    className={
                      variant === "danger" 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : variant === "warning"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-emerald-400 text-black hover:bg-emerald-300"
                    }
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}







