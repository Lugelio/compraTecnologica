import { useState } from "react";
import { supabase } from "../../database/conexionBase";

function useSelectCarItems() {

  const selectCarItems = async (cart_id) => {
    if (!cart_id) return null; 
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart_id)
        .eq("state","on");

      if (error) {
        console.error("Error buscando el carrito:", error);
        throw error;
      }
      return data;
  };

  return selectCarItems
}

export default useSelectCarItems;
