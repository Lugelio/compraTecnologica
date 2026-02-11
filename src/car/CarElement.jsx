function CarElement({img, description, price, amount, clickErase, clickSum, clickRest, isPending}) {
    return(
        <article className="car-card_container">
            <section className="card-img_container">
                <img src={img} alt={description} />
            </section>
            <section className="card_body">
                <article className="card_body-text">{description}</article>
                <article className="card_body-amount">
                    <button onClick={clickErase} disabled={isPending}>quitar</button>
                    <button onClick={clickRest} disabled={isPending}>-</button>
                    <span>{amount}</span>
                    <button onClick={clickSum} disabled={isPending}>+</button>
                </article>
            </section>
            <section className="card_price">
                <article>$ {price?.toLocaleString()}</article>
            </section>
        </article>
    )
}
export default CarElement;