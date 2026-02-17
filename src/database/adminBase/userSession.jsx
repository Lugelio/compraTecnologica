import { useState, useEffect } from 'react';
import { supabase } from '../conexionBase'; 

const useUserSession = () => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                if (data?.session?.user?.id) {
                    setUserId(data.session.user.id);
                }
            } catch (error) {
                console.error("Error recuperando la sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();


        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { userId, loading };
}; export default useUserSession