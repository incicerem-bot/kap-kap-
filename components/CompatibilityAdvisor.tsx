"use client";

import { useMemo, useState } from "react";

const sockets: Record<string, string[]> = {
  AM5: ["B650", "B650E", "X670", "X670E", "X870", "X870E"],
  AM4: ["B450", "B550", "X470", "X570"],
  LGA1700: ["B660", "B760", "Z690", "Z790"],
  LGA1851: ["B860", "Z890"],
};

export default function CompatibilityAdvisor({ category }: { category: string }) {
  const [socket, setSocket] = useState("AM5");
  const [chipset, setChipset] = useState("B650");
  const [radiator, setRadiator] = useState("360 mm");
  const [caseSupport, setCaseSupport] = useState("360 mm");
  const compatible = useMemo(() => sockets[socket]?.includes(chipset) && Number.parseInt(caseSupport) >= Number.parseInt(radiator), [caseSupport, chipset, radiator, socket]);
  const relevant = ["anakart", "islemci", "sivi-sogutma", "hava-sogutma", "bilgisayar-kasasi"].includes(category);
  if (!relevant) return null;
  return <section className="compatibilityAdvisorV40">
    <header><div><span>UYUMLULUK KONTROLÜ</span><h2>Parçalar birlikte çalışır mı?</h2></div><strong className={compatible ? "compatible" : "warning"}>{compatible ? "Uyumlu görünüyor" : "Seçimleri kontrol et"}</strong></header>
    <div className="compatibilityGridV40">
      <label><span>İşlemci soketi</span><select value={socket} onChange={(event) => { const next = event.target.value; setSocket(next); setChipset(sockets[next][0]); }}>{Object.keys(sockets).map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Anakart yonga seti</span><select value={chipset} onChange={(event) => setChipset(event.target.value)}>{Object.values(sockets).flat().map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Soğutucu radyatörü</span><select value={radiator} onChange={(event) => setRadiator(event.target.value)}>{["120 mm", "240 mm", "280 mm", "360 mm", "420 mm"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Kasa radyatör desteği</span><select value={caseSupport} onChange={(event) => setCaseSupport(event.target.value)}>{["120 mm", "240 mm", "280 mm", "360 mm", "420 mm"].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p>{compatible ? `${socket} ve ${chipset} eşleşiyor; ${radiator} radyatör seçilen kasaya sığıyor.` : "İşlemci–anakart soketini veya kasa–radyatör ölçüsünü eşleştir."} Üreticinin güncel destek listesini satın almadan önce ayrıca kontrol et.</p>
  </section>;
}
