import { useState } from "react";
import { supabase } from "../../database/conexionBase";

function usePurchase() {
    const [loading, setLoading] = useState(false);

    const purchase = async (showProducts, buyer_id, total_cost) => {
        setLoading(true);
        try {
            // A. Insertar el registro de la compra en el historial
            const productsIds = showProducts.map(item => item.product_id);
            const { error: purchaseError } = await supabase
                .from("purchases")
                .insert({ 
                    products_id: productsIds, 
                    buyer_id: buyer_id, 
                    total_cost: total_cost 
                });

            if (purchaseError) throw purchaseError;

            // B. Actualizar Stock y "Apagar" items del carrito
            // Usamos Promise.all para que todas las actualizaciones se disparen en paralelo
            const updatePromises = showProducts.map(async (item) => {
                // 1. Restar stock real del producto
                const { error: stockError } = await supabase
                    .from("Products")
                    .update({ stock: item.product.stock - item.Amount })
                    .eq("id", item.product_id);
                
                if (stockError) throw stockError;

                // 2. Cambiar estado del item a 'off' para que ya no aparezca en el carrito
                const { error: cartError } = await supabase
                    .from("cart_items")
                    .update({ state: 'off' })
                    .eq("id", item.id);

                if (cartError) throw cartError;
            });

            await Promise.all(updatePromises);

            return true; // Éxito total
        } catch (error) {
            console.error("Error crítico en la transacción:", error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { purchase, loading };
}

export default usePurchase;