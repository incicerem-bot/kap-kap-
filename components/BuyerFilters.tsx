"use client";

import type {
  AuctionCategory,
  ProductSpecifications,
  ProductType,
} from "./types";
import {
  definitionForType,
  productTypes,
  typesForCategory,
} from "./productTaxonomy";

type BuyerFiltersProps = {
  category: AuctionCategory;
  productType: ProductType | "";
  brand: string;
  model: string;
  specifications: ProductSpecifications;
  minPrice: string;
  maxPrice: string;
  resultCount: number;
  onCategoryChange: (value: AuctionCategory) => void;
  onProductTypeChange: (value: ProductType | "") => void;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSpecificationChange: (
    key: string,
    value: string | number | boolean | null
  ) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
  onSaveSearch: () => void;
  onOpenSavedSearches: () => void;
};

const categories: Array<{ value: AuctionCategory; label: string }> = [
  { value: "all", label: "Tüm kategoriler" },
  { value: "phone", label: "Telefon" },
  { value: "computer", label: "Bilgisayar" },
  { value: "gaming", label: "Oyun" },
  { value: "watch", label: "Saat" },
  { value: "vehicle", label: "Araç" },
  { value: "home", label: "Ev & Yaşam" },
  { value: "camera", label: "Kamera" },
  { value: "collection", label: "Koleksiyon" },
];

export default function BuyerFilters(props: BuyerFiltersProps) {
  const availableTypes =
    props.category === "all"
      ? productTypes
      : typesForCategory(props.category);

  const definition = definitionForType(props.productType);
  const brands = definition ? Object.keys(definition.brands) : [];
  const models =
    definition && props.brand
      ? definition.brands[props.brand] ?? []
      : [];

  const hasActiveFilters =
    props.category !== "all" ||
    Boolean(props.productType) ||
    Boolean(props.brand) ||
    Boolean(props.model) ||
    Boolean(props.minPrice) ||
    Boolean(props.maxPrice) ||
    Object.values(props.specifications).some(
      (value) => value !== "" && value !== null && value !== undefined
    );

  return (
    <section className="buyerFilterPanel">
      <header className="buyerFilterHeader">
        <div>
          <span>AKILLI ÜRÜN BULUCU</span>
          <h2>Aradığın ürünü özelliklerine göre bul</h2>
          <p>
            Marka, model, RAM, depolama, ekran, kilometre ve diğer teknik
            özelliklerle filtrele.
          </p>
        </div>

        <div className="buyerFilterResult">
          <strong>{props.resultCount}</strong>
          <span>uygun ilan</span>
        </div>
      </header>

      <div className="buyerFilterBase">
        <label>
          Kategori
          <select
            value={props.category}
            onChange={(event) =>
              props.onCategoryChange(event.target.value as AuctionCategory)
            }
          >
            {categories.map((category) => (
              <option value={category.value} key={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ürün türü
          <select
            value={props.productType}
            onChange={(event) =>
              props.onProductTypeChange(
                event.target.value as ProductType | ""
              )
            }
          >
            <option value="">Tüm ürün türleri</option>
            {availableTypes.map((type) => (
              <option value={type.value} key={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Marka
          <select
            value={props.brand}
            disabled={!definition}
            onChange={(event) => props.onBrandChange(event.target.value)}
          >
            <option value="">Tüm markalar</option>
            {brands.map((brand) => (
              <option value={brand} key={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label>
          Model
          <select
            value={props.model}
            disabled={!props.brand}
            onChange={(event) => props.onModelChange(event.target.value)}
          >
            <option value="">Tüm modeller</option>
            {models.map((model) => (
              <option value={model} key={model}>
                {model}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="buyerPriceFilters">
        <label>
          En düşük fiyat
          <input
            type="number"
            min="0"
            value={props.minPrice}
            onChange={(event) => props.onMinPriceChange(event.target.value)}
            placeholder="0"
          />
        </label>

        <label>
          En yüksek fiyat
          <input
            type="number"
            min="0"
            value={props.maxPrice}
            onChange={(event) => props.onMaxPriceChange(event.target.value)}
            placeholder="Sınırsız"
          />
        </label>
      </div>

      {definition && (
        <div className="buyerTechnicalFilters">
          <div className="buyerTechnicalTitle">
            <span>{definition.label.toLocaleUpperCase("tr")}</span>
            <strong>Teknik filtreler</strong>
          </div>

          <div className="buyerTechnicalGrid">
            {definition.fields.map((field) => {
              const current = props.specifications[field.key] ?? "";

              return (
                <label key={field.key}>
                  {field.label}
                  <div className={field.unit ? "filterInputWithUnit" : ""}>
                    {field.type === "select" ? (
                      <select
                        value={String(current)}
                        onChange={(event) =>
                          props.onSpecificationChange(
                            field.key,
                            event.target.value
                          )
                        }
                      >
                        <option value="">Tümü</option>
                        {field.options?.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        step={field.type === "number" ? "any" : undefined}
                        value={String(current)}
                        placeholder={
                          field.type === "number"
                            ? "Tam değer"
                            : field.placeholder || "Ara"
                        }
                        onChange={(event) =>
                          props.onSpecificationChange(
                            field.key,
                            field.type === "number" &&
                              event.target.value !== ""
                              ? Number(event.target.value)
                              : event.target.value
                          )
                        }
                      />
                    )}
                    {field.unit && <span>{field.unit}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <footer className="buyerFilterFooter">
        <span>
          Metin araması; ilan başlığı, açıklama, marka, model ve teknik
          özellikleri birlikte tarar.
        </span>

        <div className="buyerFilterActions">
          <button type="button" onClick={props.onOpenSavedSearches}>
            Kayıtlı aramalar
          </button>
          {hasActiveFilters && (
            <>
              <button type="button" onClick={props.onSaveSearch}>
                Aramayı kaydet
              </button>
              <button type="button" onClick={props.onClear}>
                Filtreleri temizle
              </button>
            </>
          )}
        </div>
      </footer>
    </section>
  );
}
