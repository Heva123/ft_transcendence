import SearchEmptyState from './SearchEmptyState'

type Props = {
  query: string
}

function SkillResults({ query }: Props) {
  return (
    <SearchEmptyState
      query={query}
      onClear={() => window.location.assign('/search')}
    />
  )
}

export default SkillResults
