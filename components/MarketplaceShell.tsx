"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type IconName = "search"|"home"|"live"|"flash"|"phone"|"computer"|"game"|"watch"|"collection"|"electronic"|"home2"|"profile"|"listing"|"bid"|"heart"|"order"|"message"|"bell"|"wallet"|"settings"|"help";

function Icon({name}:{name:IconName}){
  const paths:Record<IconName,ReactNode>={
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    home:<><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
    live:<><circle cx="12" cy="12" r="3"/><path d="M5.7 5.7a9 9 0 0 0 0 12.6M18.3 5.7a9 9 0 0 1 0 12.6"/></>,
    flash:<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>,
    phone:<><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/></>,
    computer:<><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    game:<><path d="M7.5 8h9a5 5 0 0 1 4.7 6.7l-1 2.8a2 2 0 0 1-3.2.8l-2.2-1.8H9.2L7 18.3a2 2 0 0 1-3.2-.8l-1-2.8A5 5 0 0 1 7.5 8Z"/><path d="M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01"/></>,
    watch:<><circle cx="12" cy="12" r="5"/><path d="M9 7 10 2h4l1 5M9 17l1 5h4l1-5M12 9v3l2 1"/></>,
    collection:<><path d="M12 2 4 6v12l8 4 8-4V6z"/><path d="m4 6 8 4 8-4M12 10v12"/></>,
    electronic:<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h4M7 14h2M16 10h.01M18 14h.01"/></>,
    home2:<><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></>,
    profile:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    listing:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    bid:<><path d="m6 15 7-7 3 3-7 7zM14 5l5 5M3 21h10"/></>,
    heart:<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
    order:<><path d="M4 7h16l-1 14H5z"/><path d="M8 7a4 4 0 0 1 8 0"/></>,
    message:<><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></>,
    bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    wallet:<><path d="M3 6h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2z"/><path d="M3 6V5a2 2 0 0 1 2-2h12v3M16 11h5"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.8 2c-1 .7-1.6 1.2-1.6 2.5M12 17h.01"/></>
  };
  return <svg className="kkIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const menu:[string,IconName,string][]=[
  ["/","home","Ana Sayfa"],["/canli","live","Canlı Açık Artırmalar"],["/son-dakika","flash","Son Dakika"],["/kategori/telefon","phone","Telefon"],["/kategori/bilgisayar","computer","Bilgisayar"],["/kategori/oyun","game","Oyun & Konsol"],["/kategori/saat","watch","Saat"],["/kategori/koleksiyon","collection","Koleksiyon"],["/kategori/elektronik","electronic","Elektronik"],["/kategori/ev-yasam","home2","Ev & Yaşam"]
];
const account:[string,IconName,string][]=[
  ["/profil","profile","Profilim"],["/ilanlarim","listing","İlanlarım"],["/tekliflerim","bid","Tekliflerim"],["/favoriler","heart","Favorilerim"],["/siparisler","order","Siparişlerim"],["/mesajlar","message","Mesajlar"],["/bildirimler","bell","Bildirimler"],["/cuzdan","wallet","Cüzdanım"]
];

export default function MarketplaceShell({title,eyebrow,description,children,action}:{title:string;eyebrow?:string;description?:string;children:ReactNode;action?:ReactNode}){
  const pathname=usePathname();
  const active=(href:string)=>href==="/"?pathname===href:pathname.startsWith(href);
  return <main className="marketApp">
    <header className="marketHeader premiumHeader">
      <Link href="/" className="marketBrand premiumBrand" aria-label="KapışKapış ana sayfa">
        <img src="/kapiskapis-logo.png" alt="KapışKapış"/><span><b>KapışKapış</b><small>Açık Artırma Platformu</small></span>
      </Link>
      <form className="marketSearch premiumSearch" action="/arama"><Icon name="search"/><input name="q" placeholder="Ürün, marka, kategori veya satıcı ara..."/><button type="submit">Ara</button></form>
      <nav className="marketTopActions">
        <Link href="/mesajlar" aria-label="Mesajlar"><Icon name="message"/><small>2</small></Link>
        <Link href="/bildirimler" aria-label="Bildirimler"><Icon name="bell"/><small>3</small></Link>
        <Link href="/favoriler" aria-label="Favoriler"><Icon name="heart"/></Link>
        <Link href="/profil" className="marketAvatar" aria-label="Profil">K</Link>
        <Link href="/ilan-olustur" className="marketSell">+ İlan Ver</Link>
      </nav>
    </header>
    <div className="marketLayout">
      <aside className="marketSidebar premiumSidebar">
        <div className="sidebarUser"><div>K</div><span><b>Kemal Akar</b><small>Doğrulanmış kullanıcı</small></span><em>✓</em></div>
        <div className="sidebarSectionLabel">KEŞFET</div>
        <nav>{menu.map(([href,icon,label])=><Link key={href} href={href} className={active(href)?"active":""}><Icon name={icon}/><span>{label}</span>{href==="/canli"&&<i className="navLiveDot"/>}</Link>)}</nav>
        <div className="sidebarDivider"/><div className="sidebarSectionLabel">HESABIM</div>
        <nav className="accountMenu">{account.map(([href,icon,label])=><Link key={href} href={href} className={active(href)?"active":""}><Icon name={icon}/><span>{label}</span>{href==="/mesajlar"&&<i className="navCount">2</i>}</Link>)}</nav>
        <div className="sidebarDivider"/>
        <nav className="accountMenu"><Link href="/ayarlar" className={active("/ayarlar")?"active":""}><Icon name="settings"/><span>Ayarlar</span></Link><Link href="/yardim" className={active("/yardim")?"active":""}><Icon name="help"/><span>Yardım Merkezi</span></Link></nav>
        <div className="sidebarPromo"><span className="promoGlow"/><strong>Satmaya başla</strong><p>Ürününü dakikalar içinde binlerce alıcıyla buluştur.</p><Link href="/ilan-olustur">İlan oluştur <b>→</b></Link></div>
      </aside>
      <section className="marketContent"><div className="marketBreadcrumb"><Link href="/">KapışKapış</Link><span>/</span><b>{title}</b></div><div className="marketPageHead"><div>{eyebrow&&<span className="marketEyebrow">{eyebrow}</span>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{action&&<div>{action}</div>}</div>{children}</section>
    </div>
    <nav className="marketMobileNav"><Link href="/"><Icon name="home"/><span>Ana Sayfa</span></Link><Link href="/canli"><Icon name="live"/><span>Canlı</span></Link><Link href="/ilan-olustur" className="mobileSell">＋</Link><Link href="/tekliflerim"><Icon name="bid"/><span>Teklifler</span></Link><Link href="/profil"><Icon name="profile"/><span>Profil</span></Link></nav>
  </main>
}
