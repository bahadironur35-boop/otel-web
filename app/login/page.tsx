import Link from "next/link";
import { loginAction } from "@/app/login/actions";
import { isAuthConfigured } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; logout?: string }>;
}) {
  const params = await searchParams;
  const configured = isAuthConfigured();

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link className="brand login-brand" href="/">
          <span className="brand-mark">S</span>
          <span>StayOS</span>
        </Link>
        <p className="section-kicker">Yönetim girişi</p>
        <h1>Panel erişimi</h1>
        <p>Rezervasyon, oda, görev ve kanal yönetimi için giriş yap.</p>

        {!configured ? (
          <div className="notice danger">
            Admin girişi için Vercel Environment Variables alanına ADMIN_EMAIL, ADMIN_PASSWORD ve SESSION_SECRET ekle.
          </div>
        ) : null}
        {params.error ? <div className="notice danger">E-posta veya şifre hatalı.</div> : null}
        {params.logout ? <div className="notice success">Çıkış yapıldı.</div> : null}

        <form className="login-form" action={loginAction}>
          <label>
            E-posta
            <input name="email" type="email" autoComplete="username" required disabled={!configured} />
          </label>
          <label>
            Şifre
            <input name="password" type="password" autoComplete="current-password" required disabled={!configured} />
          </label>
          <button type="submit" disabled={!configured}>
            Giriş yap
          </button>
        </form>
      </section>
    </main>
  );
}
