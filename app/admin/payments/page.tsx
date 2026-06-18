import { createPaymentRequest, updatePaymentStatus } from "@/app/admin/actions";
import { getPaymentWorkspace } from "@/lib/payments";

const statusTone: Record<string, string> = {
  CREATED: "info",
  LINK_SENT: "warning",
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  EXPIRED: "danger",
  REFUNDED: "info",
  CANCELLED: "danger"
};

export default async function PaymentsPage({
  searchParams
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const [workspace, params] = await Promise.all([getPaymentWorkspace(), searchParams]);

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Tahsilat merkezi</p>
          <h2>Ödeme talepleri ve işlem durumları</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Ödeme tablosu henüz kurulmadı. Supabase'de `supabase/payments-migration.sql` çalıştırılmalı.</p>
      ) : null}
      {params.result === "created" ? <p className="notice success">Ödeme talebi oluşturuldu.</p> : null}
      {params.result === "updated" ? <p className="notice success">Ödeme durumu güncellendi.</p> : null}
      {params.result === "error" ? <p className="notice danger">Ödeme işlemi tamamlanamadı.</p> : null}

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Yeni ödeme</p>
            <h3>Rezervasyon için ödeme talebi oluştur</h3>
          </div>
        </div>
        <form className="payment-create-form" action={createPaymentRequest}>
          <label>
            Rezervasyon
            <select name="reservationId" required disabled={!workspace.schemaReady}>
              {workspace.reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {reservation.guestName} · {reservation.roomName} · {reservation.amountLabel}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sağlayıcı
            <select name="provider" defaultValue="MANUAL" disabled={!workspace.schemaReady}>
              <option value="MANUAL">Manuel ödeme bağlantısı</option>
              <option value="IYZICO">iyzico</option>
              <option value="PAYTR">PayTR</option>
              <option value="BANK_POS">Banka sanal POS</option>
            </select>
          </label>
          <label>
            Ödeme bağlantısı
            <input name="paymentLink" type="url" placeholder="https://..." disabled={!workspace.schemaReady} />
          </label>
          <label>
            Son kullanım
            <input name="expiresAt" type="datetime-local" disabled={!workspace.schemaReady} />
          </label>
          <button type="submit" disabled={!workspace.schemaReady || !workspace.reservations.length}>Talep oluştur</button>
        </form>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">İşlemler</p>
            <h3>Ödeme geçmişi</h3>
          </div>
          <span>{workspace.payments.length} işlem</span>
        </div>

        <div className="payment-list">
          {workspace.payments.map((payment) => (
            <article className="payment-row" key={payment.id}>
              <div className="payment-summary">
                <span className={`status-pill ${statusTone[payment.status] ?? "info"}`}>{payment.statusLabel}</span>
                <div>
                  <strong>{payment.guestName}</strong>
                  <p>{payment.roomName} · {payment.providerLabel}</p>
                </div>
              </div>
              <strong className="payment-amount">{payment.amountLabel}</strong>
              <div className="payment-link-field">
                {payment.paymentLink ? (
                  <a href={payment.paymentLink} target="_blank" rel="noreferrer">{payment.paymentLink}</a>
                ) : (
                  <span>Bağlantı yok</span>
                )}
              </div>
              <form className="payment-update-form" action={updatePaymentStatus}>
                <input name="id" type="hidden" value={payment.id} />
                <select name="status" defaultValue={payment.status}>
                  <option value="CREATED">Oluşturuldu</option>
                  <option value="LINK_SENT">Bağlantı gönderildi</option>
                  <option value="PENDING">Ödeme bekliyor</option>
                  <option value="PAID">Ödendi</option>
                  <option value="FAILED">Başarısız</option>
                  <option value="EXPIRED">Süresi doldu</option>
                  <option value="REFUNDED">İade edildi</option>
                  <option value="CANCELLED">İptal edildi</option>
                </select>
                <input name="externalTransaction" defaultValue={payment.externalTransaction ?? ""} placeholder="İşlem ID" />
                <input name="failureReason" defaultValue={payment.failureReason ?? ""} placeholder="Hata / açıklama" />
                <button type="submit">Güncelle</button>
              </form>
            </article>
          ))}
          {!workspace.payments.length ? <p className="empty-state">Henüz ödeme işlemi oluşturulmadı.</p> : null}
        </div>
      </section>
    </>
  );
}
