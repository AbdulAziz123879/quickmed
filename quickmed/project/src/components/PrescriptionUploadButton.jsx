// /* PrescriptionUploadButton.jsx
//    Lets the user attach a prescription by picking a file from their
//    device or taking a photo with their camera. Both options open native pickers via hidden
//    <input type="file"> elements (the camera one uses capture="environment" to open the camera
//    directly on mobile). Renders as a hero button, a checkout dropzone, or a dashboard pill,
//    depending on `variant`.
// */
// import { useState, useEffect, useRef } from "react";
// import { Sparkles, X, Image as ImageIcon, Camera, FileText, Check, Trash2, Upload } from "lucide-react";
// import { C } from "../theme";
// import { API_BASE_URL } from "../config";
// import { MEDICINES } from "../data";

// export function PrescriptionUploadButton({ theme, variant = "button", label = "Upload Prescription", addToCart }) {
//   const [open, setOpen] = useState(false);
//   const [file, setFile] = useState(null); // { name, url, isImage }
//   const [reading, setReading] = useState(false);
//   const [detected, setDetected] = useState(null); // array of strings, or null before first read
//   const [readError, setReadError] = useState(null);
//   const fileInputRef = useRef(null);
//   const cameraInputRef = useRef(null);

//   useEffect(() => () => { if (file?.url) URL.revokeObjectURL(file.url); }, [file]);

//   const fileToBase64 = (f) => new Promise((resolve, reject) => {
//     const r = new FileReader();
//     r.onload = () => resolve(String(r.result).split(",")[1]);
//     r.onerror = () => reject(new Error("Could not read file"));
//     r.readAsDataURL(f);
//   });

//   const readPrescriptionWithAI = async (f) => {
//     setReading(true);
//     setReadError(null);
//     setDetected(null);
//     try {
//       const base64 = await fileToBase64(f);
//       const isPdf = f.type === "application/pdf";
//       const response = await fetch(`${API_BASE_URL}/api/prescription/read`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ base64, mediaType: f.type || "image/jpeg", isPdf }),
//       });
//       const data = await response.json().catch(() => ({}));
//       if (!response.ok) {
//         throw new Error(data?.error || `Backend error (${response.status})`);
//       }
//       setDetected(Array.isArray(data.medicines) ? data.medicines : []);
//     } catch (e) {
//       console.error("Prescription AI reader failed:", e);
//       const isNetworkError = e instanceof TypeError; // fetch throws TypeError when it can't reach the server at all
//       setReadError(
//         isNetworkError
//           ? `Couldn't reach the backend at ${API_BASE_URL}. Make sure it's running (see /backend/README.md).`
//           : `Couldn't read that prescription. ${e.message || "Try a sharper, well-lit photo."}`
//       );
//     } finally {
//       setReading(false);
//     }
//   };

//   const acceptFile = (f) => {
//     if (!f) return;
//     const isImage = f.type.startsWith("image/");
//     setFile({ name: f.name, url: isImage ? URL.createObjectURL(f) : null, isImage });
//     setOpen(false);
//     readPrescriptionWithAI(f);
//   };
//   const removeFile = (e) => { e.stopPropagation(); setFile(null); setDetected(null); setReadError(null); };

//   const matches = (detected || []).map((queried) => {
//     const q = queried.toLowerCase();
//     const medicine = MEDICINES.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.split(" ")[0].toLowerCase()));
//     return { queried, medicine };
//   });

//   const resultsPanel = (file && (reading || readError || detected)) ? (
//     <div style={{ marginTop: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 }}>
//       {reading && (
//         <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: theme.sub }}>
//           <Sparkles size={14} color={C.primary} /> Reading prescription with AI…
//         </div>
//       )}
//       {!reading && readError && (
//         <div style={{ fontSize: 12.5, color: C.danger }}>{readError}</div>
//       )}
//       {!reading && detected && (
//         <>
//           <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, color: theme.text }}>
//             <Sparkles size={13} color={C.primary} /> {detected.length === 0 ? "No medicines detected" : `AI detected ${detected.length} medicine${detected.length !== 1 ? "s" : ""}`}
//           </div>
//           {detected.length === 0 ? (
//             <div style={{ fontSize: 12.5, color: theme.sub }}>Try a sharper, well-lit photo of the prescription.</div>
//           ) : (
//             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//               {matches.map((mtch, i) => (
//                 <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
//                   <div style={{ minWidth: 0 }}>
//                     <span style={{ fontWeight: 700, color: theme.text }}>{mtch.queried}</span>
//                     <span style={{ color: theme.sub }}>{mtch.medicine ? ` — matched ${mtch.medicine.name}` : " — not in catalog"}</span>
//                   </div>
//                   {mtch.medicine && addToCart && (
//                     <button onClick={() => addToCart(mtch.medicine)} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   ) : null;

//   const hiddenInputs = (
//     <>
//       <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
//       <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
//     </>
//   );

