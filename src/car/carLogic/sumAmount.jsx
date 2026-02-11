import { supabase } from "../../database/conexionBase";
import { useState } from "react";

function useSumAmount() {
    const [loading, setLoading] = useState(false);

    const sum = async (id, currentAmount, stock) => {
        if (currentAmount >= stock) return null;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .update({ Amount: currentAmount + 1 })
                .eq('id', id)
                .select(`*, Products (*)`)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error al sumar:", error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };
    return { sum, loading };
}
export default useSumAmount;