import React, { useState, useEffect } from 'react'
import { customersAPI } from '../services/api'
import './Customers.css'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customersAPI.getAll()
      setCustomers(data)
    } catch (err) {
      setError('Failed to load customers')
      // Mock data for demonstration
      setCustomers([
        { id: 1, name: 'John Doe', phone: '+255 712 345 678', points: 1250 },
        { id: 2, name: 'Jane Smith', phone: '+255 713 456 789', points: 890 },
        { id: 3, name: 'Ahmed Hassan', phone: '+255 714 567 890', points: 2100 },
        { id: 4, name: 'Fatuma Juma', phone: '+255 715 678 901', points: 450 },
        { id: 5, name: 'Michael Johnson', phone: '+255 716 789 012', points: 3200 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading customers...</div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className="points-badge">{customer.points.toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Customers

