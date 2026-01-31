import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },
}

// Dashboard endpoints
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
}

// Customers endpoints
export const customersAPI = {
  getAll: async () => {
    const response = await api.get('/customers')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },
}

// Sales endpoints
export const salesAPI = {
  create: async (customerId, amount) => {
    const response = await api.post('/sales', { customerId, amount })
    return response.data
  },
}

// SMS endpoints
export const smsAPI = {
  send: async (groupId, message) => {
    const response = await api.post('/sms/send', { groupId, message })
    return response.data
  },
  getGroups: async () => {
    const response = await api.get('/sms/groups')
    return response.data
  },
}

export default api

