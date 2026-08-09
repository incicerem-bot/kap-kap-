import Link from "next/link";
import { equipmentTaxonomies } from "@/components/equipmentTaxonomyData";

export default function EquipmentTaxonomy({ category }: { category: string }) {
  const data = equipmentTaxonomies[category];
  if (!data) return null;
  const groups = [{ title: "Ürün türleri", items: data.types }, { title: "Markalar", items: data.brands }, { title: "Özellikler", items: data.specs }];
  return <section className="equipmentTaxonomyV37" aria-labelledby="equipment-taxonomy-title">
    <header><div><span>DETAYLI DONANIM MENÜSÜ</span><h2 id="equipment-taxonomy-title">{data.name} seçenekleri</h2><p>{data.description}</p></div><Link href={`/arama?q=${encodeURIComponent(data.name)}`}>Tüm ilanları göster →</Link></header>
    <div>{groups.map((group) => <article key={group.title}><strong>{group.title}</strong><nav aria-label={`${data.name} ${group.title}`}>{group.items.map((item) => <Link href={`/kategori/${category}?filtre=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</nav></article>)}</div>
  </section>;
}
