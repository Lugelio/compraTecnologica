import { useState, useEffect } from "react";
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
    const [userProductCart, setUserProductsCart] = useState([]);
    const [showProducts, setShowProducts] = useState([]);
    
    // Estado local para controlar el flujo de procesamiento de datos
    const [loadingData, setLoadingData] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const { sum, loading: isSuming } = useSumAmount();
    const { rest, loading: isResting } = useRestAmount();
    const { erraseItem, loading: isDeleting } = useErraseCartItem();
    const { purchase, loading: isBuying } = usePurchase();
    
    // Desestructuramos el loading del hook como propusiste
    const { selectCarItems, loading: isLoadingItems } = useSelectCarItems();
    
    const selectCarId = useSelectCarId();
    const selectCarItemsProduct = useSelectCarItemsProduct();

    // Variable auxiliar para decidir si mostrar el spinner
    const isActuallyLoading = loadingData || isLoadingItems;

    const dispararToast = (mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // 1. Obtener el usuario autenticado
    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user?.id) {
                setUserId(data.session.user.id);
            } else {
                setLoadingData(false);
            }
        };
        getSession();
    }, []);

    // 2. Obtener el ID del carrito vinculado al usuario
    useEffect(() => {
        if (!userId) return;
        const fetchCart = async () => {
            try {
                const cartId = await selectCarId(userId);
                setUserCart(cartId);
            } catch (error) {
                setLoadingData(false);
            }
        };
        fetchCart();
    }, [userId]);

    // 3. Obtener los ítems del carrito
    useEffect(() => {
        if (!userCart) return;
        const fetchItems = async () => {
            try {
                const items = await selectCarItems(userCart);
                setUserProductsCart(items ?? []);
                // Si no hay ítems, cortamos el loading aquí
                if (!items || items.length === 0) {
                    setLoadingData(false);
                }
            } catch (error) {
                setLoadingData(false);
            }
        };
        fetchItems();
    }, [userCart]);

    // 4. Cruzar datos con la tabla de Productos
    useEffect(() => {
        if (userProductCart.length === 0) return;

        const fetchProductsData = async () => {
            try {
                const detailedProducts = await Promise.all(
                    userProductCart.map(async (item) => {
                        const productInfo = await selectCarItemsProduct(item.product_id);
                        const info = Array.isArray(productInfo) ? productInfo[0] : productInfo;
                        return { ...item, product: info };
                    })
                );
                setShowProducts(detailedProducts);
            } catch (error) {
                console.error("Error al cruzar datos:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchProductsData();
    }, [userProductCart]);

    const handleErase = async (id) => {
        const fueBorrado = await erraseItem(id);
        if (fueBorrado) {
            setShowProducts(prev => prev.filter(item => item.id !== id));
            setUserProductsCart(prev => prev.filter(item => item.id !== id));
            dispararToast("Producto eliminado");
        }
    };

    const handleSum = async (id, currentAmount, stock) => {
        if (currentAmount >= stock) {
            dispararToast("Límite de stock alcanzado");
            return;
        }
        setShowProducts(prev => prev.map(item => 
            item.id === id ? { ...item, Amount: item.Amount + 1 } : item
        ));
        const success = await sum(id, currentAmount, stock);
        if (!success) {
            setShowProducts(prev => prev.map(item => 
                item.id === id ? { ...item, Amount: item.Amount - 1 } : item
            ));
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

    const handleBuy = async () => {
        if (showProducts.length === 0) return;
        const total = showProducts.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.Amount, 0);
        const success = await purchase(showProducts, userId, total);
        if (success) {
            dispararToast("¡Compra realizada con éxito!");
            setShowProducts([]);
            setUserProductsCart([]);
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
                <div className={showProducts.length > 0 ? "col-lg-8" : "col-lg-12"}>
                    {isActuallyLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Sincronizando carrito...</p>
                        </div>
                    ) : showProducts.length === 0 ? (
                        <div className="alert alert-light shadow-sm text-center py-5 border">
                            <h4>Tu carrito está vacío</h4>
                            <p className="text-muted">¿Aún no sabes qué comprar? ¡Tenemos muchas ofertas!</p>
                        </div>
                    ) : (
                        showProducts.map(item => (
                            <CarElement
                                key={item.id}
                                img={item.product?.img}
                                description={item.product?.prod_name || "Cargando..."}
                                price={item.product?.price * item.Amount}
                                amount={item.Amount}
                                clickErase={() => handleErase(item.id)} 
                                clickSum={() => handleSum(item.id, item.Amount, item.product?.stock)}
                                clickRest={() => handleRest(item.id, item.Amount)}
                                isPending={isSuming || isResting || isDeleting || isBuying}
                            />
                        ))
                    )}
                </div>

                {!isActuallyLoading && showProducts.length > 0 && (
                    <div className="col-lg-4">
                        <aside className="cart-summary shadow-sm p-4 border rounded bg-white">
                            <h5 className="mb-3 fw-bold">Resumen</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Productos:</span>
                                <span>{showProducts.reduce((acc, item) => acc + item.Amount, 0)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                <span>Total:</span>
                                <span>
                                    ${showProducts.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.Amount, 0).toLocaleString('es-AR')}
                                </span>
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