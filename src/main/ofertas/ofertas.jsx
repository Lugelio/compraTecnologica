import "./ofertas.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OfertasCard from "./ofertasCard";
import useGetProductosOferta from "./getProductosOferta";

// Hooks de Lógica
import useCreate from "../../database/adminBase/CRUD/create";
import useSelectCarId from "../../car/carLogic/selectUserCar";
import useUserSession from "../../database/adminBase/userSession";

function Ofertas() {
    const navigate = useNavigate();
    
    // 1. Hooks de datos y sesión
    const { offerProducts, loading: loadingProductos } = useGetProductosOferta();
    const { userId, loading: authLoading } = useUserSession();
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const selectCarUserId = useSelectCarId();

    const [carId, setCarId] = useState(null);

    // 2. Obtener el carrito del usuario
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

    // 3. Lógica de "Comprar"
    const handleComprar = async (producto) => {
        if (!userId) {
            alert("Inicia sesión para aprovechar esta oferta.");
            return;
        }

        if (!carId) {
            alert("Cargando tu carrito...");
            return;
        }

        await ejecutarInsercion(
            {
                cart_id: carId,
                product_id: producto.id,
                Amount: 1,
                state: "on",
                // AQUÍ: Usamos el precio de oferta
                price_at_addition: producto.offer_final_price 
            },
            "cart_items"
        );

        alert(`${producto.prod_name} agregado con descuento!`);
    };

    const irAlDetalle = (id) => {
        navigate(`/producto/${id}`);
    };

    return (
        <div className="ofertas_container">
            {insertando && <div className="spinner-overlay">Agregando oferta...</div>}
            
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
                                // Pasamos la función de compra al botón de la card
                                click={(e) => {
                                    e.stopPropagation(); // Importante para no ir al detalle
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