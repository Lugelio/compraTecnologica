import { useState } from "react";
import { supabase } from "../database/conexionBase";

function useProfileData() {
    const [loading, setLoading] = useState(false);

    const profile = async (id_user) => {
        if (!id_user) return { data: null, error: "No ID" };
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id_user)
                .single(); 

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error en profile:", error.message);
            return { data: null, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return { profile, loading };
}

export default useProfileData;