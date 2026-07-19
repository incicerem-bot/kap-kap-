export type Product = {
  id: string;
  title: string;
  category: string;
  price: string;
  next: string;
  bids: number;
  time: string;
  image: string;
  live: boolean;
  verified: boolean;
  condition: string;
};

export const demoProducts: Product[] = [
  { id: "rolex-submariner", title: "Rolex Submariner Date", category: "Saat", price: "125.000 TL", next: "126.000 TL", bids: 28, time: "03:35:10", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85", live: true, verified: true, condition: "Çok iyi" },
  { id: "iphone-15-pro", title: "iPhone 15 Pro 256 GB", category: "Telefon", price: "47.850 TL", next: "48.100 TL", bids: 41, time: "00:18:42", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85", live: true, verified: true, condition: "Az kullanılmış" },
  { id: "ps5-slim", title: "PlayStation 5 Slim", category: "Oyun & Konsol", price: "18.250 TL", next: "18.500 TL", bids: 19, time: "01:42:16", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85", live: false, verified: true, condition: "Garantili" },
  { id: "macbook-pro", title: "MacBook Pro M3 Pro", category: "Bilgisayar", price: "79.900 TL", next: "80.500 TL", bids: 33, time: "05:21:08", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85", live: true, verified: true, condition: "Kutulu" },
  { id: "sony-alpha", title: "Sony Alpha A7 IV", category: "Elektronik", price: "62.300 TL", next: "62.750 TL", bids: 22, time: "08:11:54", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", live: false, verified: true, condition: "Çok iyi" },
  { id: "lego-technic", title: "LEGO Technic Koleksiyon", category: "Koleksiyon", price: "9.750 TL", next: "9.900 TL", bids: 14, time: "12:08:30", image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=85", live: false, verified: false, condition: "Sıfır ayarında" },
];

export function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function parsePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}
