import type { Metadata } from "next";
import AuthExperience from "@/components/AuthExperience";

export const metadata: Metadata = { title: "Kayıt Ol — KapışKapış" };

export default function Page() {
  return <AuthExperience mode="register" />;
}
