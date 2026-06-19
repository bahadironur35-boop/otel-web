import Link from "next/link";
import { Banknote, CreditCard, ReceiptText } from "lucide-react";
import { finalizeGuestCheckout } from "@/app/admin/actions";
import { getCheckoutWorkspace } from "@/lib/checkouts";
import { formatCurrency } from "@/lib/format";

export default async function CheckoutsPage({
  searchParams
}: {
  searchParams: Promise<{ stay?: string; result?: string }>;
}) {
  const params = await searchParams;
  const workspace = await getCheckoutWorkspace(params.stay);
  const selected = workspace.selectedStay;

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Ön büro</p>
          <h2>Çıkış işlemleri</h2>
        </div>
        <Link className="admin-action secondary-action" href="/admin/folios">Oda hesapları</Link>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Çıkış işlemleri için misafir ve folyo tabloları kurulmalıdır.</p>
      ) : null}
      {params.result === "balance" ? <p className="notice danger">Kalan bakiye için ödeme yöntemi seçin.</p> : null}
      {params.result === "error" ? <p className="notice danger">Çıkış işlemi tamamlanamadı.</p> : null}
      {params.result === "completed" ? <p className="notice success">Check-out tamamlandı ve oda temizliğe alındı.</p> : null}

      <div className="checkout-workspace">
        <aside className="operations-panel checkout-queue">
          <div className="operations-panel-heading">
            <div><span>ÇIKIŞ KUYRUĞU</span><h3>Konaklayan misafirler</h3></div>
            <b>{workspace.stays.length}</b>
          </div>
          <div className="checkout-queue-list">
            {workspace.stays.map((stay) => (
              <Link
                className={stay.id === selected?.id ? "is-selected" : ""}
                href={`/admin/checkouts?stay=${stay.id}`}
                key={stay.id}
              >
                <span className="checkout-room-number">{stay.roomNumber}</span>
                <div><strong>{stay.guestName}</strong><small>{stay.departureLabel}</small></div>
                <b>{stay.balanceLabel}</b>
              </Link>
            ))}
            {!workspace.stays.length ? <p className="empty-state padded">Aktif konaklama bulunmuyor.</p> : null}
          </div>
        </aside>

        <section className="operations-panel checkout-desk">
          {selected ? (
            <>
              <div className="checkout-guest-header">
                <div>
                  <span>ODA {selected.roomNumber}</span>
                  <h3>{selected.guestName}</h3>
                  <p>{selected.roomName} · {selected.dates}</p>
                </div>
                {selected.folioId ? (
                  <Link href={`/admin/folios?folio=${selected.folioId}`}>
                    <ReceiptText size={18} />
                    Folyo
                  </Link>
                ) : null}
              </div>

              <div className="checkout-account-lines">
                <div><span>Konaklama bedeli</span><strong>{formatCurrency(selected.accommodationTotal, selected.currency)}</strong></div>
                <div><span>Ek harcamalar</span><strong>{formatCurrency(selected.extrasTotal, selected.currency)}</strong></div>
                <div><span>Genel toplam</span><strong>{formatCurrency(selected.grandTotal, selected.currency)}</strong></div>
                <div><span>Ödenen</span><strong>{formatCurrency(selected.paidTotal, selected.currency)}</strong></div>
              </div>

              <div className={`checkout-balance ${selected.balance === 0 ? "is-paid" : ""}`}>
                <span>Kalan bakiye</span>
                <strong>{selected.balanceLabel}</strong>
                <small>{selected.balance === 0 ? "Hesap tamamen ödendi" : "Çıkış için tahsil edilmesi gereken tutar"}</small>
              </div>

              <form className="checkout-payment-form" action={finalizeGuestCheckout}>
                <input name="stayId" type="hidden" value={selected.id} />
                <div className="checkout-payment-methods">
                  {selected.balance > 0 ? (
                    <>
                      <label>
                        <input name="paymentMethod" type="radio" value="CASH" defaultChecked />
                        <Banknote size={28} />
                        <strong>Nakit</strong>
                        <span>{selected.balanceLabel}</span>
                      </label>
                      <label>
                        <input name="paymentMethod" type="radio" value="CARD" />
                        <CreditCard size={28} />
                        <strong>Kredi kartı</strong>
                        <span>{selected.balanceLabel}</span>
                      </label>
                    </>
                  ) : (
                    <input name="paymentMethod" type="hidden" value="PAID" />
                  )}
                </div>
                <label className="checkout-reference">
                  İşlem / referans numarası
                  <input name="externalTransaction" placeholder="İsteğe bağlı" />
                </label>
                <button type="submit">
                  {selected.balance > 0 ? "Tahsil et ve check-out yap" : "Check-out işlemini tamamla"}
                </button>
              </form>
            </>
          ) : (
            <p className="empty-state padded">Çıkış işlemi için bir misafir seçin.</p>
          )}
        </section>
      </div>
    </>
  );
}
