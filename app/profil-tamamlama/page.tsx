import { redirect } from "next/navigation";

export const metadata = { title: "Profil — KapışKapış" };

export default function Page() {
  redirect("/ayarlar?tab=profile");
}
