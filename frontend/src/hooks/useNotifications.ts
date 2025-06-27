import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
  onConfirm?: () => void;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const addNotification = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "info",
      duration: number = 3000
    ) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        message,
        type,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remove notification after duration
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for different notification types
  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification("success", title, message, duration);
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification("error", title, message, duration);
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification("warning", title, message, duration);
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification("info", title, message, duration);
    },
    [addNotification]
  );

  // Confirm dialog functions
  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        type?: "info" | "warning" | "danger";
      }
    ) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        type: options?.type,
        onConfirm,
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    hideConfirm();
  }, [confirmDialog.onConfirm, hideConfirm]);

  // Replacement functions for browser alerts
  const alert = useCallback(
    (message: string, title: string = "Alert") => {
      showInfo(title, message);
    },
    [showInfo]
  );

  const confirm = useCallback(
    (message: string, title: string = "Confirm", onConfirm: () => void) => {
      showConfirm(title, message, onConfirm, {
        confirmText: "Yes",
        cancelText: "Cancel",
        type: "warning",
      });
    },
    [showConfirm]
  );

  return {
    // Notifications state
    notifications,
    confirmDialog,

    // Notification functions
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Confirm dialog functions
    showConfirm,
    hideConfirm,
    handleConfirm,

    // Browser replacement functions
    alert,
    confirm,
  };
};
