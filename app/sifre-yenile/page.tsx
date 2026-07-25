import type { Metadata } from "next";
import PasswordRecoveryExperience from "@/components/PasswordRecoveryExperience";

export const metadata: Metadata = { title: "Yeni Şifre — KapışKapış" };

export default function Page() {
  return <PasswordRecoveryExperience />;
}
