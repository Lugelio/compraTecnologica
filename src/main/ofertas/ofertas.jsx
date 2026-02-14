import "./ofertas.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OfertasCard from "./ofertasCard";
import useGetProductosOferta from "./getProductosOferta";

// Hooks de Lógica
import useCreate from "../../database/adminBase/CRUD/create";
import useSelectCarId from "../../car/carLogic/selectUserCar";
import useUserSession from "../../database/adminBase/userSession";
import useSelectCarItems from "../../car/carLogic/selectCartItems";
import useSumAmount from "../../car/carLogic/sumAmount";

function Ofertas() {
    const navigate = useNavigate();
    
    const { offerProducts, loading: loadingProductos } = useGetProductosOferta();
    const { userId, loading: authLoading } = useUserSession();
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const { selectCarItems, loading: loadingCarItems } = useSelectCarItems();
    const { sum } = useSumAmount();
    const selectCarUserId = useSelectCarId();

    const [carId, setCarId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const dispararToast = (mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    useEffect(() => {
        const obtenerCarrito = async () => {
            if (userId) {
                try {
                    const carritoId = await selectCarUserId(userId);
                    setCarId(carritoId);
                } catch (err) {
                    console.error("Error al obtener carrito", err);
                }
            }
        };
        obtenerCarrito();
    }, [userId, selectCarUserId]);

    const handleComprar = async (producto) => {
        if (!userId) {
            dispararToast("Inicia sesión para aprovechar esta oferta.");
            return;
        }

        if (!carId) {
            dispararToast("Cargando tu carrito...");
            return;
        }

        // Lógica de Upsert
        const carItems = await selectCarItems(carId);
        const itemExistente = carItems?.find(item => item.product_id === producto.id);

        if (itemExistente) {
            // Si ya está, sumamos (el precio ya quedó fijado en la primera inserción)
            await sum(itemExistente.id, itemExistente.Amount, producto.stock);
            dispararToast(`Añadiste otro ${producto.prod_name} a tu carrito`);
        } else {
            // Si no está, insertamos con el precio de OFERTA
            await ejecutarInsercion(
                {
                    cart_id: carId,
                    product_id: producto.id,
                    Amount: 1,
                    state: "on",
                    price_at_addition: producto.offer_final_price 
                },
                "cart_items"
            );
            dispararToast(`${producto.prod_name} agregado con descuento!`);
        }
    };

    const irAlDetalle = (id) => {
        navigate(`/producto/${id}`);
    };

    return (
        <div className="ofertas_container position-relative">
            {/* Agregamos el Toast aquí también para consistencia visual */}
            <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
                <div className={`toast align-items-center text-white bg-dark border-0 ${showToast ? 'show' : 'hide'}`} role="alert">
                    <div className="d-flex">
                        <div className="toast-body fw-bold">{msg}</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            </div>

            {(insertando || loadingCarItems) && (
                <div className="spinner-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="spinner-border text-danger" role="status"></div>
                    <span className="ms-2 fw-bold text-danger">¡Aplicando descuento...!</span>
                </div>
            )}
            
            <h1 className="ofertas_title">Ofertas Especiales</h1>
            
            <section className="ofertas_box">
                {loadingProductos || authLoading ? (
                    <p>Cargando ofertas...</p>
                ) : offerProducts && offerProducts.length > 0 ? (
                    offerProducts.map((producto) => (
                        <div 
                            key={producto.id} 
                            onClick={() => irAlDetalle(producto.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <OfertasCard
                                name={producto.prod_name}
                                price={producto.price}
                                oferta_price={producto.offer_final_price}
                                description={producto.description}
                                click={(e) => {
                                    e.stopPropagation();
                                    handleComprar(producto);
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <p>No hay ofertas disponibles</p>
                )}
            </section>
        </div>
    );
}

export default Ofertas;