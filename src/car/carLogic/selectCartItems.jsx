import { useState } from "react";
import { supabase } from "../../database/conexionBase";

function useSelectCarItems() {
  const [loading, setLoading] = useState(false);

  const selectCarItems = async (cart_id) => {
    if (!cart_id) return null;
    
    setLoading(true); // Inicia carga
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart_id);

      if (error) {
        console.error("Error buscando el carrito:", error);
        throw error;
      }
      return data;
    } finally {
      setLoading(false); 
    }
  };

  return { selectCarItems, loading }; 
}

export default useSelectCarItems;