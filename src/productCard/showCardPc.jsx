import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/conexionBase";
import useCreate from "../database/adminBase/CRUD/create";
import useProducts from "../database/productsTable";
import ProductCard from "./productCard";
import useSelectCarId from "../car/carLogic/selectUserCar";
import useUserSession from "../database/adminBase/userSession";
import "./productCard.css";

function ShowCardPC() {
    const navigate = useNavigate();
    const { userId, loading: authLoading } = useUserSession();
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const products = useProducts(1);
    const selectCarUserId = useSelectCarId();

    const [carId, setCarId] = useState(null);

    // --- ESTADOS PARA EL TOAST PERSISTENTE ---
    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const dispararToast = (mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
    };

    useEffect(() => {
        const obtenerCarrito = async () => {
            if (userId) {
                try {
                    const carritoId = await selectCarUserId(userId);
                    setCarId(carritoId);
                } catch (err) {
                    console.error("No se pudo obtener el carrito", err);
                }
            } else {
                setCarId(null);
            }
        };
        obtenerCarrito();
    }, [userId, selectCarUserId]);

    const handleClick = async (product) => {
        if (!userId) {
            dispararToast("Necesitas iniciar sesión para comprar.");
            return;
        }

        if (!carId) {
            dispararToast("Cargando carrito... intenta en unos segundos.");
            return;
        }

        await ejecutarInsercion(
            {
                cart_id: carId,
                product_id: product.id,
                Amount: 1,
                state: "on",
                price_at_addition: product.price
            },
            "cart_items"
        );

        dispararToast(`${product.prod_name} agregado al carrito`);
    };

    const irAlDetalle = (id) => {
        navigate(`/producto/${id}`);
    };

    if (authLoading || !products || products.length === 0) {
        return <p className="container mt-3">Cargando productos...</p>;
    }

    return (
        <div className="container mt-3 position-relative">

            {/* --- TOAST BLANCO Y NEGRO (ENCIMA DE DESTACADOS) --- */}
            <div className="toast-container position-absolute top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
                <div className={`toast align-items-center text-dark bg-white border shadow ${showToast ? 'show' : 'hide'}`} role="alert">
                    <div className="d-flex">
                        <div className="toast-body fw-bold">
                            {msg}
                        </div>
                        <button
                            type="button"
                            className="btn-close me-2 m-auto"
                            onClick={() => setShowToast(false)}
                        ></button>
                    </div>
                </div>
            </div>

            <h1 className="text-center mt-5 mb-5">Productos destacados</h1>

            {insertando && (
                <div className="spinner-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="spinner-border text-primary" role="status"></div>
                    <span className="ms-2 fw-bold">Procesando...</span>
                </div>
            )}

            <div className="row g-3">
                {products.map((product) => (
                    <div
                        // CAMBIO AQUÍ: Agregamos col-12 para que en móvil ocupe todo el ancho
                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                        key={product.id}
                        onClick={() => irAlDetalle(product.id)}
                        style={{ cursor: "pointer" }}
                    >
                        <ProductCard
                            productName={product.prod_name}
                            img={product.img}
                            description={product.description}
                            price={product.price}
                            buttonText="comprar"
                            click={(e) => {
                                e.stopPropagation();
                                handleClick(product);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShowCardPC;