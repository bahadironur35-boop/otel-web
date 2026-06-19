"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { checkInGuest } from "@/app/admin/actions";

type ReservationOption = {
  id: string;
  guestName: string;
  guestEmail: string | null;
  roomTypeId: string;
  roomName: string;
  dates: string;
  guests: number;
  amountLabel: string;
};

type RoomOption = {
  id: string;
  number: string;
  floor: string | null;
  roomTypeId: string;
  roomName: string;
};

function CheckInButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending}>{pending ? "Giriş yapılıyor..." : "Check-in yap"}</button>;
}

export function CheckInPanel({
  reservations,
  rooms,
  schemaReady
}: {
  reservations: ReservationOption[];
  rooms: RoomOption[];
  schemaReady: boolean;
}) {
  const [reservationId, setReservationId] = useState(reservations[0]?.id ?? "");
  const selectedReservation = reservations.find((item) => item.id === reservationId);
  const availableRooms = useMemo(
    () => rooms.filter((room) => room.roomTypeId === selectedReservation?.roomTypeId),
    [rooms, selectedReservation]
  );
  const [roomId, setRoomId] = useState("");
  const selectedRoomId = availableRooms.some((room) => room.id === roomId) ? roomId : availableRooms[0]?.id ?? "";

  return (
    <form className="checkin-form" action={checkInGuest}>
      <input name="reservationId" type="hidden" value={reservationId} />
      <input name="physicalRoomId" type="hidden" value={selectedRoomId} />

      <div className="checkin-step">
        <div className="checkin-step-title"><span>1</span><strong>Rezervasyon seçin</strong></div>
        <div className="checkin-reservation-grid">
          {reservations.map((reservation) => (
            <button
              className={reservation.id === reservationId ? "is-selected" : ""}
              type="button"
              key={reservation.id}
              onClick={() => {
                setReservationId(reservation.id);
                setRoomId("");
              }}
            >
              <span>{reservation.roomName}</span>
              <strong>{reservation.guestName}</strong>
              <small>{reservation.dates}</small>
              <b>{reservation.amountLabel}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="checkin-step">
        <div className="checkin-step-title"><span>2</span><strong>Oda numarası atayın</strong></div>
        <div className="physical-room-grid">
          {availableRooms.map((room) => (
            <button
              className={room.id === selectedRoomId ? "is-selected" : ""}
              type="button"
              key={room.id}
              onClick={() => setRoomId(room.id)}
            >
              <strong>{room.number}</strong>
              <span>{room.floor ? `${room.floor}. kat` : room.roomName}</span>
            </button>
          ))}
          {!availableRooms.length ? <p className="empty-state">Bu oda tipi için hazır oda bulunmuyor.</p> : null}
        </div>
      </div>

      <div className="checkin-step">
        <div className="checkin-step-title"><span>3</span><strong>Misafir bilgilerini tamamlayın</strong></div>
        <div className="checkin-fields" key={selectedReservation?.id}>
          <label>Ad soyad<input name="fullName" defaultValue={selectedReservation?.guestName ?? ""} required /></label>
          <label>E-posta<input name="email" type="email" defaultValue={selectedReservation?.guestEmail ?? ""} /></label>
          <label>Telefon<input name="phone" type="tel" /></label>
          <label>Uyruk<input name="nationality" placeholder="Türkiye" /></label>
          <label>TC Kimlik No<input name="identityNumber" /></label>
          <label>Pasaport No<input name="passportNumber" /></label>
          <label>Misafir durumu
            <select name="guestStatus" defaultValue="STANDARD">
              <option value="STANDARD">Standart</option>
              <option value="VIP">VIP</option>
              <option value="WATCHLIST">Takip listesi</option>
            </select>
          </label>
          <label className="checkin-notes">Not<input name="notes" placeholder="Tercihler veya operasyon notu" /></label>
        </div>
      </div>

      <CheckInButton disabled={!schemaReady || !reservationId || !selectedRoomId} />
    </form>
  );
}