//   const modal = open && (
//     <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
//       <div onClick={(e) => e.stopPropagation()} style={{ background: theme.card, borderRadius: 20, padding: 22, width: "100%", maxWidth: 360, border: `1px solid ${theme.border}` }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//           <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Upload prescription</div>
//           <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub }} aria-label="Close"><X size={18} /></button>
//         </div>
//         <button onClick={() => fileInputRef.current?.click()} className="qm-btn" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
//           <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ImageIcon size={18} color={C.primary} /></div>
//           <div>
//             <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Choose from device</div>
//             <div style={{ fontSize: 11.5, color: theme.sub }}>Image or PDF from your gallery or files</div>
//           </div>
//         </button>
//         <button onClick={() => cameraInputRef.current?.click()} className="qm-btn" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
//           <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Camera size={18} color="#047857" /></div>
//           <div>
//             <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Take a photo</div>
//             <div style={{ fontSize: 11.5, color: theme.sub }}>Use your camera right now</div>
//           </div>
//         </button>
//       </div>
//     </div>
//   );

//   if (variant === "dropzone") {
//     return (
//       <>
//         {hiddenInputs}
//         {file ? (
//           <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
//             {file.isImage && file.url ? (
//               <img src={file.url} alt="Prescription preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
//             ) : (
//               <div style={{ width: 44, height: 44, borderRadius: 8, background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={18} color={C.primary} /></div>
//             )}
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
//               <div style={{ fontSize: 11.5, color: "#047857", display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Attached</div>
//             </div>
//             <button onClick={removeFile} style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, flexShrink: 0 }} aria-label="Remove prescription"><Trash2 size={16} /></button>
//           </div>
//         ) : (
//           <div onClick={() => setOpen(true)} style={{ border: `1.5px dashed ${theme.border}`, borderRadius: 12, padding: "24px", textAlign: "center", fontSize: 13, color: theme.sub, cursor: "pointer" }}>
//             <Upload size={18} style={{ marginBottom: 6, opacity: 0.6 }} /><br />
//             Drag & drop or click to upload
//           </div>
//         )}
//         {resultsPanel}
//         {modal}
//       </>
//     );
//   }

//   if (variant === "pill") {
//     return (
//       <>
//         {hiddenInputs}
//         <button onClick={() => setOpen(true)} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: theme.text }}>
//           {file ? <Check size={15} color="#047857" /> : <Upload size={15} color={C.primary} />} {file ? "Prescription attached" : "Upload prescription"}
//         </button>
//         {resultsPanel}
//         {modal}
//       </>
//     );
//   }

//   return (
//     <>
//       {hiddenInputs}
//       <button onClick={() => setOpen(true)} className="qm-btn" style={{ background: file ? "#ECFDF5" : theme.card, color: file ? "#047857" : theme.text, border: `1px solid ${file ? "#A7F3D0" : theme.border}`, padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, maxWidth: 260 }}>
//         {file ? <Check size={16} /> : <Upload size={16} />}
//         <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file ? file.name : label}</span>
//       </button>
//       {resultsPanel}
//       {modal}
//     </>
//   );
// }



/* PrescriptionUploadButton.jsx
   Lets the user attach a prescription by picking a file from their
   device or taking a photo with their camera. Both options open native pickers via hidden
   <input type="file"> elements (the camera one uses capture="environment" to open the camera
   directly on mobile). Renders as a hero button, a checkout dropzone, or a dashboard pill,
   depending on `variant`.

   Medicine matching now fetches the live catalog from PostgreSQL via the
   backend API instead of importing the static MEDICINES array.
*/
import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Image as ImageIcon, Camera, FileText, Check, Trash2, Upload } from "lucide-react";
import { C } from "../theme";
import { API_BASE_URL } from "../config";
import { api } from "../api";

