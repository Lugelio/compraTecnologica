
import { supabase } from "../../database/conexionBase";
import { useState } from "react";
function useErraseCartItem() {
    const [loading, setLoading] = useState(false);

    const erraseItem = async (id) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .delete() // <--- CAMBIO CLAVE: Borrado físico
                .eq('id', id)
                .select(); // Retorna lo que borró para confirmar

            if (error) throw error;
            
            // Retorna true si borró al menos una fila
            return data && data.length > 0;
        } catch (error) {
            console.error("Error al eliminar el item del carrito:", error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { erraseItem, loading };
}export default useErraseCartItem