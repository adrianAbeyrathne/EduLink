import axios from 'axios'

// Base API URL - replace with your actual backend URL
const API_URL = 'http://localhost:5000/api'

// CRUD service creator
export const createCrudService = (endpoint) => {
  // Create a new entity
  const create = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/${endpoint}`, data)
      return response.data
    } catch (error) {
      console.error(`Error creating ${endpoint}:`, error)
      throw error
    }
  }

  // Get all entities
  const getAll = async () => {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  // Get entity by ID
  const getById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${endpoint} with id ${id}:`, error)
      throw error
    }
  }

  // Update entity
  const update = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${endpoint}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating ${endpoint} with id ${id}:`, error)
      throw error
    }
  }

  // Delete entity
  const remove = async (id) => {
    try {
      await axios.delete(`${API_URL}/${endpoint}/${id}`)
    } catch (error) {
      console.error(`Error deleting ${endpoint} with id ${id}:`, error)
      throw error
    }
  }

  return {
    create,
    getAll,
    getById,
    update,
    remove,
  }
}

// Example usage:
// Create services for different entities
export const userService = createCrudService('users')
export const sessionService = createCrudService('sessions')

/* Example of how to use these services in components:

import { sessionService } from '../utils/crud'
// Inside a component:
const [sessions, setSessions] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  const fetchSessions = async () => {
    try {
      const data = await sessionService.getAll()
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchSessions()
}, [])

// To create a new session:
const handleCreateSession = async (sessionData) => {
  try {
    const newSession = await sessionService.create(sessionData)
    setSessions([...sessions, newSession])
  } catch (error) {
    console.error('Error creating session:', error)
  }
}

*/
