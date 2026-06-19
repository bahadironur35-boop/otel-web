import Link from "next/link";
import {
  Car,
  Coffee,
  GlassWater,
  PackageOpen,
  Shirt,
  Sparkles,
  Trash2,
  Utensils
} from "lucide-react";
import { addFolioItem, removeFolioItem } from "@/app/admin/actions";
import { formatCurrency } from "@/lib/format";
import { getFolioWorkspace } from "@/lib/folios";

const productIcons = {
  FOOD: Utensils,
  BEVERAGE: Coffee,
  MINIBAR: GlassWater,
  SPA: Sparkles,
  LAUNDRY: Shirt,
  TRANSPORT: Car,
  OTHER: PackageOpen
} as const;

export default async function FoliosPage({
  searchParams
}: {
  searchParams: Promise<{ folio?: string; result?: string }>;
}) {
  const params = await searchParams;
  const workspace = await getFolioWorkspace(params.folio);
  const selected = workspace.selectedFolio;

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Oda hesapları</p>
          <h2>Misafir folyosu</h2>
        </div>
        <Link className="admin-action" href="/admin/payments">Tahsilata geç</Link>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Folyo tabloları kurulmadı. Supabase&apos;de `supabase/folios-migration.sql` çalıştırılmalı.</p>
      ) : null}
      {params.result === "added" ? <p className="notice success">Harcama oda hesabına eklendi.</p> : null}
      {params.result === "removed" ? <p className="notice success">Harcama kalemi kaldırıldı.</p> : null}
      {params.result === "error" ? <p className="notice danger">Folyo işlemi tamamlanamadı.</p> : null}

      <div className="folio-workspace">
        <aside className="operations-panel folio-room-list">
          <div className="operations-panel-heading">
            <div><span>AKTİF ODALAR</span><h3>Oda hesapları</h3></div>
            <b>{workspace.folios.length}</b>
          </div>
          <div className="folio-room-buttons">
            {workspace.folios.map((folio) => (
              <Link
                className={folio.id === selected?.id ? "is-selected" : ""}
                href={`/admin/folios?folio=${folio.id}`}
                key={folio.id}
              >
                <strong>Oda {folio.roomNumber}</strong>
                <span>{folio.guestName}</span>
                <b>{formatCurrency(folio.balance, folio.currency)}</b>
              </Link>
            ))}
            {!workspace.folios.length ? <p className="empty-state padded">Aktif oda hesabı bulunmuyor.</p> : null}
          </div>
        </aside>

        <section className="operations-panel folio-account">
          {selected ? (
            <>
              <div className="folio-account-header">
                <div>
                  <span>FOLYO</span>
                  <h3>Oda {selected.roomNumber} · {selected.guestName}</h3>
                  <p>{selected.roomName} · {selected.dates}</p>
                </div>
                {selected.guestId ? <Link href={`/admin/guests/${selected.guestId}`}>Misafir profili</Link> : null}
              </div>

              <div className="folio-line-list">
                <div className="folio-line folio-line-accommodation">
                  <div><strong>Konaklama bedeli</strong><span>Rezervasyon ana tutarı</span></div>
                  <span>1</span>
                  <strong>{formatCurrency(selected.accommodationTotal, selected.currency)}</strong>
                  <span />
                </div>
                {selected.items.map((item) => (
                  <div className="folio-line" key={item.id}>
                    <div><strong>{item.description}</strong><span>{item.categoryLabel}</span></div>
                    <span>{item.quantity}</span>
                    <strong>{item.amountLabel}</strong>
                    <form action={removeFolioItem}>
                      <input name="id" type="hidden" value={item.id} />
                      <input name="folioId" type="hidden" value={selected.id} />
                      <button type="submit" title="Kalemi kaldır" aria-label={`${item.description} kalemini kaldır`}>
                        <Trash2 size={17} />
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <div className="folio-totals">
                <div><span>Konaklama</span><strong>{formatCurrency(selected.accommodationTotal, selected.currency)}</strong></div>
                <div><span>Ek harcamalar</span><strong>{formatCurrency(selected.extrasTotal, selected.currency)}</strong></div>
                <div><span>Ödenen</span><strong>{formatCurrency(selected.paidTotal, selected.currency)}</strong></div>
                <div className="folio-grand-total"><span>Kalan bakiye</span><strong>{formatCurrency(selected.balance, selected.currency)}</strong></div>
              </div>
            </>
          ) : (
            <p className="empty-state padded">İşlem yapmak için aktif bir oda hesabı seçin.</p>
          )}
        </section>

        <aside className="operations-panel folio-products">
          <div className="operations-panel-heading">
            <div><span>HIZLI EKLE</span><h3>Ürün ve hizmetler</h3></div>
          </div>
          <div className="folio-product-grid">
            {workspace.products.map((product) => {
              const Icon = productIcons[product.category];
              return (
                <form action={addFolioItem} key={`${product.category}-${product.description}`}>
                  <input name="folioId" type="hidden" value={selected?.id ?? ""} />
                  <input name="description" type="hidden" value={product.description} />
                  <input name="category" type="hidden" value={product.category} />
                  <input name="unitPrice" type="hidden" value={product.unitPrice} />
                  <input name="quantity" type="hidden" value="1" />
                  <button type="submit" disabled={!selected}>
                    <Icon size={27} strokeWidth={1.7} />
                    <strong>{product.description}</strong>
                    <span>{formatCurrency(product.unitPrice, "TRY")}</span>
                  </button>
                </form>
              );
            })}
          </div>

          <form className="folio-custom-item" action={addFolioItem}>
            <input name="folioId" type="hidden" value={selected?.id ?? ""} />
            <label>Açıklama<input name="description" placeholder="Özel hizmet" required /></label>
            <label>Kategori
              <select name="category" defaultValue="OTHER">
                <option value="FOOD">Yiyecek</option>
                <option value="BEVERAGE">İçecek</option>
                <option value="MINIBAR">Minibar</option>
                <option value="SPA">Spa</option>
                <option value="LAUNDRY">Çamaşırhane</option>
                <option value="TRANSPORT">Transfer</option>
                <option value="OTHER">Diğer</option>
              </select>
            </label>
            <label>Adet<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
            <label>Birim fiyat<input name="unitPrice" type="number" min="1" placeholder="250" required /></label>
            <button type="submit" disabled={!selected}>Özel kalem ekle</button>
          </form>
        </aside>
      </div>
    </>
  );
}
