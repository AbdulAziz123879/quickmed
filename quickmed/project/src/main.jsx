import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import "./styles/index.css";

import App from './App.jsx'
import AdminApp from './AdminApp.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

const isAdminRoute = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
)