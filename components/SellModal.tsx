"use client";

import type { FormEvent } from "react";
import type {
  AuctionCategory,
  ProductSpecifications,
  ProductType,
} from "./types";
import {
  definitionForType,
  typesForCategory,
} from "./productTaxonomy";

type SellModalProps = {
  open: boolean;
  loading: boolean;
  title: string;
  description: string;
  category: AuctionCategory;
  productType: ProductType | "";
  brand: string;
  model: string;
  specifications: ProductSpecifications;
  startPrice: string;
  minIncrement: string;
  durationHours: string;
  liveEnabled: boolean;
  liveStartOpen: boolean;
  imagePreview: string;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: AuctionCategory) => void;
  onProductTypeChange: (value: ProductType | "") => void;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSpecificationChange: (
    key: string,
    value: string | number | boolean | null
  ) => void;
  onStartPriceChange: (value: string) => void;
  onMinIncrementChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onLiveEnabledChange: (value: boolean) => void;
  onLiveStartOpenChange: (value: boolean) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const categoryOptions: Array<{ value: AuctionCategory; label: string }> = [
  { value: "phone", label: "Telefon" },
  { value: "computer", label: "Bilgisayar" },
  { value: "gaming", label: "Oyun" },
  { value: "watch", label: "Saat" },
  { value: "vehicle", label: "Araç" },
  { value: "home", label: "Ev & Yaşam" },
  { value: "camera", label: "Kamera" },
  { value: "collection", label: "Koleksiyon" },
];

