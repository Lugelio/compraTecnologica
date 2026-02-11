import { supabase } from "./conexionBase";
import { useEffect, useState } from "react";
function useUsers() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        getUsers();
    }, []);
    async function getUsers() {
        const { data } = await supabase.from("profile").select();
        setUsers(data);
    }
    return users
}
export default useUsers