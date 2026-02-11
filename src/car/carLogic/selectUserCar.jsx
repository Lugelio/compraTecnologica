import { useState } from "react";
import { supabase } from "../../database/conexionBase";
function useSelectCarId() {

    const selectCarUserId = async (user_id) => {
        const { data, error } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user_id)
            .single(); 

        if (error) {
            console.error("Error buscando el carrito:", error);
            throw error;
        }

        
        return data.id;
    };
    return selectCarUserId

}


export default useSelectCarId