


// /* RegisterPage.jsx
//    User registration form, with a role toggle. Customers now register
//    against PostgreSQL via /api/customers/register, or instantly via
//    Google Sign-In (/api/customers/google-auth) — both return the same
//    customer profile shape. Riders are pre-registered partner accounts
//    (see riderData.js / the riders table), so choosing "Rider" here
//    links out to rider login/contact instead of a real signup form.
// */
// import { useState } from "react";
// import { User, Bike } from "lucide-react";
// import { C, inputStyle } from "../theme";
// import { Reveal } from "../components/Common";
// import { AuthIllustration } from "../components/AuthIllustration";
// import { GoogleAuthButton } from "../components/GoogleAuthButton";
// import { api } from "../api";

// export function RegisterPage({ theme, dark, goTo, onCustomerLogin }) {
//   const [role, setRole] = useState("customer"); // "customer" | "rider"
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [pw, setPw] = useState("");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const strength =
//     pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
//   const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
//   const strengthColor = ["", C.danger, "#F59E0B", C.success][strength];

//   const handleSubmit = async () => {
//     if (!name.trim() || !email.trim() || !pw) {
//       setError("Fill in your name, email and password to continue.");
//       return;
//     }
//     if (pw.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }
//     setError("");
//     setSubmitting(true);
//     try {
//       const profile = await api.registerCustomer({
//         name,
//         email,
//         phone,
//         address,
//         password: pw,
//       });
//       onCustomerLogin?.(profile);
//       goTo("dashboard");
//     } catch (e) {
//       setError(e.message || "Couldn't create your account. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         maxWidth: 1000,
//         margin: "0 auto",
//         padding: "56px 24px 90px",
//         display: "grid",
//         gridTemplateColumns: "1fr 1fr",
//         gap: 48,
//         alignItems: "center",
//       }}
//       className="qm-auth-grid"
//     >
//       <Reveal>
//         <AuthIllustration theme={theme} />
//       </Reveal>
//       <Reveal delay={100}>
//         <div
//           style={{
//             background: theme.card,
//             border: `1px solid ${theme.border}`,
//             borderRadius: 20,
//             padding: 36,
//             maxWidth: 400,
//           }}
//         >
//           <h2
//             className="qm-display"
//             style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}
//           >
//             Create your account
//           </h2>
//           <p style={{ fontSize: 13.5, color: theme.sub, marginBottom: 20 }}>
//             Get medicines delivered in 30 minutes.
//           </p>

//           {/* Role toggle */}
//           <div
//             style={{
//               display: "flex",
//               gap: 8,
//               background: theme.bg,
//               border: `1px solid ${theme.border}`,
//               borderRadius: 12,
//               padding: 4,
//               marginBottom: 22,
//             }}
//           >
//             {[
//               { key: "customer", label: "Customer", icon: User },
//               { key: "rider", label: "Rider", icon: Bike },
//             ].map((r) => (
//               <button
//                 key={r.key}
//                 onClick={() => {
//                   setRole(r.key);
//                   setError("");
//                 }}
//                 className="qm-btn"
//                 style={{
//                   flex: 1,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: 6,
//                   border: "none",
//                   cursor: "pointer",
//                   padding: "9px 0",
//                   borderRadius: 9,
//                   fontSize: 13,
//                   fontWeight: 700,
//                   background: role === r.key ? C.primary : "transparent",
//                   color: role === r.key ? "#fff" : theme.sub,
//                 }}
//               >
//                 <r.icon size={14} /> {r.label}
//               </button>
//             ))}
//           </div>

//           {role === "customer" ? (
//             <>
//               {/* Google Sign-In */}
//               <GoogleAuthButton
//                 dark={dark}
//                 onSuccess={(profile) => {
//                   onCustomerLogin?.(profile);
//                   goTo("dashboard");
//                 }}
//                 onError={setError}
//               />
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   margin: "18px 0",
//                 }}
//               >
//                 <div style={{ flex: 1, height: 1, background: theme.border }} />
//                 <span style={{ fontSize: 12, color: theme.sub }}>or</span>
//                 <div style={{ flex: 1, height: 1, background: theme.border }} />
//               </div>

