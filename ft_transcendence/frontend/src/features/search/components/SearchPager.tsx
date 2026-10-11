type Props = {
  page: number
  pages: number
  onChange: (page: number) => void
}

function SearchPager({ page, pages, onChange }: Props) {
  return (
    <div className="search-pagination">
      <button disabled={page === 1}
        onClick={() => onChange(page - 1)}>Previous</button>
      {Array.from({ length: pages }, (_, index) => (
        <button key={index + 1}
          className={page === index + 1 ? 'active' : ''}
          onClick={() => onChange(index + 1)}>
          {index + 1}
        </button>
      ))}
      <button disabled={page === pages}
        onClick={() => onChange(page + 1)}>Next</button>
    </div>
  )
}

export default SearchPager
