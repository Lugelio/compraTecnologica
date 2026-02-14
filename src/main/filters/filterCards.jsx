import FilterButton from "./filterButton";
import { useState, useEffect } from "react";
import useFiltrarBase from "./filterBase";
import ProductCard from "../../productCard/productCard";
import useCreate from "../../database/adminBase/CRUD/create";
import useUserSession from "../../database/adminBase/userSession";
import useSelectCarId from "../../car/carLogic/selectUserCar";
import useSelectCarItems from "../../car/carLogic/selectCartItems";
import useSumAmount from "../../car/carLogic/sumAmount";
import { useNavigate } from "react-router-dom";

function FilterCards() {
    const navigate = useNavigate();
    const [catSel, setCat] = useState("computadora");

    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const { userId } = useUserSession();
    const { ejecutarInsercion, loading: insertando } = useCreate();
    const { selectCarItems, loading: loadingCarItems } = useSelectCarItems();
    const { sum } = useSumAmount();
    const selectCarUserId = useSelectCarId();
    
    const [carId, setCarId] = useState(null);
    const [datosBase, categoryBase] = useFiltrarBase(catSel);

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

        // Lógica de Upsert
        const carItems = await selectCarItems(carId);
        const itemExistente = carItems?.find(item => item.product_id === product.id);

        if (itemExistente) {
            await sum(itemExistente.id, itemExistente.Amount, product.stock);
            dispararToast(`Añadiste otro ${product.prod_name}`);
        } else {
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
        }
    };

    const irAlDetalle = (id) => {
        navigate(`/producto/${id}`);
    };

    return (
        <div className="container mt-3 position-relative">
            <div className="toast-container position-absolute top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
                <div className={`toast align-items-center text-dark bg-white border shadow ${showToast ? 'show' : 'hide'}`} role="alert">
                    <div className="d-flex">
                        <div className="toast-body fw-bold">{msg}</div>
                        <button type="button" className="btn-close me-2 m-auto" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            </div>

            <h1 className="text-center mt-5 mb-5 fw-bold text-uppercase">Explorá nuestras categorías</h1>
            
            {(insertando || loadingCarItems) && (
                <div className="spinner-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="spinner-border text-primary" role="status"></div>
                    <span className="ms-2 fw-bold">Actualizando carrito...</span>
                </div>
            )}

            <div className="d-flex gap-2 mb-3 justify-content-center flex-wrap">
                {categoryBase.map((category) => (
                    <FilterButton
                        key={category}
                        category={category}
                        click={elegirCategoria}
                        active={catSel === category} // Podrías usar esto para resaltar el botón activo
                    />
                ))}
            </div>

            <div className="row g-4 mt-4">
                {datosBase.map((dato) => (
                    <div 
                        className="col-12 col-sm-6 col-md-4 col-lg-3" 
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