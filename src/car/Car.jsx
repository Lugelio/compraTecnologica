import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom"; 
import { supabase } from "../database/conexionBase";

import CarElement from "./CarElement";
import useSelectCarItemsProduct from "./carLogic/selectSpecificCarItems";
import useSelectCarItems from "./carLogic/selectCartItems";
import useSelectCarId from "./carLogic/selectUserCar";
import useErraseCartItem from "./carLogic/erraseCarItem";
import useSumAmount from "./carLogic/sumAmount";
import useRestAmount from "./carLogic/restAmount";
import usePurchase from "./carLogic/purchase";

import "./carStyle.css";

function Car() {
    const [userId, setUserId] = useState(null);
    const [userCart, setUserCart] = useState(null);
    const [showProducts, setShowProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const { sum, loading: isSuming } = useSumAmount();
    const { rest, loading: isResting } = useRestAmount();
    const { erraseItem, loading: isDeleting } = useErraseCartItem();
    const { purchase, loading: isBuying } = usePurchase();
    const { selectCarItems } = useSelectCarItems();
    
    const selectCarId = useSelectCarId();
    const selectCarItemsProduct = useSelectCarItemsProduct();

    const dispararToast = useCallback((mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    useEffect(() => {
    const fetchAllData = async () => {
        try {
         
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;
            const uId = session.user.id;
            setUserId(uId);


            const cartId = await selectCarId(uId);
            setUserCart(cartId);

            const items = await selectCarItems(cartId);
            if (!items || items.length === 0) {
                setLoadingData(false);
                return;
            }

            const productIds = items.map(item => item.product_id);


            const { data: productsData, error } = await supabase
                .from('Products') 
                .select('*')
                .in('id', productIds); 

            if (error) throw error;

      
            const detailedProducts = items.map(item => {
                const productInfo = productsData.find(p => p.id === item.product_id);
                return { ...item, product: productInfo };
            });

            setShowProducts(detailedProducts);
        } catch (error) {
            console.error("Error en la carga ultra-rápida:", error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchAllData();
}, []);

   
    const { totalPrecio, totalCantidad } = useMemo(() => {
        return showProducts.reduce((acc, item) => ({
            totalPrecio: acc.totalPrecio + (item.product?.price ?? 0) * item.Amount,
            totalCantidad: acc.totalCantidad + item.Amount
        }), { totalPrecio: 0, totalCantidad: 0 });
    }, [showProducts]);

    const handleSum = async (id, currentAmount, stock) => {
        if (currentAmount >= stock) return dispararToast("Límite de stock alcanzado");

        setShowProducts(prev => prev.map(item => 
            item.id === id ? { ...item, Amount: item.Amount + 1 } : item
        ));

        const success = await sum(id, currentAmount, stock);
        if (!success) {
            setShowProducts(prev => prev.map(item => 
                item.id === id ? { ...item, Amount: item.Amount - 1 } : item
            ));
            dispararToast("Error al guardar en la base de datos");
        }
    };

    const handleRest = async (id, currentAmount) => {
        if (currentAmount > 1) {
            setShowProducts(prev => prev.map(item => 
                item.id === id ? { ...item, Amount: item.Amount - 1 } : item
            ));

            const success = await rest(id, currentAmount);
            if (!success) {
                setShowProducts(prev => prev.map(item => 
                    item.id === id ? { ...item, Amount: item.Amount + 1 } : item
                ));
            }
        } else {
            handleErase(id);
        }
    };

    const handleErase = async (id) => {
        const fueBorrado = await erraseItem(id);
        if (fueBorrado) {
            setShowProducts(prev => prev.filter(item => item.id !== id));
            dispararToast("Producto eliminado");
        }
    };

    const handleBuy = async () => {
        if (showProducts.length === 0) return;
        const success = await purchase(showProducts, userId, totalPrecio);
        
        if (success) {
            try {
                await supabase.from('cart_items').delete().eq('cart_id', userCart);
                dispararToast("¡Compra realizada con éxito!");
                setShowProducts([]);
            } catch (error) {
                dispararToast("Compra registrada, error al vaciar carrito.");
            }
        }
    };

    return (
        <div className="container mt-4 position-relative">
            <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
                <div className={`toast align-items-center text-white bg-dark border-0 ${showToast ? 'show' : 'hide'}`} role="alert">
                    <div className="d-flex">
                        <div className="toast-body fw-bold">{msg}</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className={(showProducts.length > 0 && userId) ? "col-lg-8" : "col-lg-12"}>
                    {loadingData ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Sincronizando carrito...</p>
                        </div>
                    ) : !userId ? (
                        <div className="alert alert-light shadow-sm text-center py-5 border">
                            <h4 className="fw-bold">No has iniciado sesión</h4>
                            <div className="d-flex justify-content-center gap-3 mt-4">
                                <Link to="/login" className="btn btn-primary px-4 shadow-sm">Iniciar Sesión</Link>
                                <Link to="/register" className="btn btn-outline-primary px-4">Registrarse</Link>
                            </div>
                        </div>
                    ) : showProducts.length === 0 ? (
                        <div className="alert alert-light shadow-sm text-center py-5 border">
                            <h4>Tu carrito está vacío</h4>
                            <Link to="/" className="btn btn-primary mt-3">Ver productos</Link>
                        </div>
                    ) : (
                        showProducts.map(item => (
                            <CarElement
                                key={item.id}
                                img={item.product?.img}
                                description={item.product?.prod_name || "Cargando..."}
                                price={(item.product?.price ?? 0) * item.Amount}
                                amount={item.Amount}
                                clickErase={() => handleErase(item.id)} 
                                clickSum={() => handleSum(item.id, item.Amount, item.product?.stock)}
                                clickRest={() => handleRest(item.id, item.Amount)}
                                isPending={isSuming || isResting || isDeleting || isBuying}
                            />
                        ))
                    )}
                </div>

                {!loadingData && userId && showProducts.length > 0 && (
                    <div className="col-lg-4">
                        <aside className="cart-summary shadow-sm p-4 border rounded bg-white">
                            <h5 className="mb-3 fw-bold">Resumen</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Productos:</span>
                                <span>{totalCantidad}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                <span>Total:</span>
                                <span>${totalPrecio.toLocaleString('es-AR')}</span>
                            </div>
                            <button 
                                className="btn btn-primary btn-lg w-100 shadow-sm" 
                                onClick={handleBuy}
                                disabled={isSuming || isResting || isDeleting || isBuying}
                            >
                                {isBuying ? "Procesando..." : "Finalizar Compra"}
                            </button>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Car;