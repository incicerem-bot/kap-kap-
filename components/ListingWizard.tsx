"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const steps = ["Tür Seçimi", "Bilgiler", "Fotoğraflar", "Fiyat", "Kargo", "Önizleme"];
const categories = [
  ["Elektronik","▯"],["Bilgisayar","▱"],["Telefon","▥"],["Oyun & Konsol","♧"],["Ev & Yaşam","♙"],["Koleksiyon","◇"],["Nadir Oyun İtemleri","♧"],["Diğer","•••"]
];

export default function ListingWizard(){
  const [step,setStep]=useState(0);
  const [category,setCategory]=useState("Elektronik");
  const [published,setPublished]=useState(false);
  const [form,setForm]=useState({title:"iPhone 15 Pro Max 256GB Titanyum Siyah",condition:"İkinci El - Çok İyi",brand:"Apple",model:"iPhone 15 Pro Max",storage:"256GB",description:"Cihaz çok temiz kullanılmıştır. Herhangi bir sorunu yoktur.",start:"10.000",reserve:"20.000",buyNow:"35.000",increment:"250",duration:"7 Gün",shipping:"KapışKapış Kargo",shippingPayer:"Alıcı Öder",delivery:"1-2 İş Günü"});
  const set=(key:string,value:string)=>setForm(v=>({...v,[key]:value}));
  const next=()=> step<5 ? setStep(step+1) : setPublished(true);
  const progress=useMemo(()=>((step+1)/6)*100,[step]);

  if(published) return <div className="publishSuccessRef"><div className="confettiRef">✦　✧　✦</div><div className="successIconRef">✓</div><h2>İlanınız Yayınlandı!</h2><p>Tebrikler! İlanınız başarıyla yayınlandı.<br/>Alıcılar şimdi teklif verebilir.</p><div className="listingNumberRef"><span>İlan Numarası</span><strong>#985421</strong></div><Link href="/ilanlarim" className="wizardPrimary">İlanımı Görüntüle</Link><button onClick={()=>{setStep(0);setPublished(false)}}>Yeni İlan Oluştur</button></div>;

  return <div className="listingWizardRef">
    <div className="wizardProgressRef"><div style={{width:`${progress}%`}}/><ol>{steps.map((s,i)=><li key={s} className={i<=step?'active':''}><b>{i+1}</b><span>{s}</span></li>)}</ol></div>

    {step===0&&<section className="wizardStageRef"><h2>İlan türünü seçin</h2><p>İlanınızın kategorisini seçerek başlayın.</p><div className="categoryChoiceRef">{categories.map(([name,icon])=><button key={name} className={category===name?'selected':''} onClick={()=>setCategory(name)}><span>{icon}</span><b>{name}</b></button>)}</div></section>}

    {step===1&&<section className="wizardStageRef"><h2>Temel Bilgiler</h2><div className="wizardFormRef"><label>Başlık<input value={form.title} onChange={e=>set('title',e.target.value)}/></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(([n])=><option key={n}>{n}</option>)}</select></label><label>Ürün Durumu<select value={form.condition} onChange={e=>set('condition',e.target.value)}><option>İkinci El - Çok İyi</option><option>Yeni</option><option>İyi</option><option>Kullanılmış</option></select></label><div className="twoInputRef"><label>Marka<input value={form.brand} onChange={e=>set('brand',e.target.value)}/></label><label>Model<input value={form.model} onChange={e=>set('model',e.target.value)}/></label></div><label>Depolama<input value={form.storage} onChange={e=>set('storage',e.target.value)}/></label><label>Açıklama<textarea value={form.description} onChange={e=>set('description',e.target.value)} maxLength={2000}/><small>{form.description.length}/2000</small></label></div></section>}

    {step===2&&<section className="wizardStageRef"><h2>Fotoğraflar</h2><p>En az 3, en fazla 10 fotoğraf ekleyebilirsiniz.</p><div className="photoGridRef"><div className="heroPhoneMock"><span>Ana Fotoğraf</span><div>📱</div></div>{[1,2,3,4].map(i=><div className="phoneThumbMock" key={i}>📱</div>)}<label className="addPhotoRef">＋<b>Fotoğraf Ekle</b><input type="file" multiple/></label></div></section>}

    {step===3&&<section className="wizardStageRef"><h2>Fiyat & Açık Artırma</h2><div className="wizardFormRef"><label>Başlangıç Fiyatı<input value={form.start} onChange={e=>set('start',e.target.value)}/></label><label>Gizli Taban Fiyat (satışta bağlı)<input value={form.reserve} onChange={e=>set('reserve',e.target.value)}/><small>Bu fiyat sadece size görünür. Bu tutarın altında satış gerçekleşmez.</small></label><label>Açık Artırma Süresi<select value={form.duration} onChange={e=>set('duration',e.target.value)}><option>1 Gün</option><option>3 Gün</option><option>7 Gün</option></select></label><label>Teklif Artış Adımı<select value={form.increment} onChange={e=>set('increment',e.target.value)}><option>100 TL</option><option>250 TL</option><option>500 TL</option></select></label><label>Hemen Al Fiyatı (isteğe bağlı)<input value={form.buyNow} onChange={e=>set('buyNow',e.target.value)}/></label></div></section>}

    {step===4&&<section className="wizardStageRef"><h2>Kargo & Teslimat</h2><div className="shippingChoiceRef">{["KapışKapış Kargo","Kendi Kargom","El İlanı Teslim"].map((x,i)=><button key={x} className={form.shipping===x?'selected':''} onClick={()=>set('shipping',x)}><span>{i===0?'●':'○'}</span><div><b>{x}{i===0&&<em> Önerilen</em>}</b><small>{i===0?'Güvenli, sigortalı ve hızlı teslimat.':i===1?'Kendim kargolarım.':'Yüz yüze teslim edilecek.'}</small></div></button>)}</div><div className="wizardFormRef"><label>Kargo Ücreti<select value={form.shippingPayer} onChange={e=>set('shippingPayer',e.target.value)}><option>Alıcı Öder</option><option>Satıcı Öder</option></select></label><label>Tahmini Kargoya Teslim Süresi<select value={form.delivery} onChange={e=>set('delivery',e.target.value)}><option>1-2 İş Günü</option><option>3 İş Günü</option><option>5 İş Günü</option></select></label></div></section>}

    {step===5&&<section className="wizardStageRef"><h2>Önizleme</h2><div className="previewProductRef"><div className="previewPhoneRef">📱</div><div><b>{form.title}</b><small>{category} › {form.model}</small><small>{form.condition}</small></div></div><dl className="previewDetailsRef"><div><dt>Başlangıç Fiyatı</dt><dd>{form.start} TL</dd></div><div><dt>Gizli Taban Fiyat</dt><dd>{form.reserve} TL</dd></div><div><dt>Hemen Al Fiyatı</dt><dd>{form.buyNow} TL</dd></div><div><dt>Açık Artırma Süresi</dt><dd>{form.duration}</dd></div><div><dt>Teklif Artış Adımı</dt><dd>{form.increment}</dd></div><div><dt>Kargo</dt><dd>{form.shipping}</dd></div><div><dt>Kargo Ücreti</dt><dd>{form.shippingPayer}</dd></div></dl></section>}

    <div className="wizardFooterRef">{step>0&&<button onClick={()=>setStep(step-1)}>← Geri</button>}<button className="wizardPrimary" onClick={next}>{step===5?'İlanı Yayınla':'Devam Et'}</button></div>
  </div>
}
