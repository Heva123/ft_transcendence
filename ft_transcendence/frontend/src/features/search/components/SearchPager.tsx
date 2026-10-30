// Tailwind classes shared by every page button.
const PAGE_BUTTON = 'min-h-10 min-w-10 border border-ink px-2 disabled:opacity-40'

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
    <p className="search-page-count mb-4 mt-0 text-right text-xs">
      Page {page} of {pages} · results {first}–{last} of {total}
    </p>
  )
}

function SearchPager({ page, pages, onChange }: Props) {
  if (pages <= 1)
    return null
  return (
    <nav className="search-pagination mt-6 flex justify-center gap-2" aria-label="Search pages">
      <button type="button" disabled={page <= 1} className={`${PAGE_BUTTON} bg-surface`}
        onClick={() => onChange(page - 1)}>Previous</button>
      {Array.from({ length: pages }, (_, index) => (
        <button key={index + 1} type="button"
          className={`${PAGE_BUTTON} ${page === index + 1 ? 'active bg-pink font-bold' : 'bg-surface'}`}
          aria-current={page === index + 1 ? 'page' : undefined}
          onClick={() => onChange(index + 1)}>
          {index + 1}
        </button>
      ))}
      <button type="button" disabled={page >= pages} className={`${PAGE_BUTTON} bg-surface`}
        onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  )
}

export default SearchPager
