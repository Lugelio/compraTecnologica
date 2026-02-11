import { supabase } from "./conexionBase";
import { useEffect, useState } from "react";
function useCar() {
    const [car, setCar] = useState([]);
    useEffect(() => {
        getCar();
    }, []);
    async function getCar() {
        const { data } = await supabase.from("carts").select();
        setCar(data);
    }
    return car
}
export default useCar