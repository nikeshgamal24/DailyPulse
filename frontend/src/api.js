const BASE_URL = 'http://localhost:8000'
const REQUEST_TIMEOUT_MS = 35000

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw new Error('Could not reach the server. Is it running?')
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

export const getBriefing = () => request('/briefing')

export const getTasks = () => request('/tasks')

/** @param {string} title */
export const addTask = (title) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ title }) })

/** @param {string} id */
export const completeTask = (id) =>
  request(`/tasks/${id}/complete`, { method: 'PUT' })

/** @param {string} id */
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })

export const getStandup = () => request('/standup')

export const getInsights = () => request('/insights')
