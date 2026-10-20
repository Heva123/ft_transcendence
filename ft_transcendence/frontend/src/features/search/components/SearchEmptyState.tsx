type Props = {
  query: string
  onClear: () => void
}

function SearchEmptyState({ query, onClear }: Props) {
  return (
    <section className="search-empty">
      <h2>No matches, yet.</h2>
      <p className="search-empty__subtitle">
        A clear next step, even when things don’t go to plan.
      </p>
      <strong>No results for “{query}”.</strong>
      <p>Try a different name, skill, or community.</p>
      <button type="button" onClick={onClear}>Clear search</button>
    </section>
  )
}

export default SearchEmptyState