//               <div
//                 style={{ display: "flex", flexDirection: "column", gap: 14 }}
//               >
//                 <input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Full name"
//                   style={inputStyle(theme)}
//                 />
//                 <input
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Email address"
//                   style={inputStyle(theme)}
//                 />
//                 <input
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="Phone number"
//                   style={inputStyle(theme)}
//                 />
//                 <input
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   placeholder="Delivery address"
//                   style={inputStyle(theme)}
//                 />
//                 <input
//                   type="password"
//                   value={pw}
//                   onChange={(e) => setPw(e.target.value)}
//                   placeholder="Create password"
//                   style={inputStyle(theme)}
//                 />
//                 {pw.length > 0 && (
//                   <div>
//                     <div
//                       style={{
//                         height: 4,
//                         borderRadius: 999,
//                         background: theme.border,
//                         overflow: "hidden",
//                       }}
//                     >
//                       <div
//                         style={{
//                           height: "100%",
//                           width: `${strength * 33.3}%`,
//                           background: strengthColor,
//                           transition: "width 0.3s",
//                         }}
//                       />
//                     </div>
//                     <div
//                       style={{
//                         fontSize: 11.5,
//                         color: strengthColor,
//                         marginTop: 4,
//                         fontWeight: 600,
//                       }}
//                     >
//                       {strengthLabel} password
//                     </div>
//                   </div>
//                 )}
//                 {error && (
//                   <div
//                     style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}
//                   >
//                     {error}
//                   </div>
//                 )}
//                 <button
//                   onClick={handleSubmit}
//                   disabled={submitting}
//                   className="qm-btn"
//                   style={{
//                     background: C.primary,
//                     color: "#fff",
//                     border: "none",
//                     padding: "13px",
//                     borderRadius: 12,
//                     fontWeight: 700,
//                     fontSize: 14.5,
//                     cursor: submitting ? "default" : "pointer",
//                     marginTop: 8,
//                     opacity: submitting ? 0.7 : 1,
//                   }}
//                 >
//                   {submitting ? "Creating account…" : "Create account"}
//                 </button>
//               </div>
//               <div
//                 style={{
//                   textAlign: "center",
//                   fontSize: 13,
//                   color: theme.sub,
//                   marginTop: 20,
//                 }}
//               >
//                 Already have an account?{" "}
//                 <button
//                   onClick={() => goTo("login")}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: C.primary,
//                     fontWeight: 700,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Log in
//                 </button>
//               </div>
//             </>
//           ) : (
//             <>
//               <div
//                 style={{
//                   fontSize: 13.5,
//                   color: theme.sub,
//                   lineHeight: 1.7,
//                   background: theme.bg,
//                   border: `1px solid ${theme.border}`,
//                   borderRadius: 12,
//                   padding: 16,
//                   marginBottom: 18,
//                 }}
//               >
//                 Rider accounts are set up by the Quick Med partner team once
//                 you're onboarded — there's no self-signup here. If you already
//                 have a rider ID, log in below.
//               </div>
//               <button
//                 onClick={() => goTo("login")}
//                 className="qm-btn"
//                 style={{
//                   width: "100%",
//                   background: C.primary,
//                   color: "#fff",
//                   border: "none",
//                   padding: "13px",
//                   borderRadius: 12,
//                   fontWeight: 700,
//                   fontSize: 14.5,
//                   cursor: "pointer",
//                 }}
//               >
//                 Go to rider login
//               </button>
//               <div
//                 style={{
//                   textAlign: "center",
//                   fontSize: 13,
//                   color: theme.sub,
//                   marginTop: 20,
//                 }}
//               >
//                 Want to apply as a rider?{" "}
//                 <a
//                   href="#"
//                   style={{
//                     color: C.primary,
//                     fontWeight: 700,
//                     textDecoration: "none",
//                   }}
//                 >
//                   Contact partner support
//                 </a>
//               </div>
//             </>
//           )}
//         </div>
//       </Reveal>
//     </div>
//   );
// }


