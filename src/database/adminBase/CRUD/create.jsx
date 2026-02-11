import { useState } from "react";
import { supabase } from "../../conexionBase";
function useCreate(){
    const [loading, setLoading] = useState(false);
    const ejecutarInsercion = async (datosProducto,base) =>{
        setLoading(true)
        const { data,error } = await supabase.from(base).insert([datosProducto]);
         
        setLoading(false)
            console.log("DATA:", data);
            console.log("ERROR:", error);
        if(error) throw error;
        return data
        
    };
    return { ejecutarInsercion,loading}
        
}       


export default useCreate