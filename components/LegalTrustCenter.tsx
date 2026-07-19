"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

type DocId = "genel" | "uyelik" | "gizlilik" | "acik-artirma" | "satici" | "guvenli-odeme" | "mesafeli-satis";
type IconName = "shield" | "file" | "user" | "gavel" | "store" | "card" | "truck" | "lock" | "check" | "alert" | "arrow" | "download" | "search";

type LegalSection = { title: string; body: ReactNode };
type LegalDocument = {
  id: DocId;
  title: string;
  shortTitle: string;
  description: string;
  icon: IconName;
  status: "Taslak" | "Hazır" | "Hukuk onayı gerekli";
  sections: LegalSection[];
};

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6M9 8h2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    gavel: <><path d="m14 5 5 5M12 7l5 5M5 14l5 5M7 12l5 5M9 14l6-6M3 21h10"/></>,
    store: <><path d="M4 9v11h16V9M3 9l2-6h14l2 6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-6h6v6"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h4"/></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const checklist = [
  "Ürünün temel nitelikleri ve gerçek durumu",
  "Satıcı, platform ve iletişim bilgileri",
  "Toplam fiyat, hizmet bedeli ve ek masraflar",
  "Ödeme, teslimat, kargo ve şikâyet yöntemi",
  "Uygulanıyorsa cayma hakkı ve istisnaları",
  "Teklifin veya siparişin ödeme yükümlülüğü doğurduğu uyarısı",
];