export default function SellModal(props: SellModalProps) {
  if (!props.open) return null;

  const availableTypes = typesForCategory(props.category);
  const definition = definitionForType(props.productType);
  const brands = definition ? Object.keys(definition.brands) : [];
  const models =
    definition && props.brand
      ? definition.brands[props.brand] ?? []
      : [];

  return (
    <div className="modalBackdrop" onMouseDown={props.onClose}>
      <section
        className="modalCard productWizardModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={props.onClose}>
          ×
        </button>

        <div className="productWizardHeader">
          <span className="eyebrow">AKILLI İLAN OLUŞTURUCU</span>
          <h2>Ürününü doğru özelliklerle listele</h2>
          <p>
            Kategori ve ürün türünü seçtiğinde teknik özellik alanları otomatik
            hazırlanır.
          </p>
        </div>

        <form onSubmit={props.onSubmit}>
          <section className="wizardSection">
            <div className="wizardSectionTitle">
              <span>01</span>
              <div>
                <strong>Ürün sınıflandırması</strong>
                <small>Kategori, tür, marka ve model</small>
              </div>
            </div>

            <div className="formGrid">
              <label>
                Ana kategori
                <select
                  value={props.category}
                  onChange={(event) =>
                    props.onCategoryChange(
                      event.target.value as AuctionCategory
                    )
                  }
                >
                  {categoryOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
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
                  required
                >
                  <option value="">Ürün türünü seç</option>
                  {availableTypes.map((type) => (
                    <option value={type.value} key={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="formGrid">
              <label>
                Marka
                <select
                  value={props.brand}
                  onChange={(event) => props.onBrandChange(event.target.value)}
                  disabled={!definition}
                  required
                >
                  <option value="">Marka seç</option>
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
                  onChange={(event) => props.onModelChange(event.target.value)}
                  disabled={!props.brand}
                  required
                >
                  <option value="">Model seç</option>
                  {models.map((model) => (
                    <option value={model} key={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {definition && (
            <section className="wizardSection">
              <div className="wizardSectionTitle">
                <span>02</span>
                <div>
                  <strong>Teknik özellikler</strong>
                  <small>{definition.label} için özel alanlar</small>
                </div>
              </div>

              <div className="dynamicSpecsGrid">
                {definition.fields.map((field) => {
                  const current = props.specifications[field.key] ?? "";

                  return (
                    <label key={field.key}>
                      {field.label}
                      <div className={field.unit ? "specInputWithUnit" : ""}>
                        {field.type === "select" ? (
                          <select
                            value={String(current)}
                            onChange={(event) =>
                              props.onSpecificationChange(
                                field.key,
                                event.target.value
                              )
                            }
                            required={field.required}
                          >
                            <option value="">Seçiniz</option>
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
                            placeholder={field.placeholder}
                            onChange={(event) =>
                              props.onSpecificationChange(
                                field.key,
                                field.type === "number" &&
                                  event.target.value !== ""
                                  ? Number(event.target.value)
                                  : event.target.value
                              )
                            }
                            required={field.required}
                          />
                        )}
                        {field.unit && <span>{field.unit}</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          <section className="wizardSection">
            <div className="wizardSectionTitle">
              <span>03</span>
              <div>
                <strong>İlan içeriği</strong>
                <small>Fotoğraf, başlık ve açıklama</small>
              </div>
            </div>

            <label className="imageUploader">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  props.onImageChange(event.target.files?.[0] ?? null)
                }
              />
              {props.imagePreview ? (
                <img src={props.imagePreview} alt="Ürün önizlemesi" />
              ) : (
                <div>
                  <span>+</span>
                  <strong>Ürün fotoğrafı ekle</strong>
                  <small>JPG, PNG veya WEBP · En fazla 5 MB</small>
                </div>
              )}
            </label>

            <label>
              İlan başlığı
              <input
                value={props.title}
                onChange={(event) => props.onTitleChange(event.target.value)}
                placeholder={
                  props.brand && props.model
                    ? `${props.brand} ${props.model}`
                    : "Ürünü açıklayan net bir başlık"
                }
                required
              />
            </label>

            <label>
              Açıklama
              <textarea
                value={props.description}
                onChange={(event) =>
                  props.onDescriptionChange(event.target.value)
                }
                rows={5}
                placeholder="Ürünün kullanım durumu, kusurları, kutu ve fatura bilgileri..."
                required
              />
            </label>
          </section>

          <section className="wizardSection">
            <div className="wizardSectionTitle">
              <span>04</span>
              <div>
                <strong>Açık artırma ayarları</strong>
                <small>Fiyat, minimum artış ve süre</small>
              </div>
            </div>

            <div className="formGrid">
              <label>
                Başlangıç fiyatı
                <input
                  type="number"
                  min="1"
                  value={props.startPrice}
                  onChange={(event) =>
                    props.onStartPriceChange(event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Minimum artış
                <input
                  type="number"
                  min="1"
                  value={props.minIncrement}
                  onChange={(event) =>
                    props.onMinIncrementChange(event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <label>
              Süre
              <select
                value={props.durationHours}
                onChange={(event) =>
                  props.onDurationChange(event.target.value)
                }
              >
                <option value="1">1 saat</option>
                <option value="6">6 saat</option>
                <option value="12">12 saat</option>
                <option value="24">24 saat</option>
                <option value="72">3 gün</option>
                <option value="168">7 gün</option>
              </select>
            </label>

            <div className="liveListingOption">
              <div className="liveListingOptionHead">
                <div>
                  <span>CANLI AÇIK ARTIRMA</span>
                  <strong>Bu ilan için canlı oda kullan</strong>
                  <small>
                    İzleyiciler canlı teklif akışını, geri sayımı ve oda
                    sohbetini görebilir.
                  </small>
                </div>
                <label className="liveSwitch">
                  <input
                    type="checkbox"
                    checked={props.liveEnabled}
                    onChange={(event) =>
                      props.onLiveEnabledChange(event.target.checked)
                    }
                  />
                  <span />
                </label>
              </div>

              {props.liveEnabled && (
                <label className="liveStartCheck">
                  <input
                    type="checkbox"
                    checked={props.liveStartOpen}
                    onChange={(event) =>
                      props.onLiveStartOpenChange(event.target.checked)
                    }
                  />
                  İlan yayınlandığında canlı oda açık başlasın
                </label>
              )}
            </div>
          </section>

          <button
            className="modalPrimary wizardSubmit"
            type="submit"
            disabled={props.loading}
          >
            {props.loading
              ? "Yayınlanıyor..."
              : "Açık artırmayı profesyonel olarak yayınla"}
          </button>
        </form>
      </section>
    </div>
  );
}
