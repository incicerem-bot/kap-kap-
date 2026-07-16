"use client";

import type { PublicUserProfile } from "./types";

type Props = {
  open: boolean;
  profile: PublicUserProfile | null;
  loading: boolean;
  currentUserId: string;
  isFollowing: boolean;
  followLoading: boolean;
  onClose: () => void;
  onOpenStore: () => void;
  onToggleFollow: () => void;
};

function stars(rating: number) {
  return Array.from({ length: 5 }, (_, index) =>
    index < Math.round(rating) ? "★" : "☆"
  ).join("");
}

export default function PublicUserProfileModal({
  open,
  profile,
  loading,
  currentUserId,
  isFollowing,
  followLoading,
  onClose,
  onOpenStore,
  onToggleFollow,
}: Props) {
  if (!open) return null;

  const ownProfile = profile?.id === currentUserId;
  const profileName =
    profile?.seller_profile?.store_name ||
    profile?.full_name ||
    "KapışKapış Kullanıcısı";

  return (
    <div className="modalBackdrop publicProfileBackdrop" onMouseDown={onClose}>
      <section
        className="publicProfileModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        {profile?.seller_profile?.cover_url && (
          <div className="publicProfileCover">
            <img
              src={profile.seller_profile.cover_url}
              alt={profileName}
            />
          </div>
        )}

        {loading ? (
          <div className="publicProfileEmpty">Profil yükleniyor...</div>
        ) : profile ? (
          <>
            <header className="publicProfileHeader">
              <div className="publicProfileIdentity">
                <span className="publicProfileAvatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    profile.full_name
                      .slice(0, 1)
                      .toLocaleUpperCase("tr")
                  )}
                </span>

                <div>
                  <span>
                    {profile.account_type === "seller"
                      ? "SATICI HESABI"
                      : "KULLANICI PROFİLİ"}
                  </span>
                  <h2>{profile.full_name}</h2>
                  <p>
                    {profile.username ? `@${profile.username}` : "Kullanıcı adı yok"}
                    {profile.city ? ` · ${profile.city}` : ""}
                  </p>
                </div>
              </div>

              {!ownProfile && profile.account_type === "seller" && (
                <button
                  className={isFollowing ? "publicFollowActive" : ""}
                  type="button"
                  disabled={followLoading}
                  onClick={onToggleFollow}
                >
                  {followLoading
                    ? "İşleniyor..."
                    : isFollowing
                      ? "Takibi bırak"
                      : "Takip et"}
                </button>
              )}
            </header>

            <section className="publicVerificationRow">
              <span className={profile.email_verified ? "verified" : ""}>
                E-posta {profile.email_verified ? "doğrulandı" : "doğrulanmadı"}
              </span>
              <span className={profile.phone_verified ? "verified" : ""}>
                Telefon {profile.phone_verified ? "doğrulandı" : "doğrulanmadı"}
              </span>
              {profile.seller_profile?.verified && (
                <span className="verified">Doğrulanmış satıcı</span>
              )}
            </section>

            <section className="publicProfileStats">
              <article>
                <span>Aktif ilan</span>
                <strong>{profile.active_listings}</strong>
              </article>
              <article>
                <span>Tamamlanan satış</span>
                <strong>{profile.completed_sales}</strong>
              </article>
              <article>
                <span>Tamamlanan alışveriş</span>
                <strong>{profile.completed_purchases}</strong>
              </article>
              <article>
                <span>Takipçi</span>
                <strong>{profile.follower_count}</strong>
              </article>
            </section>

            <section className="publicProfileAbout">
              <div>
                <span>HAKKINDA</span>
                <h3>Kullanıcı bilgisi</h3>
              </div>
              <p>
                {profile.bio?.trim() ||
                  "Bu kullanıcı henüz kendisi hakkında bilgi eklememiş."}
              </p>
            </section>

            <section className="publicProfileRating">
              <div>
                <span>SATICI PUANI</span>
                <strong>
                  {profile.review_count
                    ? profile.average_rating.toFixed(1)
                    : "Yeni"}
                </strong>
                <small>{stars(profile.average_rating)}</small>
              </div>
              <p>{profile.review_count} doğrulanmış değerlendirme</p>
            </section>

            <footer className="publicProfileFooter">
              <span>
                Üyelik:{" "}
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </span>

              {profile.account_type === "seller" && (
                <button type="button" onClick={onOpenStore}>
                  Satıcı mağazasını aç
                </button>
              )}
            </footer>
          </>
        ) : (
          <div className="publicProfileEmpty">Profil bulunamadı.</div>
        )}
      </section>
    </div>
  );
}
