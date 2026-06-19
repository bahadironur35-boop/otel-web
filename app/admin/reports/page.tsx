import {
  Banknote,
  BedDouble,
  CalendarCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  WalletCards
} from "lucide-react";
import { getReportsWorkspace } from "@/lib/reports";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const report = await getReportsWorkspace(params.from, params.to);

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Yönetim raporları</p>
          <h2>Gelir ve performans analizi</h2>
        </div>
      </div>

      {!report.schemaReady ? (
        <p className="notice danger">Rapor verileri şu anda okunamıyor. Veritabanı bağlantısını kontrol edin.</p>
      ) : null}

      <form className="report-filters" method="get">
        <label>Başlangıç<input name="from" type="date" defaultValue={report.range.from} /></label>
        <label>Bitiş<input name="to" type="date" defaultValue={report.range.to} /></label>
        <button type="submit">Raporu güncelle</button>
      </form>

      <div className="report-metrics">
        <article><span className="report-icon blue"><ChartNoAxesCombined /></span><div><small>Rezervasyon geliri</small><strong>{report.metrics.revenue}</strong><span>{report.metrics.reservations} rezervasyon</span></div></article>
        <article><span className="report-icon green"><Banknote /></span><div><small>Tahsil edilen</small><strong>{report.metrics.collected}</strong><span>Ödenmiş işlemler</span></div></article>
        <article><span className="report-icon violet"><BedDouble /></span><div><small>Doluluk</small><strong>%{report.metrics.occupancy}</strong><span>Satılabilir oda gecesi</span></div></article>
        <article><span className="report-icon amber"><CircleDollarSign /></span><div><small>ADR</small><strong>{report.metrics.adr}</strong><span>Ortalama günlük fiyat</span></div></article>
        <article><span className="report-icon cyan"><WalletCards /></span><div><small>RevPAR</small><strong>{report.metrics.revPar}</strong><span>Oda başı gelir</span></div></article>
      </div>

      <div className="report-primary-grid">
        <section className="operations-panel report-chart-panel">
          <div className="operations-panel-heading"><div><span>GELİR EĞİLİMİ</span><h3>Aylık rezervasyon geliri</h3></div></div>
          <div className="report-bar-chart">
            {report.monthly.map((month) => (
              <div className="report-bar-column" key={month.label}>
                <span className="report-bar-value">{month.revenueLabel}</span>
                <div className="report-bar-track"><span style={{ height: `${month.height}%` }} /></div>
                <strong>{month.label}</strong>
                <small>{month.reservations} rez.</small>
              </div>
            ))}
            {!report.monthly.length ? <p className="empty-state">Seçilen aralıkta aylık veri yok.</p> : null}
          </div>
        </section>

        <section className="operations-panel">
          <div className="operations-panel-heading"><div><span>KANAL DAĞILIMI</span><h3>Rezervasyon kaynakları</h3></div></div>
          <div className="report-ranking-list">
            {report.channels.map((channel, index) => (
              <div key={channel.name}>
                <span className="report-rank">{index + 1}</span>
                <div><strong>{channel.name}</strong><span>{channel.reservations} rezervasyon</span></div>
                <div className="report-progress"><span style={{ width: `${channel.share}%` }} /></div>
                <b>{channel.revenueLabel}</b>
                <small>%{channel.share}</small>
              </div>
            ))}
            {!report.channels.length ? <p className="empty-state padded">Seçilen aralıkta kanal verisi yok.</p> : null}
          </div>
        </section>
      </div>

      <div className="report-secondary-grid">
        <section className="operations-panel">
          <div className="operations-panel-heading"><div><span>ODA TİPLERİ</span><h3>Konaklama performansı</h3></div></div>
          <div className="report-table">
            <div className="report-table-head"><span>Oda tipi</span><span>Rezervasyon</span><span>Gece</span><span>ADR</span><span>Gelir</span></div>
            {report.roomTypes.map((room) => (
              <div className="report-table-row" key={room.name}>
                <strong>{room.name}</strong>
                <span>{room.reservations}</span>
                <span>{room.roomNights}</span>
                <span>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(room.adr)}</span>
                <strong>{room.revenueLabel}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="operations-panel">
          <div className="operations-panel-heading"><div><span>TAHSİLAT</span><h3>Ödeme yöntemi dağılımı</h3></div></div>
          <div className="report-payment-list">
            {report.payments.map((payment) => (
              <div key={payment.provider}>
                <span className="report-payment-icon"><CalendarCheck size={18} /></span>
                <div><strong>{payment.label}</strong><span>%{payment.share} pay</span></div>
                <b>{payment.amountLabel}</b>
              </div>
            ))}
            {!report.payments.length ? <p className="empty-state padded">Seçilen aralıkta tahsilat yok.</p> : null}
          </div>
        </section>
      </div>
    </>
  );
}
