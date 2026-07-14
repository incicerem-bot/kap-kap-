"use client";
import type { Auction, AuctionCategory } from "./types";
const labels:Record<AuctionCategory,string>={all:"Diğer",phone:"Telefon",computer:"Bilgisayar",gaming:"Oyun",watch:"Saat",vehicle:"Araç",home:"Ev & Yaşam",camera:"Kamera",collection:"Koleksiyon"};
const money=(v:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(v);
const remain=(ends:string)=>{const d=+new Date(ends)-Date.now();if(d<=0)return"Sona erdi";const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000);return `${h} sa ${m} dk`;};
export default function CompareModal({open,auctions,onClose,onRemove,onOpen}:{open:boolean;auctions:Auction[];onClose:()=>void;onRemove:(id:string)=>void;onOpen:(a:Auction)=>void}){
 if(!open)return null;
 return <div className="modalBackdrop compareBackdrop" onMouseDown={onClose}><section className="compareModal" onMouseDown={e=>e.stopPropagation()}>
  <button className="closeButton" onClick={onClose}>×</button>
  <header><span>ÜRÜN KARŞILAŞTIRMA</span><h2>Seçtiğin ilanları karşılaştır</h2><p>Fiyat, süre ve teklif koşullarını tek ekranda gör.</p></header>
  <div className={`compareGrid compareCount${auctions.length}`}>
   {auctions.map(a=><article key={a.id}>
    <button className="compareRemove" onClick={()=>onRemove(a.id)}>Kaldır</button>
    <div className="compareImage">{a.image_url?<img src={a.image_url} alt={a.title}/>:<span>KK</span>}</div>
    <span className="compareCategory">{labels[a.category||"all"]}</span><h3>{a.title}</h3>
    <dl><div><dt>Güncel teklif</dt><dd>{money(+a.current_price)}</dd></div><div><dt>Başlangıç fiyatı</dt><dd>{money(+a.start_price)}</dd></div><div><dt>Minimum artış</dt><dd>{money(+a.min_increment)}</dd></div><div><dt>Kalan süre</dt><dd>{remain(a.ends_at)}</dd></div><div><dt>Satıcı</dt><dd>Doğrulanmış</dd></div><div><dt>Durum</dt><dd>Canlı</dd></div></dl>
    <button className="compareOpen" onClick={()=>onOpen(a)}>İlanı aç</button>
   </article>)}
  </div>
 </section></div>
}
