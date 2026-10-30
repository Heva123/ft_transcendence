type Props = {
  query: string
  onClear: () => void
}

function SearchEmptyState({ query, onClear }: Props) {
  return (
    <section className="search-empty max-w-[620px] p-6">
      <h2 className="m-0 mb-2 font-heading text-[32px]">No matches, yet.</h2>
      <p className="mb-6">
        A clear next step, even when things don’t go to plan.
      </p>
      <strong className="mb-2 block">No results for “{query}”.</strong>
      <p>Try a different name, skill, or community.</p>
      <button type="button" onClick={onClear}
        className="mt-3 min-h-11 border border-ink bg-plum px-4 text-white">
        Clear search
      </button>
    </section>
  )
}

export default SearchEmptyState
