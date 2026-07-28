import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PaymentHttpError } from "@/lib/supabase-server";

export type InvitationRole = "buyer" | "seller" | "operator";
export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type AdminInvitationRow = {
  id: string;
  email: string;
  fullName: string;
  role: InvitationRole;
  status: InvitationStatus;
  authUserId: string | null;
  invitedBy: string;
  invitedByName: string;
  redirectPath: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

type InvitationDbRow = {
  id: string;
  email: string;
  full_name: string;
  invited_role: string;
  status: string;
  auth_user_id: string | null;
  invited_by: string;
  redirect_path: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeRole(value: unknown): InvitationRole {
  return value === "seller" || value === "operator" ? value : "buyer";
}

function safeStatus(value: unknown): InvitationStatus {
  return value === "accepted" || value === "revoked" || value === "expired" ? value : "pending";
}

function destinationForRole(role: InvitationRole) {
  if (role === "seller") return "/satici-dogrulama";
  if (role === "operator") return "/yonetim";
  return "/profil";
}

function invitationRedirect(origin: string, role: InvitationRole) {
  const destination = destinationForRole(role);
  const passwordPage = `/sifre-yenile?invite=1&returnTo=${encodeURIComponent(destination)}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(passwordPage)}`;
}

async function findAuthUserByEmail(admin: SupabaseClient, email: string) {
  const normalized = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new PaymentHttpError(500, "Kullanıcı hesabı kontrol edilemedi.", error.message);
    const match = data.users.find((candidate) => candidate.email?.toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < 100) break;
  }
  return null;
}

async function ensureAdminActor(admin: SupabaseClient, actor: User) {
  const { data, error } = await admin
    .from("kk_profiles")
    .select("role,admin_level,account_status,full_name")
    .eq("id", actor.id)
    .maybeSingle();
  if (error || !data) throw new PaymentHttpError(403, "Yönetici profili doğrulanamadı.", error?.code);
  if (data.role !== "admin" || data.account_status !== "active") throw new PaymentHttpError(403, "Yönetici yetkisi gerekiyor.");
  return {
    adminLevel: data.admin_level === "owner" ? "owner" as const : "operator" as const,
    fullName: String(data.full_name || actor.email || "KapışKapış yöneticisi"),
  };
}

export async function listAdminInvitations(admin: SupabaseClient): Promise<AdminInvitationRow[]> {
  const { error: expireError } = await admin.rpc("kk_expire_admin_invitations");
  if (expireError && expireError.code !== "42883") {
    throw new PaymentHttpError(503, "Davet şeması hazır değil. Paket 35 SQL dosyasını çalıştır.", expireError.code);
  }

  const { data, error } = await admin
    .from("kk_admin_invitations")
    .select("id,email,full_name,invited_role,status,auth_user_id,invited_by,redirect_path,expires_at,accepted_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new PaymentHttpError(503, "Davet kayıtları okunamadı. Paket 35 SQL dosyasını çalıştır.", error.code);

  const rows = (data ?? []) as InvitationDbRow[];
  const inviterIds = [...new Set(rows.map((row) => row.invited_by))];
  const { data: profiles, error: profilesError } = inviterIds.length
    ? await admin.from("kk_profiles").select("id,full_name").in("id", inviterIds)
    : { data: [], error: null };
  if (profilesError) throw new PaymentHttpError(500, "Davet eden yönetici bilgileri okunamadı.", profilesError.code);
  const profileMap = new Map((profiles ?? []).map((profile) => [String(profile.id), String(profile.full_name || "KapışKapış yöneticisi")]));

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: safeRole(row.invited_role),
    status: safeStatus(row.status),
    authUserId: row.auth_user_id,
    invitedBy: row.invited_by,
    invitedByName: profileMap.get(row.invited_by) ?? "KapışKapış yöneticisi",
    redirectPath: row.redirect_path,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  }));
}

