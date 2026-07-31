/* AboutPage.jsx
   Static About Us page.
*/
import { C } from "../theme";
import { Reveal, PageHeader } from "../components/Common";

export function AboutPage({ theme }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 90px" }}>
      <PageHeader theme={theme} eyebrow="Our story" title="Healthcare shouldn't wait" sub="Quick Med began with a simple frustration: medicine delivery took hours when people needed minutes." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, margin: "40px 0" }} className="qm-about-grid">
        {[{ t: "Our mission", d: "Connect every household to licensed pharmacies within 30 minutes, anywhere in the city." }, { t: "Our vision", d: "A world where no one delays treatment because medicine felt out of reach." }].map((x) => (
          <Reveal key={x.t}><div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}><div style={{ fontWeight: 700, marginBottom: 8 }}>{x.t}</div><div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.7 }}>{x.d}</div></div></Reveal>
        ))}
      </div>
      <Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, borderLeft: `2px solid ${theme.border}`, paddingLeft: 24, marginTop: 40 }}>
          {[["2023", "Quick Med founded in Dhaka with 12 partner pharmacies."], ["2024", "Crossed 500 licensed pharmacies and launched AI medicine scanning."], ["2025", "Expanded 30-minute delivery to every major city district."]].map(([y, t]) => (
            <div key={y}><div style={{ fontWeight: 800, color: C.primary, fontSize: 13 }}>{y}</div><div style={{ fontSize: 13.5, color: theme.sub, marginTop: 2 }}>{t}</div></div>
          ))}
        </div>
      </Reveal>
      </div>
  );
}
