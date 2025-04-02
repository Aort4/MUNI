let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6] },
        { orderable: false, targets: [6] },
        { searchable: true, targets: [1, 2] },
        { width: "20%", targets: [1, 2] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún usuario encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún usuario encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listUsuarios();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

const listUsuarios = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/usuarios/");
        const data = await response.json();

        if (!data || !data.data || !Array.isArray(data.data)) {
            console.error("La API no devolvió datos válidos:", data);
            alert("No se pudo obtener la lista de usuarios.");
            return;
        }
        
        document.getElementById("tableBody_users").innerHTML = data.data.map((usuario, index) => `
        
            <tr>
                <td>${index + 1}</td>
                <td>${usuario.nombre_completo}</td>
                <td>${usuario.email}</td>
                <td>${usuario.fecha_registro || 'N/A'}</td>
                <td>${usuario.estado ? 'Activo' : 'Inactivo'}</td>
                <td>${usuario.rol || 'Sin rol'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${usuario.id_usuario}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${usuario.id_usuario}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".btn-edit").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                abrirModalEdicion(id);
            });
        });

    } catch (ex) {
        console.error("Error:", ex);
        alert("Error al obtener los datos de usuarios");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initDataTable();
});

document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const userId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadUserData(userId);
    } else if (btn.classList.contains("btn-delete")) {
        await confirmDelete(userId);
    }
});