export async function createAdminInvitation(
  admin: SupabaseClient,
  actor: User,
  input: { email?: string; fullName?: string; role?: InvitationRole; origin: string },
) {
  const actorProfile = await ensureAdminActor(admin, actor);
  const email = String(input.email ?? "").trim().toLowerCase();
  const fullName = String(input.fullName ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const role = safeRole(input.role);

  if (!emailPattern.test(email)) throw new PaymentHttpError(400, "Geçerli bir e-posta adresi yazmalısın.");
  if (fullName.length < 3) throw new PaymentHttpError(400, "Ad soyad en az 3 karakter olmalı.");
  if (role === "operator" && actorProfile.adminLevel !== "owner") {
    throw new PaymentHttpError(403, "Operasyon yöneticisi davetini yalnız sahip yönetici gönderebilir.");
  }

  const existingUser = await findAuthUserByEmail(admin, email);
  if (existingUser) throw new PaymentHttpError(409, "Bu e-posta adresiyle daha önce hesap veya davet oluşturulmuş.", "EMAIL_ALREADY_EXISTS");

  const { data: existingInvite, error: inviteCheckError } = await admin
    .from("kk_admin_invitations")
    .select("id,status,expires_at")
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();
  if (inviteCheckError) throw new PaymentHttpError(503, "Davet şeması hazır değil. Paket 35 SQL dosyasını çalıştır.", inviteCheckError.code);
  if (existingInvite) throw new PaymentHttpError(409, "Bu e-posta adresine gönderilmiş aktif bir davet zaten var.");

  const destination = destinationForRole(role);
  const redirectTo = invitationRedirect(input.origin, role);
  const accountType = role === "seller" ? "seller" : "buyer";
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name: fullName,
      account_type: accountType,
      invited_role: role,
      invited_by: actor.id,
      marketing_opt_in: false,
      terms_version: "2026.07",
    },
  });
  if (inviteError || !inviteData.user) {
    throw new PaymentHttpError(502, inviteError?.message || "Davet e-postası gönderilemedi.", inviteError?.name);
  }

  const authUserId = inviteData.user.id;
  try {
    if (role === "operator") {
      const { error: roleError } = await admin
        .from("kk_profiles")
        .update({
          role: "admin",
          admin_level: "operator",
          role_before_admin: "buyer",
          account_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUserId);
      if (roleError) throw new PaymentHttpError(500, "Davet edilen yönetici rolü kaydedilemedi.", roleError.code);
    }

    const { data: invitation, error: insertError } = await admin
      .from("kk_admin_invitations")
      .insert({
        email,
        full_name: fullName,
        invited_role: role,
        status: "pending",
        auth_user_id: authUserId,
        invited_by: actor.id,
        redirect_path: destination,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();
    if (insertError) throw new PaymentHttpError(500, "Davet kaydı oluşturulamadı.", insertError.code);

    await admin.from("kk_security_events").insert({
      user_id: actor.id,
      actor_user_id: actor.id,
      event_type: role === "operator" ? "admin_invitation_sent" : "account_invitation_sent",
      title: role === "operator" ? "Operasyon yöneticisi daveti gönderildi" : "Kullanıcı daveti gönderildi",
      description: `${fullName} (${email}) hesabı ${role === "seller" ? "satıcı" : role === "operator" ? "operasyon yöneticisi" : "alıcı"} rolüyle davet edildi.`,
      severity: role === "operator" ? "warning" : "info",
      metadata: { invitation_id: invitation.id, invited_user_id: authUserId, role },
    });

    return { id: invitation.id, authUserId };
  } catch (error) {
    await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    throw error;
  }
}

export async function revokeAdminInvitation(admin: SupabaseClient, actor: User, invitationId: string) {
  await ensureAdminActor(admin, actor);
  if (!/^[0-9a-f-]{36}$/i.test(invitationId)) throw new PaymentHttpError(400, "Geçersiz davet kimliği.");

  const { data: invitation, error } = await admin
    .from("kk_admin_invitations")
    .select("id,email,full_name,invited_role,status,auth_user_id")
    .eq("id", invitationId)
    .maybeSingle();
  if (error) throw new PaymentHttpError(503, "Davet kaydı okunamadı.", error.code);
  if (!invitation) throw new PaymentHttpError(404, "Davet bulunamadı.");
  if (invitation.status !== "pending") throw new PaymentHttpError(409, "Yalnız bekleyen davetler iptal edilebilir.");

  if (invitation.invited_role === "operator") {
    const actorProfile = await ensureAdminActor(admin, actor);
    if (actorProfile.adminLevel !== "owner") throw new PaymentHttpError(403, "Yönetici davetini yalnız sahip yönetici iptal edebilir.");
  }

  if (invitation.auth_user_id) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(invitation.auth_user_id);
    if (userError && userError.status !== 404) throw new PaymentHttpError(500, "Davet hesabı doğrulanamadı.", userError.message);
    if (userData.user?.email_confirmed_at) throw new PaymentHttpError(409, "Kullanıcı daveti kabul etmiş; davet iptal edilemez.");
  }

  const { error: updateError } = await admin
    .from("kk_admin_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("status", "pending");
  if (updateError) throw new PaymentHttpError(500, "Davet iptal edilemedi.", updateError.code);

  if (invitation.auth_user_id) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(invitation.auth_user_id);
    if (deleteError) throw new PaymentHttpError(500, "Davet hesabı silinemedi.", deleteError.message);
  }

  await admin.from("kk_security_events").insert({
    user_id: actor.id,
    actor_user_id: actor.id,
    event_type: "account_invitation_revoked",
    title: "Hesap daveti iptal edildi",
    description: `${invitation.full_name} (${invitation.email}) daveti iptal edildi.`,
    severity: invitation.invited_role === "operator" ? "warning" : "info",
    metadata: { invitation_id: invitationId, role: invitation.invited_role },
  });

  return { ok: true };
}
