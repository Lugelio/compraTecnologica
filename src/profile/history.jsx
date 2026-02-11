import { useState } from "react";
import { supabase } from "../database/conexionBase";

function useHistory() {
    const [loading, setLoading] = useState(false);

    const getHistory = async (buyer_id) => {
        if (!buyer_id) return { data: null, error: "No ID" };
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("purchases")
                .select("*")
                .eq("buyer_id", buyer_id)
                .order("purchase_date", { ascending: false });

            if (error){
               console.error("DETALLE DEL ERROR 400:", error.message, error.details, error.hint);
                 throw error; 
            } 
            return { data, error: null }; // Devolvemos la data directamente
        } catch (error) {
            return { data: null, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return { getHistory, loading };
}
export default useHistory;