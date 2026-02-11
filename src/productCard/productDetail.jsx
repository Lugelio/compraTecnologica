import { useParams, useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import useProducts from "../database/productsTable";
import useCreate from "../database/adminBase/CRUD/create";
import useSelectCarId from "../car/carLogic/selectUserCar";
import useUserSession from "../database/adminBase/userSession";
import "./productCard.css";

function ProductDetail() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // --- LÓGICA DE DATOS Y SESIÓN ---
    const { userId, loading: authLoading } = useUserSession(); 
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const products = useProducts(1); 
    const selectCarUserId = useSelectCarId();

    const [carId, setCarId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const product = products?.find((p) => p.id == id);

    const dispararToast = (mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
    };

    // --- OBTENER EL CARRITO AL CARGAR ---
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

    // --- LÓGICA DE AGREGAR AL CARRITO ---
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

    if (authLoading || !products || products.length === 0) {
        return <div className="container mt-5">Cargando información del producto...</div>;
    }

    if (!product) {
        return (
            <div className="container mt-5 text-center">
                <h2>El producto no existe</h2>
                <button className="btn btn-primary" onClick={() => navigate("/")}>Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="product-detail-wrapper position-relative">
            
            {/* --- TOAST DE NOTIFICACIÓN --- */}
            <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
                <div className={`toast align-items-center text-dark bg-white border shadow ${showToast ? 'show' : 'hide'}`} role="alert">
                    <div className="d-flex">
                        <div className="toast-body fw-bold">{msg}</div>
                        <button type="button" className="btn-close me-2 m-auto" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            </div>

            {/* --- SPINNER DE CARGA --- */}
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

            <div className="container">
                <button className="back-link" onClick={() => navigate("/")}>
                    ← VOLVER AL LISTADO
                </button>

                <div className="main-content">
                    <div className="image-section">
                        <img src={product.img} alt={product.prod_name} />
                    </div>

                    <div className="info-section">
                        <span className="brand-tag">NUEVO | DISPONIBLE</span>
                        <h1>{product.prod_name}</h1>
                        <p style={{color: '#999', fontSize: '0.8rem'}}>ID PRODUCTO: {product.id}</p>
                        
                        <div className="price-container">
                            <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>Precio de lista:</p>
                            <h2 className="main-price">
                                ${new Intl.NumberFormat('es-AR').format(product.price)}
                            </h2>
                            <p style={{margin: 0, fontSize: '0.8rem', color: '#28a745'}}>IVA incluido</p>
                        </div>

                        <div className="description-section" style={{marginBottom: '20px'}}>
                            <h5 style={{marginBottom: '10px'}}>Características:</h5>
                            <p style={{lineHeight: '1.5', color: '#444'}}>{product.description}</p>
                        </div>

                        {/* Botón con la lógica de handleClick */}
                        <button className="buy-button" onClick={() => handleClick(product)}>
                            {insertando ? "AGREGANDO..." : "AGREGAR AL CARRITO"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;