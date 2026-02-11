import "./ofertas.css"

function OfertasCard({ price, oferta_price, name, description,click }) {
    return (
        <div className="oferta_card">
            {/* Placeholder de imagen */}
            <div className="oferta_img"></div>

            <div className="oferta_info">
                <h4>{name}</h4>
                <p className="oferta_description">{description}</p>
            </div>

            <div className="prices_container">
                <span className="price_old">${price}</span>
                <span className="price_current">${oferta_price}</span>
            </div>
            <button className="oferta_btn" onClick={click}>
                Comprar
            </button>
        </div>
    )
}

export default OfertasCard;