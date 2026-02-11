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

    
    const [showToast, setShowToast] = useState(false);
    const [msg, setMsg] = useState("");

    const dispararToast = (mensaje) => {
        setMsg(mensaje);
        setShowToast(true);
       
        setTimeout(() => setShowToast(false), 3000);
    };

    const { sum, loading: isSuming } = useSumAmount();
    const { rest, loading: isResting } = useRestAmount();
    const { erraseItem, loading: isDeleting } = useErraseCartItem();
    const { purchase, loading: isBuying } = usePurchase();

    const selectCarId = useSelectCarId();
    const selectCarItems = useSelectCarItems();
    const selectCarItemsProduct = useSelectCarItemsProduct();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user?.id) {
                setUserId(data.session.user.id);
            }
        };
        getSession();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const fetchCart = async () => {
            const cart = await selectCarId(userId);
            setUserCart(cart);
        };
        fetchCart();
    }, [userId]);

    useEffect(() => {
        if (!userCart) return;
        const fetchItems = async () => {
            const items = await selectCarItems(userCart);
            const activeItems = (items ?? []).filter(item => item.state === "on");
            setUserProductsCart(activeItems);
        };
        fetchItems();
    }, [userCart]);

    useEffect(() => {
        if (userProductCart.length === 0) {
            setShowProducts([]);
            return;
        }
        const fetchProducts = async () => {
            const products = await Promise.all(
                userProductCart.map(item => selectCarItemsProduct(item.product_id))
            );
            const flatProducts = products.flat();
            const merged = userProductCart.map(cartItem => {
                const product = flatProducts.find(p => p.id === cartItem.product_id);
                return { ...cartItem, product };
            });
            setShowProducts(merged);
        };
        fetchProducts();
    }, [userProductCart]);

    const handleErase = async (id) => {
        const result = await erraseItem(id);
        if (result) {
            setShowProducts(prev => prev.filter(item => item.id !== id));
            setUserProductsCart(prev => prev.filter(item => item.id !== id));
            dispararToast("Producto eliminado");
        }
    };

    const handleSum = async (id, currentAmount, stock) => {
        if (currentAmount >= stock) {
            dispararToast("Sin más stock disponible");
            return;
        }
        setShowProducts(prev => prev.map(item => 
            item.id === id ? { ...item, Amount: item.Amount + 1 } : item
        ));
        const result = await sum(id, currentAmount, stock);
        if (!result) {
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
            const result = await rest(id, currentAmount);
            if (!result) {
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

        const totalCost = showProducts.reduce(
            (acc, item) => acc + (item.product?.price ?? 0) * item.Amount,
            0
        );

        const result = await purchase(showProducts, userId, totalCost);

        if (result) {
            dispararToast("¡Compra exitosa! Gracias por elegirnos.");
            setShowProducts([]);
            setUserProductsCart([]);
        } else {
            dispararToast("Error al procesar la compra. Reintenta.");
        }
    };

    return (
        <div className="container mt-4 position-relative">
            
            {/* --- SISTEMA DE TOASTS --- */}
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
                    {showProducts.length === 0 ? (
                        <div className="alert alert-info shadow-sm">Tu carrito está vacío.</div>
                    ) : (
                        showProducts.map(item => (
                            <CarElement
                                key={item.id}
                                img={item.product?.img}
                                description={item.product?.prod_name || "Producto"}
                                price={item.product?.price}
                                amount={item.Amount}
                                clickErase={() => handleErase(item.id)} 
                                clickSum={() => handleSum(item.id, item.Amount, item.product?.stock)}
                                clickRest={() => handleRest(item.id, item.Amount)}
                                isPending={isSuming || isResting || isDeleting || isBuying}
                            />
                        ))
                    )}
                </div>

                {showProducts.length > 0 && (
                    <div className="col-lg-4">
                        <aside className="cart-summary shadow-sm p-4 border rounded bg-white">
                            <h5 className="mb-3">Resumen del pedido</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Ítems totales:</span>
                                <span>{showProducts.reduce((acc, item) => acc + item.Amount, 0)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 fw-bold text-dark fs-5">
                                <span>Total:</span>
                                <span>
                                    ${showProducts.reduce(
                                        (acc, item) => acc + (item.product?.price ?? 0) * item.Amount,
                                        0
                                    ).toLocaleString('es-AR')}
                                </span>
                            </div>
                            <button 
                                className="btn btn-primary btn-lg w-100" 
                                onClick={handleBuy}
                                disabled={isSuming || isResting || isDeleting || isBuying}
                            >
                                {isBuying ? "Procesando..." : "Finalizar compra"}
                            </button>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Car;