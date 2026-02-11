import "./productCard.css"

function ProductCard({productName, img, description, price, buttonText, click}) {
    return (
        <div className="card h-100"> {/* h-100 asegura que todas midan lo mismo en la fila */}
            <img className="card-img-top" src={img} alt={productName} />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{productName}</h5>
                <h6 className="card-subtitle mb-2 text-muted">${price}</h6>
                
                <div className="card-text">
                    {description}
                </div>
                
                {/* mt-auto empuja el botón siempre al fondo de la card */}
                <button className="btn btn-primary mt-auto" onClick={click}>
                    {buttonText}
                </button>
            </div>
        </div>
    )
}

export default ProductCard;