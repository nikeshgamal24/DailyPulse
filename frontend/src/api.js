const BASE_URL = 'http://localhost:8000'

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
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
