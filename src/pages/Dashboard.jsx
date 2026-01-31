import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todaySales: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await dashboardAPI.getStats()
      setStats(data)
    } catch (err) {
      setError('Failed to load dashboard data')
      // Mock data for demonstration
      setStats({
        totalCustomers: 1250,
        todaySales: 45000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{loading ? '...' : stats.totalCustomers.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Today's Sales</h3>
            <p className="stat-value">
              {loading ? '...' : `TSh ${stats.todaySales.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h2>Welcome to Smart Retail System! 🎉</h2>
        <p>Manage your customers, track sales, and send promotional messages all in one place.</p>
      </div>
    </div>
  )
}

export default Dashboard

