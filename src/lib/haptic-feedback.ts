/**
 * Haptic feedback utilities for mobile devices
 */

export function triggerHapticFeedback(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return;
  
  // Check if Vibration API is available
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    
    navigator.vibrate(patterns[type]);
  }
}

export function triggerSuccessFeedback() {
  triggerHapticFeedback("light");
}

export function triggerErrorFeedback() {
  triggerHapticFeedback("medium");
}

export function triggerActionFeedback() {
  triggerHapticFeedback("light");
}

