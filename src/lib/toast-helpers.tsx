import { toast, Toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface ToastAction {
  label: string;
  onClick: () => void;
}

export function showToastWithAction(
  message: string,
  action: ToastAction
) {
  void toast(
    (t: Toast) => (
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{message}</span>
        <Button
          onClick={() => {
            action.onClick();
            toast.dismiss(t.id);
          }}
          size="sm"
          className="bg-emerald-400 text-black hover:bg-emerald-300 h-7 px-3 text-xs"
        >
          {action.label}
        </Button>
      </div>
    ),
    {
      duration: 6000,
      style: {
        background: "rgba(10, 10, 10, 0.95)",
        color: "#fff",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "0.75rem",
        padding: "1rem",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
    }
  );
  // toastId is returned but not used - that's fine, toast is displayed
}

export function showSuccessToast(message: string, action?: ToastAction) {
  if (action) {
    showToastWithAction(message, action);
  } else {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "rgba(10, 10, 10, 0.95)",
        color: "#fff",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "0.75rem",
        padding: "1rem",
        backdropFilter: "blur(12px)",
      },
    });
  }
}

export function showErrorToast(message: string, action?: ToastAction) {
  if (action) {
    showToastWithAction(message, action);
  } else {
    toast.error(message, {
      duration: 4000,
      style: {
        background: "rgba(10, 10, 10, 0.95)",
        color: "#fff",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "0.75rem",
        padding: "1rem",
        backdropFilter: "blur(12px)",
      },
    });
  }
}

