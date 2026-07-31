/* theme.js
   Design tokens (colors) and small style helpers shared across every page.
*/

export const C = {
  primary: "#2563EB",
  secondary: "#10B981",
  accent: "#06B6D4",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  danger: "#EF4444",
  success: "#22C55E",
};

/* inputStyle: shared inline style object for text inputs, themed by light/dark mode */
export const inputStyle = (theme) => ({
  width: "100%",
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 13.5,
  outline: "none",
  background: "transparent",
  color: theme.text,
  boxSizing: "border-box",
});
