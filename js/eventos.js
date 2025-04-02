// COMERCIOO

let dataTable;
let dataTableIsInitialized = false;

// Opciones de DataTable
const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6, 7] },
        { orderable: false, targets: [7] },
        { searchable: true, targets: [1] },

    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún comercio encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún comercio encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

// Inicializar la tabla con datos
const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listComercios();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

// Cargar la tabla al iniciar
document.addEventListener("DOMContentLoaded", () => {
    initDataTable();
});

// Manejar eventos de botones (editar/eliminar)
document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const comercioId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadComercioData(comercioId);
    } else if (btn.classList.contains("btn-delete")) {
        console.log("Botón Eliminar clickeado, ID del comercio:", comercioId);
        await confirmDelete(comercioId);
    }
});

// Cargar datos desde el modal de edición
const loadComercioData = async (comercioId) => {
    try {
        console.log("Ejecutando loadComercioData con ID:", comercioId);

        // Obtener los datos del comercio
        const response = await fetch(`https://ppt-munic.onrender.com/api/comercios/${comercioId}`);
        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para este comercio.");
        
        const comercio = result.data[0];

        // Obtener las categorías disponibles
        const catResponse = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/");
        const catResult = await catResponse.json();
        if (!catResult.success) throw new Error("Error obteniendo categorías");

        const categoriaSelect = document.getElementById("editCategoria");
        categoriaSelect.innerHTML = ""; // Limpiar opciones previas

        catResult.data.forEach(categoria => {
            let option = document.createElement("option");
            option.value = categoria.id_categoria;
            option.textContent = categoria.nombre_categoria;
            if (categoria.id_categoria === comercio.id_categoria) {
                option.selected = true; // Seleccionar la categoría actual del comercio
            }
            categoriaSelect.appendChild(option);
        });

        // Asignar valores al formulario
        document.getElementById("editId").value = comercio.id_comercio;
        document.getElementById("editNombre").value = comercio.nombre_comercio;
        document.getElementById("editDescripcion").value = comercio.descripcion_comercio;
        document.getElementById("editLatitud").value = comercio.latitud;
        document.getElementById("editLongitud").value = comercio.longitud;
        document.getElementById("editTelefono").value = comercio.telefono;
        document.getElementById("editVideo").value = comercio.video_youtube || '';

        // Verificar si el modal existe antes de abrirlo
        const modalElement = document.getElementById("Comercio_edit");
        if (!modalElement) throw new Error("El modal 'Comercio_edit' no existe en el DOM.");

        console.log("Abriendo el modal...");

        // Mostrar el modal de edición
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();

    } catch (error) {
        console.error("Error al cargar datos del comercio:", error);
    }
};




// Manejar la edición (submit del formulario)
document.getElementById("comercio_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const comercioActualizado = {
        id_comercio: parseInt(document.getElementById("editId").value, 10),
        nombre_comercio: document.getElementById("editNombre").value.trim(),
        descripcion_comercio: document.getElementById("editDescripcion").value.trim(),
        latitud: document.getElementById("editLatitud").value.trim(),
        longitud: document.getElementById("editLongitud").value.trim(),
        telefono: document.getElementById("editTelefono").value.trim(),
        video_youtube: document.getElementById("editVideo").value.trim(),
        id_categoria: parseInt(document.getElementById("editCategoria").value, 10)
    };

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/comercios/${comercioActualizado.id_comercio}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(comercioActualizado)
        });
        if (!response.ok) throw new Error("Error actualizando comercio");

        alert("Comercio actualizado con éxito!");

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("Comercio_edit"));
        modal.hide();

        // Recargar la tabla
        initDataTable();
    } catch (error) {
        console.error("Error actualizando comercio:", error);
    }
});




// Confirmar y eliminar comercio
const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comercio?")) return;

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/comercios/${id}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Error eliminando comercio");

        alert("Comercio eliminado con éxito!");
        initDataTable();
    } catch (error) {
        console.error("Error eliminando comercio:", error);
    }
};


// Obtener lista de comercios y poblar la tabla
const listComercios = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/comercios/");
        const data = await response.json();

        document.getElementById("tableBody_users").innerHTML = data.data.map((comercio, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${comercio.nombre_comercio}</td>
                <td>${comercio.descripcion_comercio}</td>
                <td>${comercio.url_google}</td>
                <td>${comercio.telefono}</td>
                <td>${comercio.video_youtube}</td>
                 <td>${comercio.categoria}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${comercio.id_comercio}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${comercio.id_comercio}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (ex) {
        console.error("Error:", ex);
        alert("Error al obtener los datos");
    }
};

// Post para agregar Comercio
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Capturar datos del formulario
        const datos = {
            nombre_comercio: document.getElementById("addNombre").value.trim(),
            descripcion_comercio: document.getElementById("addDescripcion").value.trim(),
            url_google: document.getElementById("addUrlGoogle").value.trim(),
            telefono: document.getElementById("addTelefono").value.trim(),
            video_youtube: document.getElementById("addVideo").value.trim(),
            id_categoria: parseInt(document.getElementById("addCategoria").value, 10) // Convertir a entero

        };

        try {
            const response = await fetch("https://ppt-munic.onrender.com/api/comercios/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            let result;
            try {
                result = await response.json();
            } catch (error) {
                throw new Error("El servidor no devolvió un JSON válido.");
            }

            if (result.success) {
                alert(result.message);
                form.reset(); // Limpia el formulario
                initDataTable(); // Recarga la tabla para mortrar el nuevo registro
            } else if (result.error) {
                alert("❌ " + result.error);
            } else {
                alert("⚠️ Respuesta inesperada del servidor.");
            }

        } catch (error) {
            console.error("❌ Error al agregar comercio:", error);
            alert("❌ Error desconocido al agregar comercio.");
        }
    });
});





// Cargar y recargar la tabla al inicio
window.addEventListener("load", initDataTable, );