import type { Metadata } from "next";
import { Suspense } from "react";
import RegistrationPendingExperience from "@/components/RegistrationPendingExperience";

export const metadata: Metadata = { title: "E-posta Doğrulama — KapışKapış" };

export default function Page() {
  return (
    <Suspense fallback={<div className="authorizationStateV19"><section><span>KAPIŞKAPIŞ</span><h1>Doğrulama ekranı hazırlanıyor</h1></section></div>}>
      <RegistrationPendingExperience />
    </Suspense>
  );
}
