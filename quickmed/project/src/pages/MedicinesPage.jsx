/* MedicinesPage.jsx
   Full medicines catalog page with search/filter and grid of MedicineCard.
   Medicines are fetched live from PostgreSQL via the backend API. Category
   and search query can be controlled externally (e.g. from HomePage's hero)
   via externalCat / externalQuery, or managed internally when used standalone.
*/
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { C } from "../theme";
import { CATEGORIES } from "../data";
import { api } from "../api";
import { PageHeader } from "../components/Common";
import { MedicineCard } from "../components/MedicineCard";

export function MedicinesPage({
  theme,
  dark,
  wishlist,
  toggleWishlist,
  addToCart,
  goTo,
  externalQuery,
  externalCat,
  hideSearchBox = false,
  hideTitle = false,
  hideCategories = false,
}) {
  const [activeCat, setActiveCat] = useState("All");
  const [internalQuery, setInternalQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const cat = externalCat !== undefined ? externalCat : activeCat;
  const hasSearched = query.trim().length > 0 || cat !== "All";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getMedicines()
      .then((data) => {
        if (!cancelled) setMedicines(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cats = ["All", ...CATEGORIES.map((c) => c.name)];
  const filtered = medicines.filter(
    (m) =>
      (cat === "All" || m.tag === cat) &&
      m.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: hideTitle ? "0px 24px 90px" : "40px 24px 90px",
      }}
    >
      <PageHeader
        theme={theme}
        eyebrow="Browse"
        title={hideTitle ? "" : "All medicines"}
        sub="Search across every licensed pharmacy near you."
      />

      {!hideCategories && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            margin: "8px 0 24px",
          }}
        >
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className="qm-btn"
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${cat === c ? C.primary : theme.border}`,
                background: cat === c ? C.primary : theme.card,
                color: cat === c ? "#fff" : theme.text,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {!hideSearchBox && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: "4px 4px 4px 16px",
            maxWidth: 598,
            margin: "0 auto 40px",
          }}
        >
          <Search size={17} color={theme.sub} />
          <input
            value={internalQuery}
            onChange={(e) => setInternalQuery(e.target.value)}
            placeholder="Search medicines..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              padding: "11px 12px",
              fontSize: 14,
              color: theme.text,
            }}
          />
        </div>
      )}

      {!hasSearched ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: theme.sub }}
        >
          <Search size={30} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontWeight: 700, color: theme.text, marginBottom: 4 }}>
            Search for a medicine
          </div>
          <div style={{ fontSize: 13.5 }}>
            Type a name above or pick a category to see matching medicines.
          </div>
        </div>
      ) : loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: theme.sub }}
        >
          <Loader2
            size={28}
            style={{ marginBottom: 12, animation: "spin 1s linear infinite" }}
          />
          <div style={{ fontSize: 13.5 }}>Loading medicines…</div>
        </div>
      ) : error ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: C.danger }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Couldn't load medicines
          </div>
          <div style={{ fontSize: 13.5 }}>{error}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: theme.sub }}
        >
          <Search size={30} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontWeight: 700, color: theme.text, marginBottom: 4 }}>
            No medicines found
          </div>
          <div style={{ fontSize: 13.5 }}>
            Try a different search term or category.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
          }}
          className="qm-med-grid"
        >
          {filtered.map((m) => (
            <MedicineCard
              key={m.id}
              m={m}
              theme={theme}
              dark={dark}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              onOpen={() => goTo("detail", m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
