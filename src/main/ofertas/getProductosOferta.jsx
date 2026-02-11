import { useEffect, useState } from "react";
import { supabase } from "../../database/conexionBase";

function useGetProductosOferta() {
    const [offerProducts, setOfferProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const productsInOffer = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("Products")
                .select("*")
                .eq("offer_state", true);

            if (error) throw error;

            setOfferProducts(data);
        } catch (error) {
            console.error("Error cargando ofertas:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        productsInOffer();
    }, []);

    // Devolvemos los productos y el estado de carga
    return { offerProducts, loading, refetch: productsInOffer };
}

export default useGetProductosOferta;