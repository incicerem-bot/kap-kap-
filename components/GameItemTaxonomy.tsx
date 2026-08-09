import Link from "next/link";
import { gameItemFilterSlug, gameItemTaxonomies } from "@/components/gameItemTaxonomyData";

export default function GameItemTaxonomy({ game, selected }: { game: string; selected?: string }) {
  const taxonomy = gameItemTaxonomies[game];
  if (!taxonomy) return null;
  return (
    <section className="gameTaxonomyV36" aria-labelledby="game-taxonomy-title">
      <header><div><span>DETAYLI İTEM MENÜSÜ</span><h2 id="game-taxonomy-title">{taxonomy.name} ürün türleri</h2><p>{taxonomy.notice}</p></div><Link href={`/arama?q=${encodeURIComponent(taxonomy.name)}`}>Tüm ilanları göster →</Link></header>
      <div className="gameTaxonomyGridV36">
        {taxonomy.sections.map((section) => <article key={section.title}>
          <div><strong>{section.title}</strong><small>{section.description}</small></div>
          <nav aria-label={`${taxonomy.name} ${section.title}`}>{section.values.map((value) => <Link className={selected === value ? "active" : ""} aria-current={selected === value ? "page" : undefined} key={value} href={`/oyun-itemleri/${game}/${gameItemFilterSlug(value)}`}>{value}</Link>)}</nav>
        </article>)}
      </div>
    </section>
  );
}
