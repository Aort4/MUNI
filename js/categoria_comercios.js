let dataTable;
let dataTableIsInitialized = false;

// Opciones de DataTable
const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2] },
        { orderable: false, targets: [2] },
        { searchable: true, targets: [1] },
        { width: "70%", targets: [1] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ninguna categoría encontrada",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ninguna categoría encontrada",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

// Inicializar DataTable
const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listCategoriasComercios();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

document.addEventListener("DOMContentLoaded", initDataTable);

// Manejar eventos de botones (editar/eliminar)
document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const categoriaId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadCategoriaData(categoriaId);
    } else if (btn.classList.contains("btn-delete")) {
        console.log("Botón Eliminar clickeado, ID de la categoría:", categoriaId);
        await confirmDelete(categoriaId);
    }
});

// Cargar datos en el modal de edición de categoría
const loadCategoriaData = async (categoriaId) => {
    try {
        console.log("Ejecutando loadCategoriaData con ID:", categoriaId);

        const response = await fetch(`https://ppt-munic.onrender.com/api/categoriascomercios/${categoriaId}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para esta categoría.");

        const categoria = result.data[0];

        // Obtener los elementos del formulario
        const editId = document.getElementById("editId");
        const editCategoria = document.getElementById("editCategoria");

        // Verificar si los elementos existen antes de asignar valores
        if (!editId || !editCategoria) {
            console.error("No se encontraron los elementos del formulario en el DOM.");
            return;
        }

        // Asignar valores
        editId.value = categoria.id_categoria;
        editCategoria.value = categoria.nombre_categoria;

        // Mostrar el modal
        const modalElement = document.getElementById("Categoria_edit");
        if (!modalElement) throw new Error("El modal 'Categoria_edit' no existe en el DOM.");

        // Mostrar el modal (modal personalizado)
        modalElement.style.display = "flex";  // Asegúrate de que el modal esté visible

    } catch (error) {
        console.error("Error al cargar datos de la categoría:", error);
    }
};
// Manejar la edición de categoría (submit del formulario)
document.getElementById("categoria_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombreCategoria = document.getElementById("editCategoria").value.trim();

    // Validación: No permitir campos vacíos
    if (!nombreCategoria) {
        alert("❌ El nombre de la categoría no puede estar vacío.");
        return;
    }

    // Validar que la categoría no exista
    const categoriaExistente = await checkCategoriaExistente(nombreCategoria);
    if (categoriaExistente) {
        alert("❌ La categoría ya existe.");
        return;
    }

    const categoriaActualizada = {
        id_categoria: document.getElementById("editId").value,
        nombre_categoria: nombreCategoria
    };

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/categoriascomercios/${categoriaActualizada.id_categoria}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoriaActualizada)
        });

        if (!response.ok) throw new Error("Error actualizando categoría");

        // Mostrar el mensaje de éxito
        alert("Categoría actualizada con éxito!");

        // Cerrar el modal automáticamente
        closeModal();

        // Recargar la tabla para reflejar los cambios
        initDataTable();

    } catch (error) {
        console.error("Error actualizando categoría:", error);
        alert("❌ " + error.message);
    }
});

// Función para verificar si la categoría ya existe
const checkCategoriaExistente = async (nombreCategoria) => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/");
        const data = await response.json();
        const categorias = data.data;

        // Verificar si ya existe una categoría con el mismo nombre
        return categorias.some(categoria => categoria.nombre_categoria.toLowerCase() === nombreCategoria.toLowerCase());
    } catch (error) {
        console.error("Error al verificar existencia de la categoría:", error);
        return false;  // Si hay un error en la consulta, se asume que no existe
    }
};




// Confirmar eliminación de categoría
const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/categoriascomercios/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error eliminando categoría");
        alert("✅ " + result.message);
        initDataTable();
    } catch (error) {
        console.error("Error eliminando categoría:", error);
        alert("❌ " + error.message);
    }
};

// Mostrar la lista de categorías
const listCategoriasComercios = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/");
        const data = await response.json();
        document.getElementById("tableBody_users").innerHTML = data.data.map((categoria, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${categoria.nombre_categoria}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${categoria.id_categoria}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${categoria.id_categoria}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("❌ Error al obtener los datos");
    }
};
// MODAL
const modal = document.getElementById("Categoria_edit");

// Abrir modal solo si se hace clic en un botón de editar
function AbrirModal(id) {
    console.log("ID recibido para editar:", id); // Para verificar que solo se activa al hacer clic
    modal.style.display = "flex";
}

// Función para cerrar el modal
const closeModal = () => {
    const modalElement = document.getElementById("Categoria_edit");
    if (modalElement) {
        modalElement.style.display = "none";
    }
};

// Cerrar modal al hacer clic en la "X"
const closeModalBtn = document.querySelector(".close");
closeModalBtn.onclick = function () {
    closeModal(); // Cierra el modal
};


// Cerrar modal si el usuario hace clic fuera del contenido
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// ✅ Asegurar que los botones de editar solo abran el modal cuando se haga clic
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-edit");
    if (btn) {
        const id = btn.getAttribute("data-id");
        AbrirModal(id); // Solo se ejecuta cuando se da clic en el botón de editar
    }
});


document.getElementById("addForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const inputCategoria = document.getElementById("addCategoria");
    const nuevaCategoria = inputCategoria.value.trim();

    // 🚨 Validación: No permitir campos vacíos
    if (!nuevaCategoria) {
        alert("❌ El nombre de la categoría no puede estar vacío.");
        return;
    }

    try {
        // Obtener todas las categorías existentes
        const responseCategorias = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/");
        const data = await responseCategorias.json();

        // Verificar si la categoría ya existe (ignorando mayúsculas y espacios extra)
        const categoriaExiste = data.data.some(categoria => categoria.nombre_categoria.trim().toLowerCase() === nuevaCategoria.toLowerCase());

        if (categoriaExiste) {
            alert("❌ La categoría ya existe. Intenta con otro nombre.");
            return;
        }

        // Guardar la nueva categoría
        const response = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_categoria: nuevaCategoria })
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ Categoría agregada con éxito!");
            inputCategoria.value = "";  // 🧹 Limpiar el campo de entrada
            initDataTable();  // 🔄 Actualizar la tabla
        } else {
            alert("❌ " + (result.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al agregar categoría:", error);
        alert("❌ Error al agregar categoría.");
    }
});
