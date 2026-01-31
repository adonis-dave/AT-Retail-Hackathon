import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ onLogout }) {
  const location = useLocation()

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>🛍️ Smart Retail</h2>
        </div>
        <ul className="nav-menu">
          <li>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/customers" className={location.pathname === '/customers' ? 'active' : ''}>
              👥 Customers
            </Link>
          </li>
          <li>
            <Link to="/add-sale" className={location.pathname === '/add-sale' ? 'active' : ''}>
              💰 Add Sale
            </Link>
          </li>
          <li>
            <Link to="/send-sms" className={location.pathname === '/send-sms' ? 'active' : ''}>
              📱 Send SMS
            </Link>
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

