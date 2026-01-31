import React, { useState, useEffect } from 'react'
import { smsAPI } from '../services/api'
import './SendSMS.css'

function SendSMS() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await smsAPI.getGroups()
      setGroups(data)
    } catch (err) {
      // Mock data for demonstration
      setGroups([
        { id: 1, name: 'VIP Customers', description: 'Customers with 2000+ points' },
        { id: 2, name: 'Regular Customers', description: 'All active customers' },
        { id: 3, name: 'New Customers', description: 'Customers joined this month' },
        { id: 4, name: 'High Spenders', description: 'Top 20% by purchase amount' },
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedGroup) {
      setError('Please select a group')
      return
    }

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setLoading(true)

    try {
      await smsAPI.send(selectedGroup, message)
      setSuccess('SMS sent successfully to the selected group!')
      setMessage('')
      setSelectedGroup('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send SMS. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="send-sms-page">
      <h1 className="page-title">Send SMS</h1>

      <div className="sms-form-container">
        <form onSubmit={handleSubmit} className="sms-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Select Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Promo Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your promotional message here..."
              className="form-textarea"
              rows="6"
              required
            />
            <div className="char-count">{message.length} characters</div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Sending SMS...' : '📱 Send SMS'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SendSMS

