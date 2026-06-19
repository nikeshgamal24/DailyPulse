import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import BriefingCard from './components/BriefingCard'
import TaskManager from './components/TaskManager'
import RightPanel from './components/RightPanel'
import { addTask, completeTask, getBriefing, getTasks } from './api'

function App() {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)

  const [briefing, setBriefing] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(true)
  const [briefingError, setBriefingError] = useState(null)

  // Mount-time fetch, following React's documented Effect data-fetching
  // pattern: a named async function declared inside the effect, guarded by
  // an `ignore` flag set on cleanup to avoid race conditions.
  useEffect(() => {
    let ignore = false

    async function loadTasksOnMount() {
      try {
        const data = await getTasks()
        if (!ignore) setTasks(data)
      } catch (err) {
        if (!ignore) setTasksError(err.message)
      } finally {
        if (!ignore) setTasksLoading(false)
      }
    }

    loadTasksOnMount()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadBriefingOnMount() {
      try {
        const data = await getBriefing()
        if (!ignore) setBriefing(data)
      } catch (err) {
        if (!ignore) setBriefingError(err.message)
      } finally {
        if (!ignore) setBriefingLoading(false)
      }
    }

    loadBriefingOnMount()
    return () => {
      ignore = true
    }
  }, [])

  // Manual refresh/retry, triggered from event handlers (not an effect).
  const loadTasks = useCallback(() => {
    setTasksLoading(true)
    setTasksError(null)
    getTasks()
      .then(setTasks)
      .catch((err) => setTasksError(err.message))
      .finally(() => setTasksLoading(false))
  }, [])

  const loadBriefing = useCallback(() => {
    setBriefingLoading(true)
    setBriefingError(null)
    getBriefing()
      .then(setBriefing)
      .catch((err) => setBriefingError(err.message))
      .finally(() => setBriefingLoading(false))
  }, [])

  const handleAddTask = async (title) => {
    const task = await addTask(title)
    setTasks((prev) => [...prev, task])
  }

  const handleCompleteTask = async (id) => {
    const updated = await completeTask(id)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const inProgress = tasks.filter((t) => !t.completed)
  const completedToday = tasks.filter((t) => t.completed)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Header onRefreshBriefing={loadBriefing} refreshing={briefingLoading} />
        <BriefingCard
          briefing={briefing}
          loading={briefingLoading}
          error={briefingError}
          onRetry={loadBriefing}
        />
        <div className="mt-6 grid grid-cols-1 gap-6 pb-10 lg:grid-cols-[3fr_2fr]">
          <TaskManager
            inProgress={inProgress}
            completedToday={completedToday}
            loading={tasksLoading}
            error={tasksError}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onRetry={loadTasks}
          />
          <RightPanel completedCount={completedToday.length} totalCount={tasks.length} />
        </div>
      </div>
    </div>
  )
}

export default App
