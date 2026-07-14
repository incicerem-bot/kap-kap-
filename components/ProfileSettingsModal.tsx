"use client";

import { FormEvent, useEffect, useState } from "react";
import type { EditableUserProfile, SellerProfile } from "./types";

type Props = {
  open: boolean;
  userProfile: EditableUserProfile | null;
  sellerProfile: SellerProfile | null;
  loading: boolean;
  onClose: () => void;
  onSaveUser: (
    values: Omit<EditableUserProfile, "id" | "avatar_url">,
    avatar: File | null
  ) => Promise<void> | void;
  onSaveSeller: (
    values: {
      store_name: string;
      store_slug: string;
      description: string;
      city: string;
      vacation_mode: boolean;
    },
    logo: File | null,
    cover: File | null
  ) => Promise<void> | void;
};

export default function ProfileSettingsModal({
  open,
  userProfile,
  sellerProfile,
  loading,
  onClose,
  onSaveUser,
  onSaveSeller,
}: Props) {
  const [tab, setTab] = useState<"user" | "seller">("user");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<"user" | "seller">("user");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [vacationMode, setVacationMode] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  useEffect(() => {
    if (!open || !userProfile) return;
    setFullName(userProfile.full_name || "");
    setUsername(userProfile.username || "");
    setCity(userProfile.city || "");
    setBio(userProfile.bio || "");
    setPhone(userProfile.phone || "");
    setAccountType(userProfile.account_type || "user");
    setStoreName(sellerProfile?.store_name || "");
    setStoreSlug(sellerProfile?.store_slug || "");
    setStoreDescription(sellerProfile?.description || "");
    setStoreCity(sellerProfile?.city || userProfile.city || "");
    setVacationMode(Boolean(sellerProfile?.vacation_mode));
  }, [open, userProfile, sellerProfile]);

  if (!open || !userProfile) return null;

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSaveUser(
      {
        full_name: fullName.trim(),
        username: username.trim().toLocaleLowerCase("tr"),
        city: city.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        account_type: accountType,
      },
      avatar
    );
    setAvatar(null);
  }

  async function submitSeller(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSaveSeller(
      {
        store_name: storeName.trim(),
        store_slug: storeSlug.trim().toLocaleLowerCase("tr"),
        description: storeDescription.trim(),
        city: storeCity.trim(),
        vacation_mode: vacationMode,
      },
      logo,
      cover
    );
    setLogo(null);
    setCover(null);
  }

  return (
    <div className="modalBackdrop profileSettingsBackdrop" onMouseDown={onClose}>
      <section
        className="profileSettingsModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="profileSettingsHeader">
          <span>HESAP MERKEZİ</span>
          <h2>Profil ve mağaza ayarları</h2>
          <p>Kullanıcı kimliğini ve herkese açık satıcı mağazanı yönet.</p>
        </header>

        <nav className="profileSettingsTabs">
          <button
            className={tab === "user" ? "active" : ""}
            type="button"
            onClick={() => setTab("user")}
          >
            Kullanıcı profili
          </button>
          <button
            className={tab === "seller" ? "active" : ""}
            type="button"
            onClick={() => setTab("seller")}
          >
            Satıcı profili
          </button>
        </nav>

        {tab === "user" ? (
          <form className="profileSettingsForm" onSubmit={submitUser}>
            <div className="profileMediaField">
              <div className="profileMediaPreview">
                {userProfile.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profil" />
                ) : (
                  <span>{(fullName || "K").slice(0, 1).toLocaleUpperCase("tr")}</span>
                )}
              </div>
              <label>
                Profil fotoğrafı
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="profileSettingsGrid">
              <label>
                Ad soyad
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label>
                Kullanıcı adı
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  pattern="[a-zA-Z0-9_.-]{3,30}"
                  placeholder="kemalakar"
                  required
                />
              </label>
              <label>
                Şehir
                <input value={city} onChange={(e) => setCity(e.target.value)} />
              </label>
              <label>
                Telefon
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>

            <label>
              Hakkımda
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Kendini ve ilgilendiğin ürünleri kısaca anlat."
              />
            </label>

            <label>
              Hesap türü
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as "user" | "seller")}
              >
                <option value="user">Normal kullanıcı</option>
                <option value="seller">Satıcı hesabı</option>
              </select>
            </label>

            <button className="profileSettingsSave" type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kullanıcı profilini kaydet"}
            </button>
          </form>
        ) : (
          <form className="profileSettingsForm" onSubmit={submitSeller}>
            <div className="sellerMediaGrid">
              <label>
                Mağaza logosu
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
                />
              </label>
              <label>
                Kapak görseli
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setCover(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="profileSettingsGrid">
              <label>
                Mağaza adı
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </label>
              <label>
                Mağaza bağlantısı
                <input
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  pattern="[a-zA-Z0-9-]{3,40}"
                  placeholder="kemal-teknoloji"
                  required
                />
              </label>
              <label>
                Şehir
                <input
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                />
              </label>
              <label className="vacationModeCheck">
                <input
                  type="checkbox"
                  checked={vacationMode}
                  onChange={(e) => setVacationMode(e.target.checked)}
                />
                Mağazayı tatil moduna al
              </label>
            </div>

            <label>
              Mağaza açıklaması
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows={5}
                minLength={20}
                maxLength={1000}
                required
              />
            </label>

            <button className="profileSettingsSave" type="submit" disabled={loading}>
              {loading
                ? "Kaydediliyor..."
                : sellerProfile
                  ? "Satıcı profilini güncelle"
                  : "Satıcı mağazasını oluştur"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