/* RegisterPage.jsx
   User registration form, with a role toggle. Customers now register
   against PostgreSQL via /api/customers/register, or instantly via
   Google Sign-In (/api/customers/google-auth) — both return the same
   customer profile shape. Riders are pre-registered partner accounts
   (see riderData.js / the riders table), so choosing "Rider" here
   links out to rider login/contact instead of a real signup form.

   All customer fields (name, email, phone, address, password) are now
   mandatory for manual sign-up — Google sign-up still only provides
   name/email/etc from Google and prompts for the rest later from the
   dashboard's "Complete your registration" notification.
*/
import { useState } from "react";
import { User, Bike } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal } from "../components/Common";
import { AuthIllustration } from "../components/AuthIllustration";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { api } from "../api";

export function RegisterPage({ theme, dark, goTo, onCustomerLogin }) {
  const [role, setRole] = useState("customer"); // "customer" | "rider"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength =
    pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", C.danger, "#F59E0B", C.success][strength];

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !pw
    ) {
      setError("Please fill in all fields to continue.");
      return;
    }
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const profile = await api.registerCustomer({
        name,
        email,
        phone,
        address,
        password: pw,
      });
      onCustomerLogin?.(profile);
      goTo("dashboard");
    } catch (e) {
      setError(e.message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "56px 24px 90px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        alignItems: "center",
      }}
      className="qm-auth-grid"
    >
      <Reveal>
        <AuthIllustration theme={theme} />
      </Reveal>
      <Reveal delay={100}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 36,
            maxWidth: 400,
          }}
        >
          <h2
            className="qm-display"
            style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}
          >
            Create your account
          </h2>
          <p style={{ fontSize: 13.5, color: theme.sub, marginBottom: 20 }}>
            Get medicines delivered in 30 minutes.
          </p>

          {/* Role toggle */}
          <div
            style={{
              display: "flex",
              gap: 8,
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {[
              { key: "customer", label: "Customer", icon: User },
              { key: "rider", label: "Rider", icon: Bike },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setRole(r.key);
                  setError("");
                }}
                className="qm-btn"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "none",
                  cursor: "pointer",
                  padding: "9px 0",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  background: role === r.key ? C.primary : "transparent",
                  color: role === r.key ? "#fff" : theme.sub,
                }}
              >
                <r.icon size={14} /> {r.label}
              </button>
            ))}
          </div>

          {role === "customer" ? (
            <>
              {/* Google Sign-In */}
              <GoogleAuthButton
                dark={dark}
                onSuccess={(profile) => {
                  onCustomerLogin?.(profile);
                  goTo("dashboard");
                }}
                onError={setError}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "18px 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: theme.border }} />
                <span style={{ fontSize: 12, color: theme.sub }}>or</span>
                <div style={{ flex: 1, height: 1, background: theme.border }} />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name *"
                  required
                  style={inputStyle(theme)}
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address *"
                  required
                  style={inputStyle(theme)}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number *"
                  required
                  style={inputStyle(theme)}
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address *"
                  required
                  style={inputStyle(theme)}
                />
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Create password *"
                  required
                  style={inputStyle(theme)}
                />
                {pw.length > 0 && (
                  <div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: theme.border,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${strength * 33.3}%`,
                          background: strengthColor,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: strengthColor,
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      {strengthLabel} password
                    </div>
                  </div>
                )}
                {error && (
                  <div
                    style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}
                  >
                    {error}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="qm-btn"
                  style={{
                    background: C.primary,
                    color: "#fff",
                    border: "none",
                    padding: "13px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: submitting ? "default" : "pointer",
                    marginTop: 8,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Creating account…" : "Create account"}
                </button>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: theme.sub,
                  marginTop: 20,
                }}
              >
                Already have an account?{" "}
                <button
                  onClick={() => goTo("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.primary,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log in
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 13.5,
                  color: theme.sub,
                  lineHeight: 1.7,
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                Rider accounts are set up by the Quick Med partner team once
                you're onboarded — there's no self-signup here. If you already
                have a rider ID, log in below.
              </div>
              <button
                onClick={() => goTo("login")}
                className="qm-btn"
                style={{
                  width: "100%",
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  padding: "13px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                Go to rider login
              </button>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: theme.sub,
                  marginTop: 20,
                }}
              >
                Want to apply as a rider?{" "}
                <a
                  href="#"
                  style={{
                    color: C.primary,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Contact partner support
                </a>
              </div>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}