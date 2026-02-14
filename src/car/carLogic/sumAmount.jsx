import { supabase } from "../../database/conexionBase";
import { useState } from "react";

function useSumAmount() {
    const [loading, setLoading] = useState(false);

    const sum = async (id, currentAmount, stock) => {
        if (currentAmount >= stock) return null;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ Amount: currentAmount + 1 })
                .eq('id', id);

            if (error) throw error;

            return true; // Devolvemos true para confirmar que se grabó
        } catch (error) {
            console.error("Error al sumar en DB:", error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    return { sum, loading };
}
export default useSumAmount;