


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import "./styles/index.css";

import App from './App.jsx'
import AdminApp from './AdminApp.jsx'
import StoreApp from './StoreApp.jsx'



const path = window.location.pathname
const isAdminRoute = path.startsWith('/admin')
const isStoreRoute = path.startsWith('/store')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : isStoreRoute ? <StoreApp /> : <App />}
  </StrictMode>,
)