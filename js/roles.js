let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3] },
        { orderable: false, targets: [3] },
        { searchable: true, targets: [1] },
        { width: "30%", targets: [1] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún rol encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún rol encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listRoles();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

document.addEventListener("DOMContentLoaded", initDataTable);

document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const rolId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadRolData(rolId);
    } else if (btn.classList.contains("btn-delete")) {
        await confirmDelete(rolId);
    }
});

const listRoles = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/rol/");
        const data = await response.json();

        // Renderizar la tabla con los productos
        document.getElementById("tableBody_users").innerHTML = data.data.map((rol, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${rol.nombre_rol}</td>
                <td>${rol.estado}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${rol.id_rol}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${rol.id_rol}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");

        
        document.querySelectorAll(".btn-edit").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                AbrirModal(id);
            });
        });

    } catch (ex) {
        console.error("Error:", ex);
        alert("Error al obtener los datos");
    }
};




// Cargar datos en el modal de edición de 
const loadRolData = async (rolId) => {
    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/rol/${rolId}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para este rol.");

        const rol = result.data[0];

        const editId = document.getElementById("editId");
        const editRol = document.getElementById("editRol");

        if (!editId || !editRol) {
            console.error("No se encontraron los elementos del formulario en el DOM.");
            return;
        }

        editId.value = rol.id_rol;
        editRol.value = rol.nombre_rol;

        const modalElement = document.getElementById("RolModal");
        if (!modalElement) throw new Error("El modal 'RolModal' no existe en el DOM.");

        modalElement.style.display = "flex";  // Asegúrate de que el modal esté visible

    } catch (error) {
        console.error("Error al cargar datos del Rol:", error);
    }
};
// Función para manejar la edición de rol (submit del formulario)
document.getElementById("rol_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombreRol = document.getElementById("editRol").value.trim();

    if (!nombreRol) {
        alert("❌ El nombre del Rol no puede estar vacío.");
        return;
    }

    // Verificar que el rol no existe antes de enviar la solicitud
    const rolExistente = await checkRolExistente(nombreRol);
    if (rolExistente) {
        alert("❌ El Rol ya existe.");
        return;
    }

    const rolActualizado = {
        id_rol: document.getElementById("editId").value,
        nombre_rol: nombreRol
    };

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/rol/${rolActualizado.id_rol}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rolActualizado)
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el rol");
        }

        const data = await response.json();
        alert("Rol actualizado con éxito!");
        
        closeModal();
        initDataTable();

    } catch (error) {
        console.error("Error actualizando el Rol:", error);
        alert("❌ " + error.message);
    }
});

const checkRolExistente = async (nombreRol) => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/rol/");
        const data = await response.json();
        const roles = data.data;

        return roles.some(rol => rol.nombre_rol.toLowerCase() === nombreRol.toLowerCase());
    } catch (error) {
        console.error("Error al verificar existencia del Rol:", error);
        return false;
    }
};


   // AGREGAR ROL
document.getElementById("addForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const inputRol = document.getElementById("addRol");
    const nuevoRol = inputRol.value.trim();


    if (!nuevoRol) {
        alert("❌ El nombre del Rol no puede estar vacío.");
        return;
    }

    try {
    
        const responseRoles = await fetch("https://ppt-munic.onrender.com/api/rol/");
        const data = await responseRoles.json();

     
        const response = await fetch("https://ppt-munic.onrender.com/api/rol/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_rol: nuevoRol })
        });

        const result = await response.json();
        console.log(result);
        if (result.success) {
            alert("✅ Rol agregado con éxito!");
            inputRol.value = "";  
            initDataTable(); 
        } else {
            alert("❌ " + (result.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al agregar rol:", error);
        alert("❌ Error al agregar rol.");
    }
});



// Confirmar eliminación de categoría
const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este Rol")) return;
    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/rol/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error eliminando Rol");
        alert("✅ " + result.message);
        initDataTable();
    } catch (error) {
        console.error("Error eliminando Rol:", error);
        alert("❌ " + error.message);
    }
};




// Ajustar la función para abrir el modal correctamente y cargar los datos
function AbrirModal(id) {
    console.log("ID recibido para editar:", id); 
    loadRolData(id);  // Ahora se cargan los datos antes de mostrar el modal
    modal.style.display = "flex";
}

// Cerrar modal
function closeModal() {
    modal.style.display = "none";
}


// MODAL
const modal = document.getElementById("RolModal");
const closeModalBtn = document.querySelector(".close");

function AbrirModal(id) {
    console.log("ID recibido para editar:", id); 
    modal.style.display = "flex";
}


closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};


document.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-edit");
    if (btn) {
        const id = btn.getAttribute("data-id");
        AbrirModal(id); 
    }
});


