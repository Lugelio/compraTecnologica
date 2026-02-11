import { supabase } from "../database/conexionBase";
async function LogoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout failed:', error.message);
    } else {
        console.log('Logout successful');
    }
} export default LogoutUser

