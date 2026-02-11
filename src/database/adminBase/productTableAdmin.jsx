import useProducts from "../productsTable";
import { useState } from "react";
import "./admin.css";
import useCreate from "./CRUD/create";
import useDelete from "./CRUD/delete";
import { supabase } from "../conexionBase";

function ProductTableAdmin() {
    const products = useProducts();
    const [file, setFile] = useState(null); // Estado para el archivo de imagen

    const [nuevoProducto, setNuevoProducto] = useState({
        prod_name: "",
        price: "",
        stock: "",
        img: "", // Aquí guardaremos la URL final
        description: "",
        Type: "",
        Marca: ""
    });

    const { ejecutarInsercion, loading } = useCreate();
    const { ejecutarDelete, loading: loadingDelete } = useDelete();

    const handleChange = (e) => {
        setNuevoProducto({
            ...nuevoProducto,
            [e.target.name]: e.target.value
        });
    };

    const handleInsert = async () => {
        try {
            let publicImageUrl = nuevoProducto.img; // Por si querés usar URL manual

            // 1. Si hay un archivo seleccionado, lo subimos al Bucket
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`; // Nombre único con timestamp
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('produtc-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // 2. Obtenemos la URL pública del archivo subido
                const { data } = supabase.storage
                    .from('produtc-images')
                    .getPublicUrl(filePath);
                
                publicImageUrl = data.publicUrl;
            }

            // 3. Ejecutar la inserción con la URL de la imagen (o la manual si no hubo file)
            const productoFinal = { ...nuevoProducto, img: publicImageUrl };
            
            await ejecutarInsercion(productoFinal, "Products");

            // 4. Limpiar estados y recargar
            setNuevoProducto({
                prod_name: "", price: "", stock: "", img: "",
                description: "", Type: "", Marca: ""
            });
            setFile(null);
            window.location.reload();
        } catch (error) {
            console.error("Error en el proceso:", error.message);
            alert("Hubo un error al guardar el producto");
        }
    };

    const handleDelete = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 1 ? 0 : 1;
        try {
            await ejecutarDelete(nuevoEstado, "Products", id);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="product-table-admin">
            <table style={{ border: "2px solid black" }}>
                <thead className="base_info">
                    <tr>
                        <th>ID</th>
                        <th>Fecha ingreso</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Imagen (Archivo)</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Marca</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="base_info" style={{ opacity: product.Estado === 0 ? 0.5 : 1 }}>
                            <td>{product.id}</td>
                            <td>{product.created_at}</td>
                            <td>{product.prod_name}</td>
                            <td>{product.price}</td>
                            <td>{product.stock}</td>
                            <td>
                                <img src={product.img} alt="prod" style={{ width: "50px" }} />
                            </td>
                            <td>{product.description}</td>
                            <td>{product.Type}</td>
                            <td>{product.Marca}</td>
                            <td>{product.Estado === 1 ? "Alta" : "Baja"}</td>
                            <td>
                                <button onClick={() => handleDelete(product.id, product.Estado)} disabled={loadingDelete}>
                                    {product.Estado === 1 ? "Dar de baja" : "Dar de alta"}
                                </button>
                            </td>
                        </tr>
                    ))}

                    {/* FILA PARA AGREGAR NUEVO */}
                    <tr className="base_info new-row">
                        <td>—</td>
                        <td>—</td>
                        <td><input name="prod_name" value={nuevoProducto.prod_name} onChange={handleChange} placeholder="Nombre" /></td>
                        <td><input type="number" name="price" value={nuevoProducto.price} onChange={handleChange} placeholder="Precio" /></td>
                        <td><input type="number" name="stock" value={nuevoProducto.stock} onChange={handleChange} placeholder="Stock" /></td>
                        
                        {/* INPUT DE ARCHIVO */}
                        <td>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setFile(e.target.files[0])} 
                            />
                        </td>

                        <td><input name="description" value={nuevoProducto.description} onChange={handleChange} placeholder="Descripción" /></td>
                        <td><input name="Type" value={nuevoProducto.Type} onChange={handleChange} placeholder="Tipo" /></td>
                        <td><input name="Marca" value={nuevoProducto.Marca} onChange={handleChange} placeholder="Marca" /></td>
                        
                        <td colSpan={2}>
                            <button onClick={handleInsert} disabled={loading}>
                                {loading ? "Guardando..." : "Agregar Producto"}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
}

export default ProductTableAdmin;