export function PrescriptionUploadButton({ theme, variant = "button", label = "Upload Prescription", addToCart }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null); // { name, url, isImage }
  const [reading, setReading] = useState(false);
  const [detected, setDetected] = useState(null); // array of strings, or null before first read
  const [readError, setReadError] = useState(null);
  const [catalog, setCatalog] = useState([]); // fetched once, used to match AI-detected names
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => () => { if (file?.url) URL.revokeObjectURL(file.url); }, [file]);

  // Fetch the live medicines catalog once, so matches() below can look up
  // real IDs/prices instead of relying on a hardcoded import.
  useEffect(() => {
    api.getMedicines().then(setCatalog).catch((e) => console.error("Failed to load catalog for matching:", e));
  }, []);

  const fileToBase64 = (f) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(f);
  });

  const readPrescriptionWithAI = async (f) => {
    setReading(true);
    setReadError(null);
    setDetected(null);
    try {
      const base64 = await fileToBase64(f);
      const isPdf = f.type === "application/pdf";
      const response = await fetch(`${API_BASE_URL}/api/prescription/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: f.type || "image/jpeg", isPdf }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || `Backend error (${response.status})`);
      }
      setDetected(Array.isArray(data.medicines) ? data.medicines : []);
    } catch (e) {
      console.error("Prescription AI reader failed:", e);
      const isNetworkError = e instanceof TypeError; // fetch throws TypeError when it can't reach the server at all
      setReadError(
        isNetworkError
          ? `Couldn't reach the backend at ${API_BASE_URL}. Make sure it's running (see /backend/README.md).`
          : `Couldn't read that prescription. ${e.message || "Try a sharper, well-lit photo."}`
      );
    } finally {
      setReading(false);
    }
  };

  const acceptFile = (f) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    setFile({ name: f.name, url: isImage ? URL.createObjectURL(f) : null, isImage });
    setOpen(false);
    readPrescriptionWithAI(f);
  };
  const removeFile = (e) => { e.stopPropagation(); setFile(null); setDetected(null); setReadError(null); };

  const matches = (detected || []).map((queried) => {
    const q = queried.toLowerCase();
    const medicine = catalog.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.split(" ")[0].toLowerCase()));
    return { queried, medicine };
  });

  const resultsPanel = (file && (reading || readError || detected)) ? (
    <div style={{ marginTop: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 }}>
      {reading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: theme.sub }}>
          <Sparkles size={14} color={C.primary} /> Reading prescription with AI…
        </div>
      )}
      {!reading && readError && (
        <div style={{ fontSize: 12.5, color: C.danger }}>{readError}</div>
      )}
      {!reading && detected && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, color: theme.text }}>
            <Sparkles size={13} color={C.primary} /> {detected.length === 0 ? "No medicines detected" : `AI detected ${detected.length} medicine${detected.length !== 1 ? "s" : ""}`}
          </div>
          {detected.length === 0 ? (
            <div style={{ fontSize: 12.5, color: theme.sub }}>Try a sharper, well-lit photo of the prescription.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matches.map((mtch, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: theme.text }}>{mtch.queried}</span>
                    <span style={{ color: theme.sub }}>{mtch.medicine ? ` — matched ${mtch.medicine.name}` : " — not in catalog"}</span>
                  </div>
                  {mtch.medicine && addToCart && (
                    <button onClick={() => addToCart(mtch.medicine)} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  ) : null;

  const hiddenInputs = (
    <>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
    </>
  );

  const modal = open && (
    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: theme.card, borderRadius: 20, padding: 22, width: "100%", maxWidth: 360, border: `1px solid ${theme.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Upload prescription</div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub }} aria-label="Close"><X size={18} /></button>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="qm-btn" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ImageIcon size={18} color={C.primary} /></div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Choose from device</div>
            <div style={{ fontSize: 11.5, color: theme.sub }}>Image or PDF from your gallery or files</div>
          </div>
        </button>
        <button onClick={() => cameraInputRef.current?.click()} className="qm-btn" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Camera size={18} color="#047857" /></div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Take a photo</div>
            <div style={{ fontSize: 11.5, color: theme.sub }}>Use your camera right now</div>
          </div>
        </button>
      </div>
    </div>
  );

  if (variant === "dropzone") {
    return (
      <>
        {hiddenInputs}
        {file ? (
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            {file.isImage && file.url ? (
              <img src={file.url} alt="Prescription preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={18} color={C.primary} /></div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
              <div style={{ fontSize: 11.5, color: "#047857", display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Attached</div>
            </div>
            <button onClick={removeFile} style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, flexShrink: 0 }} aria-label="Remove prescription"><Trash2 size={16} /></button>
          </div>
        ) : (
          <div onClick={() => setOpen(true)} style={{ border: `1.5px dashed ${theme.border}`, borderRadius: 12, padding: "24px", textAlign: "center", fontSize: 13, color: theme.sub, cursor: "pointer" }}>
            <Upload size={18} style={{ marginBottom: 6, opacity: 0.6 }} /><br />
            Drag & drop or click to upload
          </div>
        )}
        {resultsPanel}
        {modal}
      </>
    );
  }

  if (variant === "pill") {
    return (
      <>
        {hiddenInputs}
        <button onClick={() => setOpen(true)} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: theme.text }}>
          {file ? <Check size={15} color="#047857" /> : <Upload size={15} color={C.primary} />} {file ? "Prescription attached" : "Upload prescription"}
        </button>
        {resultsPanel}
        {modal}
      </>
    );
  }

  return (
    <>
      {hiddenInputs}
      <button onClick={() => setOpen(true)} className="qm-btn" style={{ background: file ? "#ECFDF5" : theme.card, color: file ? "#047857" : theme.text, border: `1px solid ${file ? "#A7F3D0" : theme.border}`, padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, maxWidth: 260 }}>
        {file ? <Check size={16} /> : <Upload size={16} />}
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file ? file.name : label}</span>
      </button>
      {resultsPanel}
      {modal}
    </>
  );
}