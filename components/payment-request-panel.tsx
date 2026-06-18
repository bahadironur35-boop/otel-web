"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createPaymentRequest } from "@/app/admin/actions";

type ReservationOption = {
  id: string;
  guestName: string;
  roomName: string;
  amountLabel: string;
  latestPaymentStatus: string | null;
};

type ProviderOption = {
  id: string;
  name: string;
};

function PaymentSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending}>
      {pending ? "Talep oluşturuluyor..." : "Tahsilat talebi oluştur"}
    </button>
  );
}

export function PaymentRequestPanel({
  reservations,
  providers,
  schemaReady
}: {
  reservations: ReservationOption[];
  providers: ProviderOption[];
  schemaReady: boolean;
}) {
  const firstCollectibleReservation = reservations.find(
    (reservation) => reservation.latestPaymentStatus !== "PAID"
  );
  const [selectedId, setSelectedId] = useState(firstCollectibleReservation?.id ?? "");
  const selectedReservation = reservations.find((reservation) => reservation.id === selectedId);

  return (
    <form className="touch-payment-form" action={createPaymentRequest}>
      <input name="reservationId" type="hidden" value={selectedId} />

      <div className="touch-reservation-grid" role="listbox" aria-label="Rezervasyon seçimi">
        {reservations.map((reservation) => {
          const selected = reservation.id === selectedId;
          const paid = reservation.latestPaymentStatus === "PAID";

          return (
            <button
              className={`touch-reservation-card ${selected ? "is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={paid}
              key={reservation.id}
              onClick={() => setSelectedId(reservation.id)}
            >
              <span className="touch-card-room">{reservation.roomName}</span>
              <strong>{reservation.guestName}</strong>
              <span className="touch-card-amount">{reservation.amountLabel}</span>
              <span className={`touch-card-status ${paid ? "paid" : ""}`}>
                {paid ? "Ödendi" : reservation.latestPaymentStatus ? "Tahsilat mevcut" : "Tahsilat bekliyor"}
              </span>
            </button>
          );
        })}
      </div>

      {!reservations.length ? <p className="empty-state">Tahsilat oluşturulabilecek rezervasyon bulunmuyor.</p> : null}

      <div className="payment-control-panel">
        <div className="selected-payment-summary">
          <span>Seçili rezervasyon</span>
          <strong>{selectedReservation ? `${selectedReservation.guestName} · ${selectedReservation.amountLabel}` : "Seçilmedi"}</strong>
        </div>
        <label>
          Sağlayıcı
          <select name="provider" defaultValue={providers[0]?.id} disabled={!schemaReady || !providers.length}>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </label>
        <label>
          Ödeme bağlantısı
          <input name="paymentLink" type="url" placeholder="https://..." disabled={!schemaReady} />
        </label>
        <label>
          Son kullanım
          <input name="expiresAt" type="datetime-local" disabled={!schemaReady} />
        </label>
        <PaymentSubmitButton
          disabled={!schemaReady || !selectedId || !providers.length}
        />
      </div>
    </form>
  );
}
