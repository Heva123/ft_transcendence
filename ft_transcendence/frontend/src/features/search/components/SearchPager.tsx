type Props = {
  page: number
  pages: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export function PageSummary({ page, pages, total, limit }: Omit<Props, 'onChange'>) {
  const first = total ? (page - 1) * limit + 1 : 0
  const last = Math.min(total, page * limit)

  return (
    <p className="search-page-count">
      Page {page} of {pages} · results {first}–{last} of {total}
    </p>
  )
}

function SearchPager({ page, pages, onChange }: Props) {
  if (pages <= 1)
    return null
  return (
    <nav className="search-pagination" aria-label="Search pages">
      <button type="button" disabled={page <= 1}
        onClick={() => onChange(page - 1)}>Previous</button>
      {Array.from({ length: pages }, (_, index) => (
        <button key={index + 1} type="button"
          className={page === index + 1 ? 'active' : ''}
          aria-current={page === index + 1 ? 'page' : undefined}
          onClick={() => onChange(index + 1)}>
          {index + 1}
        </button>
      ))}
      <button type="button" disabled={page >= pages}
        onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  )
}

export default SearchPager
