import { useState } from "react";
import { supabase } from "../../conexionBase";

function useDelete() {
    const [loading, setLoading] = useState(false);

    const ejecutarDelete = async (estado, base, id) => {
        setLoading(true);

        const { data, error } = await supabase
            .from(base)
            .update({ Estado: estado })
            .eq("id", id);

        setLoading(false);
        console.log(error)
        if (error) throw error;
        return data;
    };

    return { ejecutarDelete, loading };
}

export default useDelete;