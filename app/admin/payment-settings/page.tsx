import Link from "next/link";
import { getPaymentProviderSettings } from "@/lib/payment-providers";

export default function PaymentSettingsPage() {
  const providers = getPaymentProviderSettings();

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Ödeme yapılandırması</p>
          <h2>Ödeme sağlayıcıları</h2>
        </div>
        <Link className="admin-action secondary-action" href="/admin/payments">
          Tahsilat merkezine dön
        </Link>
      </div>

      <p className="settings-intro">
        Güvenlik nedeniyle API anahtarları yönetim panelinde saklanmaz. Sağlayıcılar Vercel Environment Variables
        üzerinden yapılandırılır; yalnızca hazır olan sağlayıcılar tahsilat ekranında görünür.
      </p>

      <div className="provider-grid payment-provider-grid">
        {providers.map((provider) => (
          <article className="admin-card payment-provider-card" key={provider.id}>
            <div className="room-card-heading">
              <span className={`status-pill ${provider.configured ? "success" : "info"}`}>
                {provider.configured ? "Hazır" : "Kurulum gerekli"}
              </span>
              <span className="muted">{provider.id}</span>
            </div>
            <h3>{provider.name}</h3>
            <p>{provider.description}</p>
            {provider.requiredVariables.length ? (
              <div className="environment-list">
                <strong>Gerekli Vercel değişkenleri</strong>
                {provider.requiredVariables.map((variable) => (
                  <code key={variable}>{variable}</code>
                ))}
              </div>
            ) : (
              <p className="provider-ready-note">Ek API ayarı gerektirmez.</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
