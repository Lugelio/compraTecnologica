import { useState, useEffect } from "react";
import { supabase } from "../../database/conexionBase";

function useFiltrarBase(categoria) {
    const [filterProduct, setFilter] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        getProductsFilter();
    }, [categoria]);

    useEffect(() => {
        getTypes();
    }, []);

    async function getProductsFilter() {
        const { data } = await supabase
            .from("Products")
            .select()
            .eq("Type", categoria);

        setFilter(data ?? []);
    }

    async function getTypes() {
        const { data } = await supabase
            .from("Products")
            .select("Type");

        const uniqueTypes = [...new Set(data.map(item => item.Type))];
        setTypes(uniqueTypes);
    }

    return [filterProduct, types];
}

export default useFiltrarBase;