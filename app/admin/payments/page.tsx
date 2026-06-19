import Link from "next/link";
import { updatePaymentStatus } from "@/app/admin/actions";
import { PaymentRequestPanel } from "@/components/payment-request-panel";
import { getConfiguredPaymentProviders } from "@/lib/payment-providers";
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
  const configuredProviders = getConfiguredPaymentProviders();

  return (
    <>
      <div className="admin-topline payments-topline">
        <div>
          <p className="section-kicker">Tahsilat merkezi</p>
          <h2>Tahsilat talepleri ve işlem durumları</h2>
        </div>
        <Link className="admin-action" href="/admin/payment-settings">
          Ödeme Ayarları
        </Link>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Ödeme tablosu henüz kurulmadı. Supabase'de `supabase/payments-migration.sql` çalıştırılmalı.</p>
      ) : null}
      {params.result === "created" ? <p className="notice success">Tahsilat talebi oluşturuldu.</p> : null}
      {params.result === "updated" ? <p className="notice success">Tahsilat durumu güncellendi.</p> : null}
      {params.result === "error" ? <p className="notice danger">Tahsilat işlemi tamamlanamadı.</p> : null}
      {params.result === "already-paid" ? <p className="notice">Bu rezervasyonun güncel folyo bakiyesi tamamen ödenmiş.</p> : null}
      {params.result === "provider-not-configured" ? (
        <p className="notice danger">Seçilen ödeme sağlayıcısı henüz yapılandırılmadı.</p>
      ) : null}

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Yeni tahsilat</p>
            <h3>Rezervasyona dokunarak seçim yapın</h3>
          </div>
          <span>{workspace.reservations.length} rezervasyon</span>
        </div>
        <PaymentRequestPanel
          reservations={workspace.reservations}
          providers={configuredProviders.map((provider) => ({ id: provider.id, name: provider.name }))}
          schemaReady={workspace.schemaReady}
        />
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">İşlemler</p>
            <h3>Tahsilat geçmişi</h3>
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
          {!workspace.payments.length ? <p className="empty-state">Henüz tahsilat işlemi oluşturulmadı.</p> : null}
        </div>
      </section>
    </>
  );
}
