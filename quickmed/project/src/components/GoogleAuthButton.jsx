/* GoogleAuthButton.jsx
   Renders Google's official sign-in button. On success, sends the ID
   token to our backend, which verifies with Google that it's a real,
   currently valid account, then returns the matching (or new) customer.

   initialize() is only called once (guarded by initializedRef) since
   calling it repeatedly — e.g. on every re-render from React StrictMode's
   double-invoke in dev, or when `dark` changes — triggers Google's
   "initialize() is called multiple times" warning and can cause the
   rendered button to stop responding.
*/
import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config";
import { api } from "../api";

export function GoogleAuthButton({ onSuccess, onError, dark }) {
  const btnRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google sign-in disabled.");
      return;
    }

    async function handleCredentialResponse(response) {
      try {
        const profile = await api.googleAuth(response.credential);
        onSuccess?.(profile);
      } catch (e) {
        onError?.(e.message || "Google sign-in failed. Please try again.");
      }
    }

    function renderButton() {
      if (!window.google || !btnRef.current) return;
      if (!initializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        initializedRef.current = true;
      }
      // Clear any previously-rendered button before re-rendering (e.g. on
      // theme change) so we don't stack duplicate iframes in the same node.
      btnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(btnRef.current, {
        type: "standard",
        theme: dark ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        width: 340,
      });
    }

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          renderButton();
        }
      }, 200);
      return () => clearInterval(t);
    }
  }, [dark]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={btnRef} style={{ display: "flex", justifyContent: "center", margin: "4px 0" }} />;
}