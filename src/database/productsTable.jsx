import { supabase } from "./conexionBase";
import { useEffect, useState } from "react";

function useProducts(estado) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts();
    }, [estado]);

    async function getProducts() {

        let query = supabase
            .from("Products")
            .select("*")
            .eq("offer_state", false); 


        if (estado !== undefined) {
            query = query.eq("Estado", estado);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error en Supabase:", error);
            return;
        }

        setProducts(data);
    }

    return products;
}

export default useProducts;