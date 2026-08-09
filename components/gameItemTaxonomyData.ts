export type GameTaxonomySection = {
  title: string;
  description: string;
  values: string[];
};

export type GameTaxonomy = {
  name: string;
  notice: string;
  sections: GameTaxonomySection[];
};

export const gameItemTaxonomies: Record<string, GameTaxonomy> = {
  cs2: {
    name: "Counter-Strike 2",
    notice: "Steam takasına açık kozmetik ürünler. Float sınırı kaplamaya göre daralabilir.",
    sections: [
      { title: "Silah türü", description: "Skinin kullanıldığı ekipman", values: ["Tabancalar", "Hafif Makineliler", "Tüfekler", "Keskin Nişancı", "Pompalılar", "Makineli Tüfekler", "Bıçaklar", "Eldivenler"] },
      { title: "Tabancalar", description: "Pistol skinleri", values: ["Glock-18", "USP-S", "P2000", "P250", "Five-SeveN", "Tec-9", "CZ75-Auto", "Dual Berettas", "Desert Eagle", "R8 Revolver"] },
      { title: "Tüfek ve SMG", description: "En çok kullanılan silah aileleri", values: ["AK-47", "M4A4", "M4A1-S", "FAMAS", "Galil AR", "AUG", "SG 553", "MAC-10", "MP9", "MP7", "MP5-SD", "UMP-45", "P90", "PP-Bizon"] },
      { title: "Keskin nişancı ve ağır", description: "Sniper, pompalı ve makineli", values: ["AWP", "SSG 08", "SCAR-20", "G3SG1", "Nova", "XM1014", "MAG-7", "Sawed-Off", "M249", "Negev"] },
      { title: "Bıçak modeli", description: "Nadir yakın dövüş modelleri", values: ["Bayonet", "M9 Bayonet", "Karambit", "Butterfly", "Talon", "Skeleton", "Kukri", "Ursus", "Nomad", "Stiletto", "Flip", "Gut", "Bowie", "Huntsman", "Falchion", "Shadow Daggers", "Navaja", "Classic"] },
      { title: "Eldiven ailesi", description: "Model ailesine göre filtre", values: ["Sport Gloves", "Driver Gloves", "Specialist Gloves", "Moto Gloves", "Hand Wraps", "Hydra Gloves", "Bloodhound Gloves", "Broken Fang Gloves"] },
      { title: "Float / aşınma", description: "Kaplamanın görünüm aralığı", values: ["Factory New · 0.00–0.07", "Minimal Wear · 0.07–0.15", "Field-Tested · 0.15–0.38", "Well-Worn · 0.38–0.45", "Battle-Scarred · 0.45–1.00", "Özel düşük float", "Özel yüksek float"] },
      { title: "Nadirlik", description: "Valve kalite katmanı", values: ["Consumer Grade", "Industrial Grade", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband", "Extraordinary"] },
      { title: "Özel nitelik", description: "Fiyatı etkileyen varyantlar", values: ["Normal", "StatTrak", "Souvenir", "Pattern / Seed", "Fade yüzdesi", "Doppler Phase", "Ruby / Sapphire / Emerald", "Sticker Craft", "Nametag"] },
      { title: "Diğer kozmetikler", description: "Silah dışı koleksiyon ürünleri", values: ["Sticker", "Sticker Capsule", "Case", "Souvenir Package", "Agent", "Patch", "Music Kit", "Graffiti", "Charm", "Pin"] },
    ],
  },
  "knight-online": {
    name: "Knight Online",
    notice: "Sunucu, sınıf, + seviyesi ve teslim biçimi ilan başlığında açıkça belirtilmelidir.",
    sections: [
      { title: "Para ve kod", description: "Oyun ekonomisi ve resmi kodlar", values: ["Gold Bar (GB)", "Knight Cash", "Premium Kodu", "ESN Kodları"] },
      { title: "Silah", description: "Sınıfa göre ana ekipman", values: ["Sword", "Dagger", "Bow", "Staff", "Spear", "Club", "Axe", "Shield", "Jamadar"] },
      { title: "Zırh", description: "Karakter sınıfına göre", values: ["Warrior", "Rogue", "Mage", "Priest", "Kurian / Porutu"] },
      { title: "Takı ve aksesuar", description: "Takılabilir yardımcı ekipman", values: ["Ring", "Earring", "Pendant", "Belt", "Necklace", "Quest Jewelry"] },
      { title: "Nitelik", description: "İlan ayrıntısı", values: ["Normal", "Unique", "Reverse", "Old Takı", "+0–+5", "+6–+8", "+9 ve üzeri", "Element / Bonus"] },
      { title: "Diğer", description: "Geliştirme ve etkinlik", values: ["Upgrade Scroll", "Trina / Karivdis", "Fragment", "Chest", "Cospre", "Pet", "Kanat", "Etkinlik Itemi"] },
    ],
  },
  metin2: {
    name: "Metin2",
    notice: "Sunucu, karakter sınıfı, + seviyesi, efsun ve taş bilgileri ilanda ayrı alanlarda gösterilir.",
    sections: [
      { title: "Para birimi", description: "Sunucu içi ticaret", values: ["Yang", "Won", "Ejderha Parası Kodu"] },
      { title: "Karakter sınıfı", description: "Ekipman uyumluluğu", values: ["Savaşçı", "Ninja", "Sura", "Şaman", "Lycan"] },
      { title: "Silah", description: "Sınıfa özel silahlar", values: ["Kılıç", "Çift El", "Hançer", "Yay", "Çan", "Yelpaze", "Pençe"] },
      { title: "Zırh ve ekipman", description: "Takılabilir parçalar", values: ["Zırh", "Kask", "Kalkan", "Ayakkabı", "Kemer", "Eldiven", "Omuz Kuşağı"] },
      { title: "Takı", description: "Bonus taşıyan aksesuarlar", values: ["Bilezik", "Kolye", "Küpe", "Tılsım"] },
      { title: "Ejderha taşı simyası", description: "Taş ve kalite ayrımı", values: ["Elmas", "Yakut", "Yeşim", "Safir", "Grena", "Oniks", "İşlenmemiş", "Antika", "Efsanevi", "Mitsi"] },
      { title: "Kozmetik ve yardımcı", description: "Süreli veya kalıcı ürünler", values: ["Kostüm", "Silah Kostümü", "Saç Stili", "Pet", "Binek", "Kanat / Kuşak", "Balıkçılık", "Madencilik"] },
      { title: "Geliştirme", description: "Üretim ve yükseltme malzemeleri", values: ["Ruh Taşı", "Beceri Kitabı", "Efsun Nesnesi", "Artırma Kağıdı", "Kutsama Kağıdı", "Sandık", "Etkinlik Itemi"] },
    ],
  },
  "silkroad-online": {
    name: "Silkroad Online",
    notice: "Irk, degree, seal ve + seviyesi belirtilmeden ekipman ilanı yayınlanmaz.",
    sections: [
      { title: "Para ve kod", description: "Oyun içi değer", values: ["Gold", "Silk Kodu"] },
      { title: "Çin silahları", description: "Chinese karakter ekipmanı", values: ["Sword", "Blade", "Spear", "Glaive", "Bow"] },
      { title: "Avrupa silahları", description: "European karakter ekipmanı", values: ["One-Hand Sword", "Two-Hand Sword", "Axe", "Dagger", "Crossbow", "Harp", "Staff", "Warlock Rod", "Cleric Rod"] },
      { title: "Zırh türü", description: "Irka ve mastery’ye göre", values: ["Armor", "Protector", "Garment", "Heavy Armor", "Light Armor", "Robe", "Shield", "Accessory"] },
      { title: "Nadirlik ve derece", description: "Ekipman değer katmanı", values: ["Degree 1–5", "Degree 6–9", "Degree 10+", "Seal of Star", "Seal of Moon", "Seal of Sun", "Rare / Legend", "+0–+5", "+6 ve üzeri"] },
      { title: "Geliştirme", description: "Alchemy ürünleri", values: ["Weapon Elixir", "Protector Elixir", "Shield Elixir", "Accessory Elixir", "Tablet", "Stone", "Astral", "Immortal", "Lucky"] },
    ],
  },
  "rise-online": {
    name: "Rise Online",
    notice: "Eşyalarda sunucu, sınıf, nadirlik, + seviyesi ve rune bilgisi gösterilir.",
    sections: [
      { title: "Para ve kod", description: "Oyun içi değer", values: ["Gold", "Rise Cash"] },
      { title: "Silah", description: "Sınıf ve kullanım biçimi", values: ["Sword", "Dagger", "Axe", "Mace", "Spear", "Bow", "Crossbow", "Staff", "Shield"] },
      { title: "Zırh ve aksesuar", description: "Takılabilir parçalar", values: ["Armor Set", "Helmet", "Gloves", "Boots", "Belt", "Ring", "Earring", "Necklace", "Anklet", "Cloak"] },
      { title: "Nadirlik", description: "Resmi item katmanı", values: ["Common", "Rare", "Epic", "Unique", "Ancient", "Legend"] },
      { title: "Üretim ve geliştirme", description: "Craft ve yükseltme", values: ["Weapon Smithing", "Armor Smithing", "Alchemy", "Craft Material", "Shard", "Upgrade Scroll", "Rune Slot", "+0–+5", "+6 ve üzeri"] },
    ],
  },
  valorant: {
    name: "Valorant",
    notice: "Skin veya hesap devri yoktur; yalnızca bölge uyumlu resmi kod ve bakiye ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Bölge uyumunu kontrol et", values: ["Valorant Points", "Hediye Kartı", "TR Bölgesi", "EU Bölgesi", "Düşük Tutar", "Orta Tutar", "Yüksek Tutar"] }],
  },
  "league-of-legends": {
    name: "League of Legends",
    notice: "Hesap ve kostüm devri yoktur; yalnızca resmi RP ve hediye kartları listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Platform ve bölge seçimi", values: ["Riot Points (RP)", "Hediye Kartı", "TR Sunucusu", "EU West", "EU Nordic & East", "TFT Uyumlu RP"] }],
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    notice: "Hesap veya envanter devri yoktur; yalnızca resmi yükleme ve kod ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Oyuncu ID ile teslim veya kod", values: ["UC", "Royale Pass", "UC Paketi", "Bonus UC", "TR Bölgesi", "Global Bölge", "ID ile Yükleme", "Kod Teslimi"] }],
  },
  roblox: {
    name: "Roblox",
    notice: "Hesap satışı yoktur; yalnızca resmi hediye kartı ve kod ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Kod ve bölge seçimi", values: ["Roblox Hediye Kartı", "Robux Kredisi", "Premium Kodu", "Dijital Kod", "Fiziksel Kart", "TR / Global Bölge"] }],
  },
  "mobile-legends": {
    name: "Mobile Legends",
    notice: "Hesap ve skin devri yoktur; resmi elmas yükleme ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Oyuncu ID ile teslim", values: ["Elmas", "Haftalık Elmas Kartı", "Twilight Pass", "Starlight Üyeliği", "Bonus Elmas", "ID ile Yükleme"] }],
  },
  "black-desert": {
    name: "Black Desert",
    notice: "Yalnızca resmi dijital bakiye ve izinli pazar ürünleri; sunucu ve platform uyumu zorunludur.",
    sections: [{ title: "Resmi dijital ürün", description: "Platforma göre", values: ["Acoin", "Pearl Box", "Oyun Paketi", "Web Launcher", "Steam", "Konsol", "TR & MENA", "NA / EU"] }],
  },
  fortnite: {
    name: "Fortnite",
    notice: "Hesap veya kostüm devri yoktur; yalnızca resmi kod ve bakiye ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Platform ve bölge uyumu", values: ["V-Bucks", "Hediye Kartı", "Starter Pack Kodu", "PlayStation", "Xbox", "Nintendo Switch", "PC / Epic", "TR / Global"] }],
  },
  minecraft: {
    name: "Minecraft",
    notice: "Hesap devri yoktur; oyun lisansı, Minecoin ve resmi kod ürünleri listelenir.",
    sections: [{ title: "Resmi dijital ürün", description: "Sürüm ve platform", values: ["Java & Bedrock PC", "Bedrock Edition", "Minecoins", "Realms Kodu", "Xbox", "PlayStation", "Nintendo Switch", "PC / Microsoft Store"] }],
  },
};

export function gameItemFilterSlug(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function findGameItemFilter(game: string, filterSlug: string) {
  const taxonomy = gameItemTaxonomies[game];
  if (!taxonomy) return undefined;
  for (const section of taxonomy.sections) {
    const value = section.values.find((item) => gameItemFilterSlug(item) === filterSlug);
    if (value) return { taxonomy, section, value };
  }
  return undefined;
}
