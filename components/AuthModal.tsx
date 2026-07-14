"use client";

import type { FormEvent } from "react";

type AuthModalProps = {
  open: boolean;
  mode: "login" | "register";
  fullName: string;
  email: string;
  password: string;
  loading: boolean;
  onClose: () => void;
  onModeChange: (mode: "login" | "register") => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
};

export default function AuthModal(props: AuthModalProps) {
  if (!props.open) return null;

  return (
    <div className="modalBackdrop" onMouseDown={props.onClose}>
      <section className="modalCard" onMouseDown={(event) => event.stopPropagation()}>
        <button className="closeButton" type="button" onClick={props.onClose}>×</button>

        <div className="modalBrand">
          <img className="modalBrandImage" src="/kapiskapis-icon.png" alt="KapışKapış" />
          <div>
            <strong>KapışKapış</strong>
            <small>Hesabına eriş</small>
          </div>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={props.mode === "login" ? "active" : ""}
            onClick={() => props.onModeChange("login")}
          >
            Giriş yap
          </button>
          <button
            type="button"
            className={props.mode === "register" ? "active" : ""}
            onClick={() => props.onModeChange("register")}
          >
            Kayıt ol
          </button>
        </div>

        <form onSubmit={props.onSubmit}>
          {props.mode === "register" && (
            <label>
              Ad soyad
              <input
                value={props.fullName}
                onChange={(event) => props.onFullNameChange(event.target.value)}
                placeholder="Ad soyad"
              />
            </label>
          )}

          <label>
            E-posta
            <input
              type="email"
              value={props.email}
              onChange={(event) => props.onEmailChange(event.target.value)}
              required
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              value={props.password}
              onChange={(event) => props.onPasswordChange(event.target.value)}
              minLength={6}
              required
            />
          </label>

          <button className="modalPrimary" type="submit" disabled={props.loading}>
            {props.loading ? "İşleniyor..." : props.mode === "login" ? "Giriş yap" : "Hesap oluştur"}
          </button>

          {props.mode === "login" && (
            <button className="linkButton" type="button" onClick={props.onForgotPassword}>
              Şifremi unuttum
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
