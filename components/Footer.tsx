export default function Footer() {
  return (
    <footer className="premiumFooter">
      <div className="footerStats">
        <div><strong>10.000+</strong><span>Aktif Kullanıcı</span></div>
        <div><strong>5.000+</strong><span>Günlük Ürün</span></div>
        <div><strong>50.000+</strong><span>Başarılı Teklif</span></div>
        <div><strong>7/24</strong><span>Canlı Destek</span></div>
      </div>
      <div className="footerNewsletter">
        <div><strong>Fırsatları Kaçırma!</strong><span>En iyi teklifler için bültenimize abone olun.</span></div>
        <label><input placeholder="E-posta adresiniz"/><button type="button">Abone Ol</button></label>
      </div>
      <div className="footerBottom"><img src="/kapiskapis-logo.png" alt="KapışKapış"/><span>© 2026 KapışKapış. Tüm hakları saklıdır.</span></div>
    </footer>
  );
}
