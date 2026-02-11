import "./filterButton.css"

function FilterButton({ category, click }) {
    return (
        <>
            
            <button className="filter_button btn btn-dark btn-outline-secondary text-light" onClick={() => click(category)}>
                {category}
            </button>
        </>
    )
}

export default FilterButton