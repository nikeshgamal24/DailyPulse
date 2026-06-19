import StandupCard from './StandupCard'
import InsightsCard from './InsightsCard'

/**
 * @param {object} props
 * @param {number} props.completedCount
 * @param {number} props.totalCount
 */
function RightPanel({ completedCount, totalCount }) {
  return (
    <section className="flex flex-col gap-5">
      <StandupCard completedCount={completedCount} />
      <InsightsCard totalCount={totalCount} />
    </section>
  )
}

export default RightPanel
