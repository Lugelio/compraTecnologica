import FilterButton from "./filterButton";
import { useState, useEffect } from "react";
import useFiltrarBase from "./filterBase";
import ProductCard from "../../productCard/productCard";
import useCreate from "../../database/adminBase/CRUD/create";
import useUserSession from "../../database/adminBase/userSession";
import useSelectCarId from "../../car/carLogic/selectUserCar";
import { useNavigate } from "react-router-dom";

function FilterCards() {
    const navigate = useNavigate();
    const [catSel, setCat] = useState("computadora");

    // Estados para el Toast persistente
    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const { userId } = useUserSession();
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const selectCarUserId = useSelectCarId();
    
    const [carId, setCarId] = useState(null);
    const [datosBase, categoryBase] = useFiltrarBase(catSel);

    // Función para mostrar el mensaje sin tiempo de cierre
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
                    console.error("Error al obtener carrito", err);
                }
            }
        };
        obtenerCarrito();
    }, [userId, selectCarUserId]);

    const elegirCategoria = (categoria) => {
        setCat(categoria);
    };

    const handleCompra = async (product) => {
        if (!userId) {
            dispararToast("Inicia sesión para comprar");
            return;
        }
        if (!carId) {
            dispararToast("Cargando carrito...");
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

    return (
        <div className="container mt-3 position-relative">
            
            {/* Toast Local Blanco y Negro justo encima de las categorías */}
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

            <h1 className="text-center mt-5 mb-5">Fijate nuestras categorias!</h1>
            
            {insertando && (
                <div className="spinner-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="spinner-border text-primary" role="status"></div>
                    <span className="ms-2 fw-bold">Agregando al carrito...</span>
                </div>
            )}

            <h1>{catSel}</h1>

            <div className="d-flex gap-2 mb-3 justify-content-center">
                {categoryBase.map((category) => (
                    <FilterButton
                        key={category}
                        category={category}
                        click={elegirCategoria}
                    />
                ))}
            </div>

            <div className="row">
                {datosBase.map((dato) => (
                    <div 
                        className="col-sm" 
                        key={dato.id}
                        onClick={() => irAlDetalle(dato.id)}
                        style={{ cursor: "pointer" }}
                    >
                        <ProductCard
                            productName={dato.prod_name}
                            img={dato.img} 
                            description={dato.description}
                            price={dato.price}
                            buttonText="comprar"
                            click={(e) => {
                                e.stopPropagation();
                                handleCompra(dato);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FilterCards;