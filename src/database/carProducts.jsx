import { supabase } from "./conexionBase";
import { useEffect, useState } from "react";
function useCarItems() {
    const [car, setCar] = useState([]);
    useEffect(() => {
        getCar();
    }, []);
    async function getCar() {
        const { data } = await supabase.from("cart_items").select();
        setCar(data);
    }
    return car
}
export default useCarItems