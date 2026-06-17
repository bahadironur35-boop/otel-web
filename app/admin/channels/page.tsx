import { getHotelData } from "@/lib/data";

export default async function ChannelsPage() {
  const { channels } = await getHotelData();

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Kanal yöneticisi</p>
          <h2>OTA ve yerel satış kanalları</h2>
        </div>
        <button className="admin-action" type="button">Kanal bağla</button>
      </div>
      <div className="admin-grid three">
        {channels.map((channel) => (
          <article className="admin-card room-card" key={channel.name}>
            <span className="pill">{channel.status}</span>
            <h3>{channel.name}</h3>
            <p>{channel.inventory}</p>
            <span>{channel.alert}</span>
          </article>
        ))}
      </div>
    </>
  );
}
