"use client";

export default function BottomNav({ onHome, onSearch, onSell, onNotifications, onProfile }: { onHome: () => void; onSearch: () => void; onSell: () => void; onNotifications: () => void; onProfile: () => void }) {
  return <nav className="mobileBottomNav" aria-label="Mobil menü">
    <button type="button" onClick={onHome}><span>AN</span>Ana Sayfa</button>
    <button type="button" onClick={onSearch}><span>PZ</span>Pazarlar</button>
    <button type="button" className="bottomSell" onClick={onSell}><span>+</span>Satış Yap</button>
    <button type="button" onClick={onNotifications}><span>BL</span>Bildirimler</button>
    <button type="button" onClick={onProfile}><span>HS</span>Hesabım</button>
  </nav>;
}
