"use client";

import type { AuctionCategory, ProductSpecifications, ProductType } from "./types";

export type SpecOption = {
  value: string;
  label: string;
};

export type SpecField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  placeholder?: string;
  unit?: string;
  options?: SpecOption[];
  required?: boolean;
};

export type ProductTypeDefinition = {
  value: ProductType;
  label: string;
  category: AuctionCategory;
  brands: Record<string, string[]>;
  fields: SpecField[];
};

const yesNo: SpecOption[] = [
  { value: "yes", label: "Var" },
  { value: "no", label: "Yok" },
];

export const productTypes: ProductTypeDefinition[] = [
  {
    value: "smartphone",
    label: "Akıllı Telefon",
    category: "phone",
    brands: {
      Apple: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 14 Pro Max", "iPhone 14", "iPhone 13"],
      Samsung: ["Galaxy S25 Ultra", "Galaxy S24 Ultra", "Galaxy S24", "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy A55"],
      Xiaomi: ["Xiaomi 15 Ultra", "Xiaomi 14 Ultra", "Xiaomi 14", "Redmi Note 14 Pro", "Poco F6 Pro"],
      Google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8"],
      Huawei: ["Pura 70 Ultra", "Mate 60 Pro", "Nova 12"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "storage_gb", label: "Depolama", type: "select", required: true, options: ["64","128","256","512","1024"].map(v => ({ value: v, label: `${v} GB` })) },
      { key: "ram_gb", label: "RAM", type: "select", required: true, options: ["4","6","8","12","16","24"].map(v => ({ value: v, label: `${v} GB` })) },
      { key: "screen_size", label: "Ekran boyutu", type: "number", unit: "inç", placeholder: "6.1" },
      { key: "color", label: "Renk", type: "text", placeholder: "Siyah" },
      { key: "battery_health", label: "Pil sağlığı", type: "number", unit: "%", placeholder: "92" },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
      { key: "invoice", label: "Fatura", type: "select", options: yesNo },
      { key: "box", label: "Kutu", type: "select", options: yesNo },
      { key: "imei_status", label: "IMEI durumu", type: "select", options: [
        { value: "registered", label: "Türkiye kayıtlı" },
        { value: "passport", label: "Pasaport kayıtlı" },
        { value: "unregistered", label: "Kayıtsız" },
      ]},
    ],
  },
  {
    value: "laptop",
    label: "Laptop",
    category: "computer",
    brands: {
      Apple: ["MacBook Air M4", "MacBook Pro M4", "MacBook Air M3", "MacBook Pro M3 Pro", "MacBook Pro M2"],
      ASUS: ["ROG Strix G16", "TUF Gaming A15", "Zenbook 14 OLED", "Vivobook Pro 15"],
      Lenovo: ["Legion Pro 5", "LOQ 15", "ThinkPad X1 Carbon", "Yoga Pro 7"],
      MSI: ["Raider GE78", "Katana 17", "Cyborg 15", "Prestige 14"],
      HP: ["Spectre x360", "Omen 16", "Victus 16", "Pavilion Plus"],
      Dell: ["XPS 15", "Alienware m16", "Inspiron 16 Plus", "Latitude 7440"],
      Acer: ["Predator Helios 16", "Nitro 5", "Swift Go 14"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "processor", label: "İşlemci", type: "text", required: true, placeholder: "Apple M4 / Intel Core i7" },
      { key: "ram_gb", label: "RAM", type: "select", required: true, options: ["8","16","24","32","64","128"].map(v => ({ value: v, label: `${v} GB` })) },
      { key: "storage_gb", label: "SSD", type: "select", required: true, options: ["256","512","1024","2048","4096"].map(v => ({ value: v, label: `${Number(v)/1024 >= 1 ? Number(v)/1024 + " TB" : v + " GB"}` })) },
      { key: "gpu", label: "Ekran kartı", type: "text", placeholder: "RTX 4070 / Apple GPU" },
      { key: "screen_size", label: "Ekran boyutu", type: "number", unit: "inç", placeholder: "15.6" },
      { key: "resolution", label: "Çözünürlük", type: "text", placeholder: "2560×1600" },
      { key: "operating_system", label: "İşletim sistemi", type: "text", placeholder: "Windows 11 / macOS" },
      { key: "battery_cycle", label: "Pil döngüsü", type: "number", placeholder: "120" },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
    ],
  },
  {
    value: "game_console",
    label: "Oyun Konsolu",
    category: "gaming",
    brands: {
      Sony: ["PlayStation 5 Pro", "PlayStation 5 Slim", "PlayStation 5", "PlayStation 4 Pro"],
      Microsoft: ["Xbox Series X", "Xbox Series S", "Xbox One X"],
      Nintendo: ["Nintendo Switch OLED", "Nintendo Switch", "Nintendo Switch Lite"],
      Valve: ["Steam Deck OLED", "Steam Deck LCD"],
      ASUS: ["ROG Ally X", "ROG Ally"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "storage_gb", label: "Depolama", type: "select", options: ["512","825","1000","2000"].map(v => ({ value: v, label: `${Number(v)>=1000 ? Number(v)/1000+" TB" : v+" GB"}` })) },
      { key: "edition", label: "Sürüm", type: "text", placeholder: "Diskli / Digital / OLED" },
      { key: "controller_count", label: "Kol sayısı", type: "number", placeholder: "2" },
      { key: "box", label: "Kutu", type: "select", options: yesNo },
      { key: "invoice", label: "Fatura", type: "select", options: yesNo },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
      { key: "games_included", label: "Dahil oyunlar", type: "text", placeholder: "FC 25, GTA V" },
    ],
  },
  {
    value: "television",
    label: "Televizyon",
    category: "home",
    brands: {
      Samsung: ["S95D OLED", "QN90D Neo QLED", "Q80D QLED", "The Frame"],
      LG: ["G4 OLED", "C4 OLED", "B4 OLED", "QNED91"],
      Sony: ["Bravia 9", "A95L OLED", "Bravia 7", "X90L"],
      Philips: ["OLED+959", "OLED809", "PUS8909"],
      TCL: ["C855 Mini LED", "C755 QLED", "C655"],
      Vestel: ["OLED 65", "QLED 65", "4K Smart 55"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "screen_size", label: "Ekran boyutu", type: "select", required: true, options: ["43","50","55","65","75","77","83","85"].map(v => ({ value: v, label: `${v} inç` })) },
      { key: "panel_type", label: "Panel tipi", type: "select", options: ["OLED","QLED","Mini LED","LED","QNED"].map(v => ({ value: v, label: v })) },
      { key: "resolution", label: "Çözünürlük", type: "select", options: ["4K","8K","Full HD"].map(v => ({ value: v, label: v })) },
      { key: "refresh_rate", label: "Yenileme hızı", type: "select", options: ["60","100","120","144"].map(v => ({ value: v, label: `${v} Hz` })) },
      { key: "smart_tv", label: "Smart TV", type: "select", options: yesNo },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
      { key: "wall_mount", label: "Duvar aparatı", type: "select", options: yesNo },
    ],
  },
  {
    value: "smartwatch",
    label: "Akıllı Saat",
    category: "watch",
    brands: {
      Apple: ["Apple Watch Ultra 2", "Apple Watch Series 10", "Apple Watch Series 9", "Apple Watch SE"],
      Samsung: ["Galaxy Watch Ultra", "Galaxy Watch 7", "Galaxy Watch 6 Classic"],
      Garmin: ["Fenix 8", "Fenix 7X Pro", "Epix Pro", "Forerunner 965"],
      Huawei: ["Watch GT 5 Pro", "Watch 4 Pro", "Watch Fit 3"],
      Xiaomi: ["Watch 2 Pro", "Watch S3", "Redmi Watch 4"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "case_size", label: "Kasa boyutu", type: "number", unit: "mm", placeholder: "45" },
      { key: "case_material", label: "Kasa malzemesi", type: "text", placeholder: "Titanyum" },
      { key: "color", label: "Renk", type: "text", placeholder: "Siyah" },
      { key: "cellular", label: "Cellular/LTE", type: "select", options: yesNo },
      { key: "battery_health", label: "Pil sağlığı", type: "number", unit: "%", placeholder: "96" },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
      { key: "box", label: "Kutu", type: "select", options: yesNo },
    ],
  },
  {
    value: "camera",
    label: "Fotoğraf Makinesi",
    category: "camera",
    brands: {
      Sony: ["A1 II", "A9 III", "A7R V", "A7 IV", "ZV-E1"],
      Canon: ["EOS R1", "EOS R5 Mark II", "EOS R6 Mark II", "EOS R8"],
      Nikon: ["Z9", "Z8", "Z6 III", "Zf"],
      Fujifilm: ["GFX100 II", "X-H2S", "X-T5", "X-S20"],
      Panasonic: ["Lumix S1R II", "Lumix S5 II X", "Lumix GH7"],
      Leica: ["Leica Q3", "Leica M11", "Leica SL3"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "sensor_type", label: "Sensör", type: "select", options: ["Full Frame","APS-C","Micro Four Thirds","Medium Format"].map(v => ({ value: v, label: v })) },
      { key: "megapixel", label: "Megapiksel", type: "number", unit: "MP", placeholder: "33" },
      { key: "shutter_count", label: "Deklanşör sayısı", type: "number", placeholder: "12500" },
      { key: "video_resolution", label: "Video", type: "text", placeholder: "4K 120fps / 8K" },
      { key: "lens_mount", label: "Lens yuvası", type: "text", placeholder: "Sony E / Canon RF" },
      { key: "lens_included", label: "Lens dahil", type: "select", options: yesNo },
      { key: "warranty", label: "Garanti", type: "select", options: yesNo },
    ],
  },
  {
    value: "car",
    label: "Otomobil",
    category: "vehicle",
    brands: {
      BMW: ["320i", "520i", "X1", "X3", "i4"],
      Mercedes: ["C 200", "E 180", "A 200", "GLA 200", "EQB"],
      Audi: ["A3", "A4", "A6", "Q3", "Q5"],
      Volkswagen: ["Golf", "Passat", "Tiguan", "T-Roc", "Polo"],
      Toyota: ["Corolla", "C-HR", "RAV4", "Yaris Cross"],
      Hyundai: ["Tucson", "Ioniq 5", "Elantra", "Bayon"],
      Tesla: ["Model 3", "Model Y", "Model S"],
      Honda: ["Civic", "HR-V", "CR-V"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "model_year", label: "Model yılı", type: "number", required: true, placeholder: "2023" },
      { key: "mileage_km", label: "Kilometre", type: "number", unit: "km", required: true, placeholder: "42000" },
      { key: "fuel", label: "Yakıt", type: "select", options: ["Benzin","Dizel","Hibrit","Elektrik","LPG"].map(v => ({ value: v, label: v })) },
      { key: "transmission", label: "Vites", type: "select", options: ["Otomatik","Manuel","Yarı Otomatik"].map(v => ({ value: v, label: v })) },
      { key: "engine_cc", label: "Motor hacmi", type: "number", unit: "cc", placeholder: "1598" },
      { key: "body_type", label: "Kasa tipi", type: "select", options: ["Sedan","SUV","Hatchback","Station Wagon","Coupe","Cabrio"].map(v => ({ value: v, label: v })) },
      { key: "package", label: "Paket", type: "text", placeholder: "M Sport / Elite Plus" },
      { key: "damage_record", label: "Hasar kaydı", type: "text", placeholder: "Yok / 25.000 TL" },
      { key: "paint_changed", label: "Boya / değişen", type: "text", placeholder: "2 parça boya, değişen yok" },
    ],
  },
  {
    value: "furniture",
    label: "Mobilya",
    category: "home",
    brands: {
      IKEA: ["KIVIK", "SÖDERHAMN", "MALM", "HEMNES", "PAX"],
      Enza: ["Mayfair", "Loreto", "Netha", "Dorian"],
      Bellona: ["Valencia", "Larissa", "Montego", "Loretto"],
      İstikbal: ["Diego", "Talina", "Talia", "Mary"],
      Doğtaş: ["Mayer", "Louisa", "Brita", "Nita"],
      ÖzelYapım: ["Özel üretim"],
      Diğer: ["Diğer model"],
    },
    fields: [
      { key: "furniture_type", label: "Mobilya türü", type: "select", options: ["Koltuk","Yatak","Dolap","Masa","Sandalye","TV Ünitesi","Kitaplık"].map(v => ({ value: v, label: v })) },
      { key: "material", label: "Malzeme", type: "text", placeholder: "Masif meşe / Kadife" },
      { key: "width_cm", label: "Genişlik", type: "number", unit: "cm", placeholder: "240" },
      { key: "height_cm", label: "Yükseklik", type: "number", unit: "cm", placeholder: "85" },
      { key: "depth_cm", label: "Derinlik", type: "number", unit: "cm", placeholder: "95" },
      { key: "color", label: "Renk", type: "text", placeholder: "Antrasit" },
      { key: "assembly_required", label: "Kurulum gerekli", type: "select", options: yesNo },
      { key: "delivery_available", label: "Teslimat imkânı", type: "select", options: yesNo },
    ],
  },
];

export function typesForCategory(category: AuctionCategory) {
  return productTypes.filter((item) => item.category === category);
}

export function definitionForType(type: ProductType | "") {
  return productTypes.find((item) => item.value === type) ?? null;
}

export function emptySpecifications(): ProductSpecifications {
  return {};
}
