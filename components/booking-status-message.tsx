"use client";

import { useEffect, useState } from "react";

type BookingStatusMessageProps = {
  message: string;
  tone?: "success" | "danger" | "info";
};

export function BookingStatusMessage({ message, tone = "info" }: BookingStatusMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <p className={`booking-status-message ${tone}`} role="status">
      {message}
    </p>
  );
}
