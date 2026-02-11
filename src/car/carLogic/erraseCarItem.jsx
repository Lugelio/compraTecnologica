import { supabase } from "../../database/conexionBase";
import { useState } from "react";

function useErraseCartItem() {
    const [loading, setLoading] = useState(false);

    const erraseItem = async (id) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .update({ state: "off", Amount: 0 })
                .eq('id', id)
                .select();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error("Error al desactivar el item del carrito:", error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { erraseItem, loading };
}

export default useErraseCartItem;