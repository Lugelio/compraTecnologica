import { useState,useEffect } from "react";
import { supabase } from "../../database/conexionBase";

function useSelectCarItemsProduct() {


    const selectCarItemsProduct = async (products_id)=>  {

        const { data, error } = await supabase
            .from("Products")
            .select("*")
            .eq("id", products_id)
           


        if (error) {
            console.error("Error buscando el carrito:", error);
            throw error;
        }

        
        return data;
    };
    return  selectCarItemsProduct

}


export default useSelectCarItemsProduct