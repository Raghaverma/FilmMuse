type ErrorLevel = "error" | "warning" | "info";

interface ErrorContext {
  userId?: string;
  path?: string;
  userAgent?: string;
  timestamp: string;
  [key: string]: unknown;
}

class ErrorHandler {
  private initialized = false;

  async init() {
    if (this.initialized || typeof window === "undefined") return;
    
    try {
      const { init } = await import("@sentry/nextjs");
      init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        beforeSend(event) {
          if (process.env.NODE_ENV === "development") {
            console.error("Sentry Event:", event);
          }
          return event;
        },
      });
      this.initialized = true;
    } catch (error) {
      console.warn("Failed to initialize Sentry:", error);
    }
  }

  async log(level: ErrorLevel, message: string, error?: unknown, context?: ErrorContext) {
    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (typeof window !== "undefined") {
      errorContext.path = window.location.pathname;
      errorContext.userAgent = navigator.userAgent;
    }

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    if (this.initialized && typeof window !== "undefined") {
      try {
        const sentry = await import("@sentry/nextjs");
        if (error instanceof Error) {
          sentry.captureException(error, { level, extra: errorContext });
        } else {
          sentry.captureMessage(message, { level, extra: errorContext });
        }
      } catch {
        // Sentry not available
      }
    }

    if (process.env.NODE_ENV === "development" || level === "error") {
      const consoleMethod = console[level as keyof Console] as ((...args: unknown[]) => void) | undefined;
      if (consoleMethod) {
        consoleMethod(message, errorContext);
      } else {
        console.error(message, errorContext);
      }
    }
  }

  error(message: string, error?: unknown, context?: ErrorContext) {
    void this.log("error", message, error, context);
  }

  warning(message: string, error?: unknown, context?: ErrorContext) {
    void this.log("warning", message, error, context);
  }

  info(message: string, context?: ErrorContext) {
    void this.log("info", message, undefined, context);
  }
}

export const errorHandler = new ErrorHandler();

if (typeof window !== "undefined") {
  errorHandler.init();
}
