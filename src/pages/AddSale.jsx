import React, { useState, useEffect } from 'react'
import { customersAPI, salesAPI } from '../services/api'
import './AddSale.css'

function AddSale() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await customersAPI.getAll()
      setCustomers(data)
    } catch (err) {
      // Mock data for demonstration
      setCustomers([
        { id: 1, name: 'John Doe', phone: '+255 712 345 678', points: 1250 },
        { id: 2, name: 'Jane Smith', phone: '+255 713 456 789', points: 890 },
        { id: 3, name: 'Ahmed Hassan', phone: '+255 714 567 890', points: 2100 },
        { id: 4, name: 'Fatuma Juma', phone: '+255 715 678 901', points: 450 },
        { id: 5, name: 'Michael Johnson', phone: '+255 716 789 012', points: 3200 },
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCustomer) {
      setError('Please select a customer')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      await salesAPI.create(selectedCustomer, parseFloat(amount))
      setSuccess(`Sale of TSh ${parseFloat(amount).toLocaleString()} recorded successfully!`)
      setAmount('')
      setSelectedCustomer('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-sale-page">
      <h1 className="page-title">Add Sale</h1>

      <div className="sale-form-container">
        <form onSubmit={handleSubmit} className="sale-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone} (Points: {customer.points.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sale Amount (TSh)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter sale amount"
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Recording Sale...' : 'Record Sale'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddSale

