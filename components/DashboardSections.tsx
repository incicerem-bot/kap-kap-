"use client";
import type { Auction,AuctionOrder } from "./types";
const m=(v:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(v);
export default function DashboardSections({auctions,orders,onOpenAuction}:{auctions:Auction[];orders:AuctionOrder[];onOpenAuction:(a:Auction)=>void}){
 const trend=[...auctions].sort((a,b)=>(+b.current_price-+b.start_price)-(+a.current_price-+a.start_price)).slice(0,4);
 const ending=[...auctions].sort((a,b)=>+new Date(a.ends_at)-+new Date(b.ends_at)).slice(0,4);
 const sold=orders.filter(o=>["shipped","delivered"].includes(o.status)).slice(0,4);
 const cards=(items:Auction[])=><div className="v20Grid">{items.map(a=><button key={a.id} onClick={()=>onOpenAuction(a)}><div>{a.image_url?<img src={a.image_url} alt={a.title}/>:<span>KK</span>}</div><strong>{a.title}</strong><b>{m(+a.current_price)}</b><small>İlanı aç</small></button>)}</div>;
 return <div className="v20Dashboard">
  <section className="v20Block"><header><span>ÖNE ÇIKANLAR</span><h2>Trend açık artırmalar</h2></header>{trend.length?cards(trend):<div className="v20Empty">Trend ilanlar burada görünecek.</div>}</section>
  <section className="v20Block"><header><span>SON ŞANS</span><h2>Yakında bitenler</h2></header>{ending.length?cards(ending):<div className="v20Empty">Yakında bitecek ilan yok.</div>}</section>
  <section className="v20Block"><header><span>SON İŞLEMLER</span><h2>Son satılan ürünler</h2></header>{sold.length?<div className="v20Grid">{sold.map(o=><article key={o.id}><div>{o.auction?.image_url?<img src={o.auction.image_url} alt={o.auction.title}/>:<span>KK</span>}</div><strong>{o.auction?.title||"Satış"}</strong><b>{m(+o.amount)}</b><small>{o.status==="delivered"?"Teslim edildi":"Kargoda"}</small></article>)}</div>:<div className="v20Empty">Tamamlanan satışlar burada görünecek.</div>}</section>
 </div>
}