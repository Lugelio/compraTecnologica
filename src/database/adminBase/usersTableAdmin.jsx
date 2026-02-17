import useUsers from "../usersTable";
import "./admin.css";
import useCreate from "./CRUD/create";
import useDelete from "./CRUD/delete";
import { useState } from "react";

function UsersTableAdmin() {
    const users = useUsers();

    const { ejecutarInsercion, loading } = useCreate();
    const { ejecutarDelete, loading: loadingDelete } = useDelete();

    const [nuevoUsuario, setNuevoUsuario] = useState({
        Username: "",
        email: "",
        phone: ""
    });

    const handleChange = (e) => {
        setNuevoUsuario({
            ...nuevoUsuario,
            [e.target.name]: e.target.value
        });
    };

    const handleInsert = async () => {
        try {
            await ejecutarInsercion(
                {
                    ...nuevoUsuario,
                    phone: Number(nuevoUsuario.phone),
                    Estado: 1 // 👈 entra activo
                },
                "users"
            );

            setNuevoUsuario({
                Username: "",
                email: "",
                phone: ""
            });

            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };


    const handleDelete = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 1 ? 0 : 1;

        try {
            await ejecutarDelete(nuevoEstado, "users", id);
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
                        <th>Última conexión</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="base_info"
                            style={{
                                opacity: user.Estado === 0 ? 0.5 : 1
                            }}
                        >
                            <td>{user.id}</td>
                            <td>{user.Joined}</td>
                            <td>{user.Last_connection}</td>
                            <td>{user.Username}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.Estado === 1 ? "Alta" : "Baja"}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleDelete(user.id, user.Estado)
                                    }
                                    disabled={loadingDelete}
                                >
                                    {user.Estado === 1
                                        ? "Dar de baja"
                                        : "Dar de alta"}
                                </button>
                            </td>
                        </tr>
                    ))}

                    <tr className="base_info new-row">
                        <td>—</td>
                        <td>—</td>
                        <td>—</td>

                        <td>
                            <input
                                name="Username"
                                value={nuevoUsuario.Username}
                                onChange={handleChange}
                                placeholder="Username"
                            />
                        </td>

                        <td>
                            <input
                                name="email"
                                value={nuevoUsuario.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                        </td>

                        <td>
                            <input
                                type="number"
                                name="phone"
                                value={nuevoUsuario.phone}
                                onChange={handleChange}
                                placeholder="Teléfono"
                            />
                        </td>

                        <td colSpan={2} style={{ textAlign: "center" }}>
                            <button
                                type="button"
                                onClick={handleInsert}
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Agregar"}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
}

export default UsersTableAdmin;