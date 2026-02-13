import "./productCard.css"

function ProductCard({productName, img, description, price, buttonText, click}) {
    return (
        <div className="card"> 
            <div className="card-img-container">
                <img className="card-img-top" src={img} alt={productName} />
            </div>
            <div className="card-body">
                <h5 className="card-title" title={productName}>{productName}</h5>
                <h6 className="card-subtitle">${price}</h6>
                
                <div className="card-text">
                    {description}
                </div>
                
                <button className="buy-button-card" onClick={click}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export default ProductCard;