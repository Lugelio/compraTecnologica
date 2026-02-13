import { supabase } from "../../database/conexionBase";
import { useState } from "react";


function useRestAmount() {
    const [loading, setLoading] = useState(false);

    const rest = async (id, currentAmount) => {
        if (currentAmount <= 1) return null; 
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .update({ Amount: currentAmount - 1 })
                .eq('id', id)
                .select(`*, Products (*)`)
          

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error al restar:", error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };
    return { rest, loading };
}
export default useRestAmount;