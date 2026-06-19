import { createStaffUser, toggleStaffUser, updateStaffUser } from "@/app/admin/users/actions";
import { getStaffWorkspace } from "@/lib/staff";

const roleOptions = [
  { value: "ADMIN", label: "Sistem yöneticisi" },
  { value: "MANAGER", label: "Otel yöneticisi" },
  { value: "RECEPTION", label: "Resepsiyon" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "ACCOUNTING", label: "Muhasebe" }
];

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const [workspace, params] = await Promise.all([getStaffWorkspace(), searchParams]);

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Erişim yönetimi</p>
          <h2>Personel ve roller</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Personel tablosu kurulmadı. Supabase&apos;de `supabase/staff-users-migration.sql` çalıştırılmalı.</p>
      ) : null}
      {params.result === "created" ? <p className="notice success">Personel hesabı oluşturuldu.</p> : null}
      {params.result === "updated" ? <p className="notice success">Personel hesabı güncellendi.</p> : null}
      {params.result === "activated" ? <p className="notice success">Personel hesabı etkinleştirildi.</p> : null}
      {params.result === "deactivated" ? <p className="notice success">Personel hesabı pasifleştirildi.</p> : null}
      {params.result === "duplicate" ? <p className="notice danger">Bu e-posta adresi zaten kullanılıyor.</p> : null}
      {params.result === "invalid" ? <p className="notice danger">Alanları kontrol edin. Şifre en az 8 karakter olmalıdır.</p> : null}
      {params.result === "self-role" ? <p className="notice danger">Kendi rolünüzü bu ekrandan değiştiremezsiniz.</p> : null}
      {params.result === "self-status" ? <p className="notice danger">Kendi hesabınızı pasifleştiremezsiniz.</p> : null}
      {params.result === "forbidden" ? <p className="notice danger">Bu kullanıcı veya rol üzerinde işlem yapma yetkiniz yok.</p> : null}

      <section className="operations-panel staff-create-panel">
        <div className="operations-panel-heading">
          <div><span>YENİ PERSONEL</span><h3>Giriş hesabı oluştur</h3></div>
        </div>
        <form className="staff-create-form" action={createStaffUser}>
          <label>Ad soyad<input name="fullName" placeholder="Personel adı" required /></label>
          <label>E-posta<input name="email" type="email" placeholder="personel@otel.com" required /></label>
          <label>Geçici şifre<input name="password" type="password" minLength={8} required /></label>
          <label>Rol
            <select name="role" defaultValue="RECEPTION">
              {roleOptions.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={!workspace.schemaReady}>Hesap oluştur</button>
        </form>
      </section>

      <section className="operations-panel staff-list-panel">
        <div className="operations-panel-heading">
          <div><span>PERSONEL</span><h3>Kullanıcı hesapları</h3></div>
          <b>{workspace.users.length} kullanıcı</b>
        </div>
        <div className="staff-list">
          {workspace.users.map((user) => (
            <article className="staff-row" key={user.id}>
              <span className="staff-avatar">{user.fullName.slice(0, 1).toUpperCase()}</span>
              <div className="staff-identity">
                <strong>{user.fullName}</strong>
                <span>{user.email}</span>
                <small>{user.lastLoginAt ? `Son giriş: ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(user.lastLoginAt)}` : "Henüz giriş yapmadı"}</small>
              </div>
              <span className={`status-pill ${user.active ? "success" : "danger"}`}>{user.active ? "Aktif" : "Pasif"}</span>
              <form className="staff-edit-form" action={updateStaffUser}>
                <input name="id" type="hidden" value={user.id} />
                <input name="fullName" defaultValue={user.fullName} aria-label="Ad soyad" required />
                <select name="role" defaultValue={user.role} aria-label="Rol">
                  {roleOptions.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}
                </select>
                <input name="password" type="password" minLength={8} placeholder="Yeni şifre (isteğe bağlı)" aria-label="Yeni şifre" />
                <button type="submit">Kaydet</button>
              </form>
              <form action={toggleStaffUser}>
                <input name="id" type="hidden" value={user.id} />
                <input name="active" type="hidden" value={String(!user.active)} />
                <button className={user.active ? "staff-deactivate" : "staff-activate"} type="submit">
                  {user.active ? "Pasifleştir" : "Etkinleştir"}
                </button>
              </form>
            </article>
          ))}
          {!workspace.users.length ? <p className="empty-state padded">Henüz veritabanı personel hesabı bulunmuyor. Ortam değişkenindeki yönetici hesabı çalışmaya devam eder.</p> : null}
        </div>
      </section>
    </>
  );
}