const documents: LegalDocument[] = [
  {
    id: "genel",
    title: "Hukuk ve Güven Merkezi",
    shortTitle: "Genel Bakış",
    description: "KapışKapış'taki üyelik, teklif, satış, ödeme, veri ve tüketici süreçlerinin tek merkezi.",
    icon: "shield",
    status: "Taslak",
    sections: [
      { title: "KapışKapış'ın rolü", body: <p>KapışKapış, alıcı ve satıcıların açık artırma yoluyla işlem kurmasına aracılık eden bir pazaryeri olarak tasarlanmıştır. Platformun hangi işlemlerde aracı, hangi işlemlerde doğrudan hizmet sağlayıcı olduğu sözleşmelerde açıkça ayrılmalıdır.</p> },
      { title: "Canlıya geçmeden önce", body: <><p>Bu merkez ürün tasarımı ve hukuk danışmanlığına hazırlık için oluşturulmuş bir taslaktır. Şirket unvanı, MERSİS/vergi bilgileri, adres, iletişim kanalları, ödeme kuruluşu, komisyonlar ve veri saklama süreleri kesinleşmeden metinler yayınlanmamalıdır.</p><div className="legalAlertV14"><Icon name="alert"/><span>Şirket bilgileri ve gerçek operasyon modeli doldurulmadan bu metinler hukuki sözleşme olarak kullanılmamalıdır.</span></div></> },
      { title: "Kullanıcının tek ekranda göreceği bilgiler", body: <ul>{checklist.map((item) => <li key={item}><Icon name="check"/>{item}</li>)}</ul> },
    ],
  },
  {
    id: "uyelik",
    title: "Üyelik Sözleşmesi",
    shortTitle: "Üyelik",
    description: "Hesap açma, kullanıcı yükümlülükleri, yasaklı davranışlar ve hesabın kapatılması.",
    icon: "user",
    status: "Hukuk onayı gerekli",
    sections: [
      { title: "Taraflar ve kapsam", body: <p>Platform işletmecisinin tam ticaret unvanı, adresi ve iletişim bilgileri ile üyelik oluşturan kişinin hak ve yükümlülükleri bu bölümde tanımlanmalıdır. Kullanıcı, hesabındaki bilgilerin doğru ve güncel olmasından sorumlu olmalıdır.</p> },
      { title: "Hesap güvenliği", body: <ul><li><Icon name="check"/>Şifre ve doğrulama kodları üçüncü kişilerle paylaşılmamalıdır.</li><li><Icon name="check"/>Şüpheli cihaz ve oturumlar kullanıcıya bildirilmelidir.</li><li><Icon name="check"/>Kimlik, telefon ve ödeme doğrulamaları işlem riskine göre istenebilmelidir.</li></ul> },
      { title: "Yasaklı davranışlar", body: <ul><li><Icon name="check"/>Sahte teklif, fiyat şişirme veya kendi ilanına teklif verme.</li><li><Icon name="check"/>Platform dışı ödeme ve kullanıcıyı yanıltan iletişim.</li><li><Icon name="check"/>Sahte, çalıntı, yasaklı veya yanıltıcı ürün ilanı.</li><li><Icon name="check"/>Başka kişiye ait kimlik ya da ödeme aracını izinsiz kullanma.</li></ul> },
      { title: "Hesap kısıtlama ve itiraz", body: <p>Riskli işlem, sözleşme ihlali veya güvenlik şüphesinde hesabın geçici olarak sınırlandırılabileceği; kullanıcının karar gerekçesini öğrenme ve destek merkezi üzerinden itiraz etme yöntemi açıkça gösterilmelidir.</p> },
    ],
  },
  {
    id: "gizlilik",
    title: "KVKK Aydınlatma ve Gizlilik",
    shortTitle: "KVKK & Gizlilik",
    description: "İşlenen kişisel veriler, amaçlar, hukuki sebepler, aktarımlar ve kullanıcı hakları.",
    icon: "lock",
    status: "Hukuk onayı gerekli",
    sections: [
      { title: "Veri sorumlusu bilgileri", body: <div className="legalPlaceholderV14"><b>Doldurulması zorunlu şirket alanları</b><span>Veri sorumlusu: [Şirket unvanı]</span><span>Adres: [Şirket adresi]</span><span>KEP / e-posta: [KVKK başvuru kanalı]</span><span>MERSİS / vergi no: [Bilgi]</span></div> },
      { title: "İşlenebilecek veri grupları", body: <ul><li><Icon name="check"/>Kimlik, iletişim ve hesap bilgileri.</li><li><Icon name="check"/>Teklif, sipariş, ödeme ve işlem güvenliği kayıtları.</li><li><Icon name="check"/>Kargo, teslimat, uyuşmazlık ve destek kayıtları.</li><li><Icon name="check"/>Cihaz, oturum, IP ve dolandırıcılık önleme sinyalleri.</li></ul> },
      { title: "Aydınlatma ve açık rıza ayrımı", body: <p>Kullanıcıya hangi verilerin neden işlendiği, kimlere aktarılabileceği, veri toplama yöntemi ve hukuki sebep ile başvuru hakları işlem başlamadan önce açıklanmalıdır. Kampanya izni gibi açık rızaya dayalı tercihler, üyelik sözleşmesinden ve aydınlatma metninden ayrı tutulmalıdır.</p> },
      { title: "Kullanıcı hakları", body: <ul><li><Icon name="check"/>Verilerinin işlenip işlenmediğini ve işleme amacını öğrenme.</li><li><Icon name="check"/>Eksik veya yanlış verilerin düzeltilmesini isteme.</li><li><Icon name="check"/>Koşulları oluştuğunda silme veya yok etme talep etme.</li><li><Icon name="check"/>Aktarılan üçüncü kişileri ve otomatik analiz sonuçlarını öğrenme.</li><li><Icon name="check"/>Kanuna aykırı işleme nedeniyle zararın giderilmesini isteme.</li></ul> },
    ],
  },
  {
    id: "acik-artirma",
    title: "Açık Artırma ve Teklif Kuralları",
    shortTitle: "Teklif Kuralları",
    description: "Teklif bağlayıcılığı, otomatik teklif, süre uzatma, taban fiyat ve yasaklı teklif davranışları.",
    icon: "gavel",
    status: "Taslak",
    sections: [
      { title: "Teklif verme", body: <p>Kullanıcı teklif vermeden hemen önce teklifin kazanması halinde ödeme yükümlülüğü doğuracağı açıkça gösterilmelidir. Minimum artış tutarı, güncel fiyat, kalan süre ve varsa hizmet bedeli teklif onay ekranında görünmelidir.</p> },
      { title: "Otomatik teklif", body: <p>Kullanıcının belirlediği gizli üst sınır diğer kullanıcılara ve satıcıya gösterilmez. Sistem, mevcut teklif ve artış adımına göre kullanıcı adına yalnızca gerekli tutara kadar teklif yükseltir.</p> },
      { title: "Son dakika uzatma", body: <p>Açık artırmanın son anlarında verilen tekliflerin süreyi uzatıp uzatmadığı ve uzatıyorsa kaç dakika uzattığı ilan başlamadan önce açıkça belirtilmelidir.</p> },
      { title: "Geçersiz ve manipülatif teklifler", body: <ul><li><Icon name="check"/>Satıcının kendisi veya bağlantılı hesaplarla fiyat artırması yasaktır.</li><li><Icon name="check"/>Ödeme niyeti olmadan teklif vermek hesap kısıtlamasına neden olabilir.</li><li><Icon name="check"/>Teknik hata, şüpheli işlem veya hukuki zorunluluk halinde teklif incelemeye alınabilir.</li></ul> },
    ],
  },
  {
    id: "satici",
    title: "Satıcı ve İlan Kuralları",
    shortTitle: "Satıcı Kuralları",
    description: "Ürün doğruluğu, görseller, yasaklı ürünler, teslimat ve ticari satıcı sorumlulukları.",
    icon: "store",
    status: "Taslak",
    sections: [
      { title: "Doğru ve eksiksiz ilan", body: <p>Satıcı ürünün marka, model, kondisyon, arıza, onarım, aksesuar, garanti ve mülkiyet durumunu doğru açıklamalıdır. Fotoğraflar satılan ürüne ait olmalı ve önemli kusurlar gizlenmemelidir.</p> },
      { title: "Satıcı türü", body: <p>Gerçek kişinin arızi ikinci el satışı ile ticari veya mesleki amaçla satış yapan satıcının hukuki yükümlülükleri aynı olmayabilir. Platform, satıcı türünü doğrulamalı ve alıcıya işlem öncesinde göstermelidir.</p> },
      { title: "Kargo ve teslimat", body: <ul><li><Icon name="check"/>Ürün ilan edilen hazırlık süresinde kargoya verilmelidir.</li><li><Icon name="check"/>Takip numarası ve doğru paket bilgileri sisteme girilmelidir.</li><li><Icon name="check"/>Seri numarası, paketleme ve ürün durumu gerektiğinde kanıtlanabilir olmalıdır.</li></ul> },
      { title: "Yasaklı ürünler", body: <p>Mevzuata aykırı, çalıntı, sahte, güvenli olmayan veya platform kategorilerine uymayan ürünler yayınlanmamalıdır. Kesin yasaklı ürün listesi operasyon ve hukuk ekipleri tarafından ayrıca hazırlanmalıdır.</p> },
    ],
  },
  {
    id: "guvenli-odeme",
    title: "Güvenli Ödeme Koşulları",
    shortTitle: "Güvenli Ödeme",
    description: "Tahsilat, koruma süresi, satıcıya aktarım, iade, komisyon ve uyuşmazlık blokesi.",
    icon: "card",
    status: "Hukuk onayı gerekli",
    sections: [
      { title: "Ödemenin korunması", body: <p>Alıcıdan tahsil edilen tutarın hangi lisanslı ödeme kuruluşu üzerinden işlendiği, KapışKapış'ın paraya hukuken hangi sıfatla temas ettiği ve tutarın satıcıya aktarılma koşulları açıkça belirtilmelidir.</p> },
      { title: "Satıcıya aktarım", body: <p>Ödeme; teslimatın doğrulanması, alıcının onayı, otomatik onay süresinin dolması veya uyuşmazlığın sonuçlanması gibi tanımlı olaylardan sonra satıcıya aktarılmalıdır. Kesinti kalemleri aktarım öncesinde satıcıya gösterilmelidir.</p> },
      { title: "Ücretler ve komisyon", body: <div className="legalPlaceholderV14"><b>Canlıya geçmeden doldurulacak alanlar</b><span>Alıcı koruma hizmet bedeli: [% / sabit tutar]</span><span>Satıcı komisyonu: [% / kategori bazlı]</span><span>Para çekme ücreti ve süresi: [Bilgi]</span><span>İade halinde ücretlerin durumu: [Bilgi]</span></div> },
      { title: "Uyuşmazlıkta ödeme", body: <p>Alıcının süresinde sorun bildirmesi halinde satıcıya aktarım geçici olarak durdurulabilir. Tarafların kanıtları, kargo kayıtları ve ürün açıklaması incelenerek iade, kısmi iade veya ödemenin satıcıya aktarılması kararı verilir.</p> },
    ],
  },
  {
    id: "mesafeli-satis",
    title: "Ön Bilgilendirme ve Mesafeli Satış",
    shortTitle: "Mesafeli Satış",
    description: "Sipariş öncesi bilgilendirme, satıcı türü, cayma hakkı ve işlem kayıtları.",
    icon: "truck",
    status: "Hukuk onayı gerekli",
    sections: [
      { title: "Sipariş veya kazanan teklif öncesi", body: <ul>{checklist.map((item) => <li key={item}><Icon name="check"/>{item}</li>)}</ul> },
      { title: "Cayma hakkı", body: <p>Tüketici işlemlerinde genel kural olarak mesafeli sözleşmeler için on dört günlük cayma hakkı bulunur; ancak satıcının tüketici işlemi kapsamında hareket edip etmediği, ürün türü ve mevzuattaki istisnalar ayrıca değerlendirilmelidir. KapışKapış her işlemde satıcı türünü ve uygulanacak iade/cayma koşulunu ödeme öncesinde açıkça göstermelidir.</p> },
      { title: "Açık artırmaya özgü bilgilendirme", body: <p>Açık artırma yoluyla kurulan sözleşmelerde bazı satıcı bilgilerinin yerine açık artırmayı yapan ile ilgili bilgiler gösterilebilse de ürünün temel nitelikleri, toplam maliyet, teslimat, şikâyet ve cayma koşulları gibi temel ön bilgilendirme yükümlülükleri korunmalıdır.</p> },
      { title: "Kayıt ve ispat", body: <p>Ön bilgilendirme onayı, teklif/sipariş zamanı, sözleşme sürümü, fiyat ve ücretler, teslimat ve cayma/uyuşmazlık işlemleri sonradan doğrulanabilecek şekilde saklanmalıdır.</p> },
    ],
  },
];

export default function LegalTrustCenter({ initialDoc = "genel" }: { initialDoc?: string }) {
  const safeInitial = documents.some((item) => item.id === initialDoc) ? initialDoc as DocId : "genel";
  const [activeId, setActiveId] = useState<DocId>(safeInitial);
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState<number[]>([0, 1]);
  const active = documents.find((item) => item.id === activeId) ?? documents[0];

  const filteredDocs = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) return documents;
    return documents.filter((item) => `${item.title} ${item.description} ${item.sections.map((section) => section.title).join(" ")}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);

  function chooseDocument(id: DocId) {
    setActiveId(id);
    setOpenSections([0, 1]);
    window.history.replaceState(null, "", `/hukuk?doc=${id}`);
  }

  function toggleSection(index: number) {
    setOpenSections((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <div className="legalCenterV14">
      <section className="legalHeroV14">
        <div>
          <span><Icon name="shield"/> KAPIŞKAPIŞ GÜVEN STANDARDI</span>
          <h2>Kurallar gizli değil, işlemden önce açık.</h2>
          <p>Üyelikten teklif vermeye, ödeme korumasından kişisel verilere kadar kullanıcıların bilmesi gereken her şeyi tek yerde topluyoruz.</p>
          <div className="legalHeroActionsV14"><Link href="/yardim">Destek merkezine git <Icon name="arrow"/></Link><Link href="/ayarlar">Veri ve gizlilik ayarları</Link></div>
        </div>
        <div className="legalTrustScoreV14"><span>HAZIRLIK DURUMU</span><strong>7</strong><p>temel metin ve süreç taslağı</p><div><i style={{width:"78%"}}/></div><small>Şirket bilgileri ve hukuk onayı bekleniyor</small></div>
      </section>

      <section className="legalNoticeV14"><Icon name="alert"/><div><b>Önemli uygulama notu</b><p>Bu sayfadaki metinler ürün geliştirme taslağıdır. Gerçek şirket, ödeme, komisyon, satıcı modeli ve veri akışına göre Türkiye'de yetkili bir hukuk danışmanı tarafından son kontrolden geçirilmelidir.</p></div></section>

      <div className="legalWorkspaceV14">
        <aside className="legalNavV14">
          <div className="legalSearchV14"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Metinlerde ara"/></div>
          <nav aria-label="Hukuki metinler">
            {filteredDocs.map((item) => <button key={item.id} type="button" className={activeId === item.id ? "active" : ""} onClick={() => chooseDocument(item.id)}><span><Icon name={item.icon}/></span><div><b>{item.shortTitle}</b><small>{item.status}</small></div><Icon name="arrow"/></button>)}
          </nav>
          {filteredDocs.length === 0 && <div className="legalNoResultV14">Aramana uygun metin bulunamadı.</div>}
          <div className="legalVersionV14"><span>SON GÜNCELLEME</span><b>19 Temmuz 2026</b><small>Sürüm 0.14 · Ürün taslağı</small></div>
        </aside>

        <article className="legalDocumentV14">
          <header>
            <div className="legalDocIconV14"><Icon name={active.icon}/></div>
            <div><span>{active.status}</span><h3>{active.title}</h3><p>{active.description}</p></div>
            <button type="button" onClick={() => window.print()}><Icon name="download"/> Yazdır / PDF</button>
          </header>

          <div className="legalMetaV14"><span>Belge sürümü <b>2026.07</b></span><span>Yürürlük <b>Hukuk onayı sonrası</b></span><span>Dil <b>Türkçe</b></span></div>

          <div className="legalSectionsV14">
            {active.sections.map((section, index) => {
              const open = openSections.includes(index);
              return <section key={section.title} className={open ? "open" : ""}><button type="button" onClick={() => toggleSection(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{section.title}</b><i>+</i></button>{open && <div>{section.body}</div>}</section>;
            })}
          </div>

          <footer className="legalDocFooterV14"><div><Icon name="shield"/><span><b>Bir hata veya eksik mi gördün?</b><small>Hukuki metin ve güvenlik süreçleri için destek talebi oluştur.</small></span></div><Link href="/yardim">Talep oluştur <Icon name="arrow"/></Link></footer>
        </article>
      </div>

      <section className="legalProcessV14"><header><span>CANLIYA GEÇİŞ KONTROLÜ</span><h3>Metin değil, çalışan süreç gerekli</h3><p>Hukuki ekranların arka plandaki gerçek işlem kayıtlarıyla desteklenmesi gerekir.</p></header><div>{[
        ["01","Şirket bilgileri","Unvan, MERSİS, adres ve iletişim alanlarını doldur."],
        ["02","Sözleşme sürümü","Kullanıcının kabul ettiği sürümü tarih ve zamanla kaydet."],
        ["03","Ayrı izinler","Aydınlatma, sözleşme ve kampanya izinlerini ayrı işle."],
        ["04","İşlem kanıtı","Teklif, fiyat, ücret, teslimat ve onay kayıtlarını sakla."],
      ].map(([no,title,text]) => <article key={no}><span>{no}</span><b>{title}</b><p>{text}</p></article>)}</div></section>
    </div>
  );
}
