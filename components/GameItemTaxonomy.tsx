import Link from "next/link";
import { gameItemTaxonomies } from "@/components/gameItemTaxonomyData";

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function GameItemTaxonomy({ game }: { game: string }) {
  const taxonomy = gameItemTaxonomies[game];
  if (!taxonomy) return null;
  return (
    <section className="gameTaxonomyV36" aria-labelledby="game-taxonomy-title">
      <header><div><span>DETAYLI İTEM MENÜSÜ</span><h2 id="game-taxonomy-title">{taxonomy.name} ürün türleri</h2><p>{taxonomy.notice}</p></div><Link href={`/arama?q=${encodeURIComponent(taxonomy.name)}`}>Tüm ilanları göster →</Link></header>
      <div className="gameTaxonomyGridV36">
        {taxonomy.sections.map((section) => <article key={section.title}>
          <div><strong>{section.title}</strong><small>{section.description}</small></div>
          <nav aria-label={`${taxonomy.name} ${section.title}`}>{section.values.map((value) => <Link key={value} href={`/oyun-itemleri/${game}?tur=${slugify(value)}`}>{value}</Link>)}</nav>
        </article>)}
      </div>
    </section>
  );
}
