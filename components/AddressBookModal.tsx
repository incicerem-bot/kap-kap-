"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UserAddress } from "./types";

type AddressDraft = {
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address_line: string;
  postal_code: string;
  is_default: boolean;
};

const emptyDraft: AddressDraft = {
  title: "Evim",
  full_name: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  address_line: "",
  postal_code: "",
  is_default: false,
};

type Props = {
  open: boolean;
  addresses: UserAddress[];
  loading: boolean;
  selectedAddressId?: string | null;
  selectionMode?: boolean;
  onClose: () => void;
  onSave: (draft: AddressDraft, addressId?: string) => Promise<void> | void;
  onDelete: (addressId: string) => Promise<void> | void;
  onSetDefault: (addressId: string) => Promise<void> | void;
  onSelect?: (address: UserAddress) => void;
};

export default function AddressBookModal({
  open,
  addresses,
  loading,
  selectedAddressId,
  selectionMode = false,
  onClose,
  onSave,
  onDelete,
  onSetDefault,
  onSelect,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);

  useEffect(() => {
    if (!open) {
      setShowForm(false);
      setEditingId(undefined);
      setDraft(emptyDraft);
    }
  }, [open]);

  if (!open) return null;

  function editAddress(address: UserAddress) {
    setEditingId(address.id);
    setDraft({
      title: address.title,
      full_name: address.full_name,
      phone: address.phone,
      city: address.city,
      district: address.district,
      neighborhood: address.neighborhood,
      address_line: address.address_line,
      postal_code: address.postal_code ?? "",
      is_default: address.is_default,
    });
    setShowForm(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(draft, editingId);
    setShowForm(false);
    setEditingId(undefined);
    setDraft(emptyDraft);
  }

  return (
    <div className="modalBackdrop addressBackdrop" onMouseDown={onClose}>
      <section
        className="addressBookModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="addressHeader">
          <div>
            <span>TESLİMAT AYARLARI</span>
            <h2>{selectionMode ? "Teslimat adresini seç" : "Adreslerim"}</h2>
            <p>
              {selectionMode
                ? "Bu siparişin gönderileceği adresi belirle."
                : "Kargo ve teslimat için kayıtlı adreslerini yönet."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingId(undefined);
              setDraft(emptyDraft);
              setShowForm(true);
            }}
          >
            Yeni adres
          </button>
        </header>

        {showForm ? (
          <form className="addressForm" onSubmit={submit}>
            <div className="addressFormTitle">
              <span>{editingId ? "ADRESİ DÜZENLE" : "YENİ ADRES"}</span>
              <strong>Teslimat bilgileri</strong>
            </div>

            <div className="addressFormGrid">
              <label>
                Adres başlığı
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Evim / İş yerim"
                  required
                />
              </label>

              <label>
                Ad soyad
                <input
                  value={draft.full_name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, full_name: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Telefon
                <input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="05xx xxx xx xx"
                  required
                />
              </label>

              <label>
                Şehir
                <input
                  value={draft.city}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, city: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                İlçe
                <input
                  value={draft.district}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, district: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Mahalle
                <input
                  value={draft.neighborhood}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      neighborhood: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Posta kodu
                <input
                  value={draft.postal_code}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      postal_code: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="addressDefaultCheck">
                <input
                  type="checkbox"
                  checked={draft.is_default}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      is_default: event.target.checked,
                    }))
                  }
                />
                Varsayılan adres yap
              </label>
            </div>

            <label>
              Açık adres
              <textarea
                value={draft.address_line}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    address_line: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Cadde, sokak, bina ve daire bilgisi"
                required
              />
            </label>

            <div className="addressFormActions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(undefined);
                  setDraft(emptyDraft);
                }}
              >
                Vazgeç
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Adresi kaydet"}
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="addressEmpty">Adresler yükleniyor...</div>
        ) : addresses.length === 0 ? (
          <div className="addressEmpty">
            <strong>Henüz kayıtlı adresin yok.</strong>
            <span>İlk teslimat adresini ekleyerek sipariş sürecini hızlandır.</span>
          </div>
        ) : (
          <div className="addressList">
            {addresses.map((address) => (
              <article
                className={`addressCard ${
                  selectedAddressId === address.id ? "addressCardSelected" : ""
                }`}
                key={address.id}
              >
                <div className="addressCardTop">
                  <div>
                    <strong>{address.title}</strong>
                    {address.is_default && <span>Varsayılan</span>}
                  </div>
                  <small>{address.full_name}</small>
                </div>

                <p>
                  {address.neighborhood}, {address.address_line}
                  <br />
                  {address.district} / {address.city}
                  {address.postal_code ? ` · ${address.postal_code}` : ""}
                </p>

                <footer className="addressCardFooter">
                  <span>{address.phone}</span>
                  <div>
                    {selectionMode && (
                      <button type="button" onClick={() => onSelect?.(address)}>
                        Bu adresi seç
                      </button>
                    )}
                    {!address.is_default && (
                      <button type="button" onClick={() => onSetDefault(address.id)}>
                        Varsayılan yap
                      </button>
                    )}
                    <button type="button" onClick={() => editAddress(address)}>
                      Düzenle
                    </button>
                    <button
                      className="addressDeleteButton"
                      type="button"
                      onClick={() => onDelete(address.id)}
                    >
                      Sil
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
