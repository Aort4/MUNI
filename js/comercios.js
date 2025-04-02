let dataTable;
let dataTableIsInitialized = false;

// Opciones de DataTable
const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: "_all" }, // Centra todas las columnas
        { orderable: false, targets: [7] }, // Evita orden en la columna Opciones
        { searchable: true, targets: [1] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún comercio encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún comercio encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar:",
        loadingRecords: "Cargando...",
        paginate: {
            next: "Siguiente",
            previous: "Anterior"
        }
    },

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

document.addEventListener("DOMContentLoaded", function () {
    const btnAgregarProducto = document.querySelector(".btn-agregarProducto");
    const btnAgregarRedSocial = document.querySelector(".btn-agregarRedSocial");

    btnAgregarProducto.addEventListener("click", function (event) {
        event.preventDefault();
        
        // Obtener el id y nombre del comercio desde el modal
        const comercioId = document.getElementById("editId").value;
        const nombreComercio = document.getElementById("editNombre").value;

        if (!comercioId) {
            alert("Selecciona un comercio antes de agregar un producto.");
            return;
        }

        // Guardar el id y nombre del comercio en el localStorage
        localStorage.setItem("id_comercio", comercioId);
        localStorage.setItem("nombre_comercio", nombreComercio);

        // Redirigir a la página de agregar producto
        window.location.href = `productos.html`;
    });

    btnAgregarRedSocial.addEventListener("click", function (event) {
        event.preventDefault();
        
        // Obtener el id y nombre del comercio desde el modal
        const comercioId = document.getElementById("editId").value;
        const nombreComercio = document.getElementById("editNombre").value;

        if (!comercioId) {
            alert("Selecciona un comercio antes de agregar una Red Social.");
            return;
        }

        // Guardar el id y nombre del comercio en el localStorage
        localStorage.setItem("id_comercio", comercioId);
        localStorage.setItem("nombre_comercio", nombreComercio);

        // Redirigir a la página de agregar producto
        window.location.href = `redes_sociales.html`;
    });
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
        console.log("Comercio recibido:", comercio);

        // Obtener las categorías disponibles
        const catResponse = await fetch("https://ppt-munic.onrender.com/api/categoriascomercios/");
        const catResult = await catResponse.json();
        if (!catResult.success || !catResult.data) throw new Error("Error obteniendo categorías");

        console.log("Lista de categorías disponibles:", catResult.data);

        // Referencia al select de categorías
        const categoriaSelect = document.getElementById("editCategoria");
        categoriaSelect.innerHTML = ""; // Limpiar opciones previas

        // Buscar la categoría usando el nombre en lugar del ID
        const comercioCategoriaNombre = comercio.nombre_categoria; 
        const categoriaEncontrada = catResult.data.find(categoria => categoria.nombre_categoria === comercioCategoriaNombre);
        const idCategoriaComercio = categoriaEncontrada ? categoriaEncontrada.id_categoria : null;

        console.log("Categoría encontrada:", categoriaEncontrada);

        // Agregar opciones con las categorías existentes
        catResult.data.forEach(categoria => {
            let option = document.createElement("option");
            option.value = categoria.id_categoria;
            option.textContent = categoria.nombre_categoria;

            if (categoria.id_categoria === idCategoriaComercio) {
                option.selected = true;
                console.log("Categoría seleccionada:", categoria.nombre_categoria);
            }

            categoriaSelect.appendChild(option);
        });

        // Forzar la selección en el select si se encontró la categoría
        if (idCategoriaComercio) {
            categoriaSelect.value = idCategoriaComercio;
            console.log("ID de categoría seleccionado:", idCategoriaComercio);
        } else {
            console.warn("No se encontró la categoría del comercio en la lista.");
        }

        // Asignar valores al formulario
        document.getElementById("editId").value = comercio.id_comercio;
        document.getElementById("editNombre").value = comercio.nombre_comercio;
        document.getElementById("editDescripcion").value = comercio.descripcion_comercio;
        document.getElementById("editUrlGoogle").value = comercio.url_google;
        document.getElementById("editTelefono").value = comercio.telefono;
        document.getElementById("editVideo").value = comercio.video_youtube || '';

        // Verificar si el modal existe antes de abrirlo
        const modalElement = document.getElementById("Comercio_edit");
        if (!modalElement) throw new Error("El modal 'Comercio_edit' no existe en el DOM.");

        // Mostrar el modal de edición
        modalElement.style.display = "flex";

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
        url_google: document.getElementById("editUrlGoogle").value.trim(),
        telefono: document.getElementById("editTelefono").value.trim(),
        video_youtube: document.getElementById("editVideo").value.trim(),
        id_categoria: parseInt(document.getElementById("editCategoria").value, 10)
    };

    console.log("Datos que se enviarán al backend:", comercioActualizado);

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/comercios/${comercioActualizado.id_comercio}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(comercioActualizado)
        });

        console.log("Respuesta HTTP:", response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar el comercio.");
        }

        alert("Comercio actualizado con éxito!");
        closeModal();
        initDataTable();
    } catch (error) {
        console.error("Error actualizando comercio:", error);
        alert(`Error: ${error.message}`);
    }
});



const closeModal = () => {
    const modalElement = document.getElementById("Comercio_edit");
    if (modalElement) {
        modalElement.style.display = "none"; // Cerrar el modal
    }
};

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
        alert("Error al obtener los datos de Comercio");
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



// BTN SELECCIONAR COMERCIO
document.addEventListener("DOMContentLoaded", function () {
    const categoriasSelect = document.getElementById("addCategoria");

    // Llamar a la API para obtener las categorías
    fetch("https://ppt-munic.onrender.com/api/categoriascomercios/")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Recorrer los comercios y agregarlos como opciones en el select
                data.data.forEach(categoria => {
                    let option = document.createElement("option");
                    option.value = categoria.id_categoria; // Enviar el ID
                    option.textContent = categoria.nombre_categoria; // Mostrar el nombre
                    categoriasSelect.appendChild(option);
                });
            } else {
                console.error("Error al obtener categorias");
            }
        })
        .catch(error => console.error("Error en la petición:", error));
});


// Cargar y recargar la tabla al inicio
window.addEventListener("load", initDataTable, );

// MODAL
const modal = document.getElementById("Comercio_edit");
const closeModalBtn = document.querySelector(".close");

// Abrir modal solo si se hace clic en un botón de editar
function AbrirModal(id) {
    console.log("ID recibido para editar:", id); // Para verificar que solo se activa al hacer clic
    modal.style.display = "flex";
}

// Cerrar modal al hacer clic en la "X"
closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

// Cerrar modal si el usuario hace clic fuera del contenido
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};