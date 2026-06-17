export const rooms = [
  {
    name: "Deniz Suite",
    price: "₺6.900",
    status: "Hazır",
    occupancy: "2 yetişkin",
    source: "Web sitesi"
  },
  {
    name: "Aile Odası",
    price: "₺5.400",
    status: "Ekstra yatak",
    occupancy: "2 yetişkin, 1 çocuk",
    source: "Booking"
  },
  {
    name: "Bahçe Deluxe",
    price: "₺4.850",
    status: "Temizlikte",
    occupancy: "2 yetişkin",
    source: "Expedia"
  }
];

export const reservations = [
  {
    guest: "Ayşe Demir",
    room: "Deniz Suite",
    dates: "12-16 Temmuz 2026",
    channel: "Web sitesi",
    status: "Onaylandı",
    amount: "₺27.600"
  },
  {
    guest: "Mert Kaya",
    room: "Aile Odası",
    dates: "18-21 Temmuz 2026",
    channel: "Booking",
    status: "Ödeme bekliyor",
    amount: "₺16.200"
  },
  {
    guest: "Sofia Miller",
    room: "Bahçe Deluxe",
    dates: "22-25 Temmuz 2026",
    channel: "Airbnb",
    status: "Yeni",
    amount: "₺14.550"
  }
];

export const tasks = [
  {
    title: "203 numara bakım kontrolü",
    owner: "Teknik ekip",
    due: "Bugün 13:30",
    priority: "Yüksek"
  },
  {
    title: "Deniz Suite check-in hazırlığı",
    owner: "Housekeeping",
    due: "Bugün 14:00",
    priority: "Orta"
  },
  {
    title: "VIP misafir karşılama notu",
    owner: "Ön büro",
    due: "Yarın 10:00",
    priority: "Orta"
  }
];

export const channels = [
  {
    name: "Booking",
    status: "Senkron",
    inventory: "42 oda",
    alert: "Aile Odası fiyat planı kontrol edilmeli"
  },
  {
    name: "Expedia",
    status: "Senkron",
    inventory: "39 oda",
    alert: "Sorun yok"
  },
  {
    name: "Airbnb",
    status: "Gecikmeli",
    inventory: "12 oda",
    alert: "Stok güncellemesi 18 dakika gecikti"
  }
];
