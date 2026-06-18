"use client";

import { useFormStatus } from "react-dom";

export function BookingSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="booking-submit-button" type="submit" disabled={pending} aria-live="polite">
      {pending ? <span className="button-spinner" aria-hidden="true" /> : null}
      <span>{pending ? "Talep gönderiliyor..." : "Rezervasyon talebi gönder"}</span>
    </button>
  );
}
