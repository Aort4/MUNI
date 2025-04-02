let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2] },
        { orderable: false, targets: [3] },
        { searchable: true, targets: [1, 2] },
        { width: "30%", targets: [1, 2] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ninguna red social encontrada",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ninguna red social encontrada",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listRedesSociales();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

document.addEventListener("DOMContentLoaded", () => {
    initDataTable();
});

document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const redsocialId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadRedSocialData(redsocialId);
    } else if (btn.classList.contains("btn-delete")) {
        await confirmDelete(redsocialId);
    }
});

const loadRedSocialData = async (redsocialId) => {
    try {
        console.log("Ejecutando loadRedSocialData con ID:", redsocialId);

        const response = await fetch(`https://ppt-munic.onrender.com/api/redessociales/${redsocialId}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0)
            throw new Error("No se encontraron datos para esta red social.");

        const redsocial = result.data[0];

        console.log("Red Social recibida:", redsocial);

        const catResponse = await fetch("https://ppt-munic.onrender.com/api/comercios/");
        const catResult = await catResponse.json();
        if (!catResult.success) throw new Error("Error obteniendo comercios");

        console.log("Lista de comercios:", catResult.data);

        const comercioSelect = document.getElementById("editIdComercio");
        comercioSelect.innerHTML = "";

        // Buscar el ID del comercio basado en su nombre
        const comercioEncontrado = catResult.data.find(comercio => comercio.nombre_comercio === redsocial.comercio);
        const idComercioRedSocial = comercioEncontrado ? comercioEncontrado.id_comercio : null;

        catResult.data.forEach(comercio => {
            let option = document.createElement("option");
            option.value = comercio.id_comercio;
            option.textContent = comercio.nombre_comercio;

            // Marcar la opción correcta
            if (comercio.id_comercio === idComercioRedSocial) {
                option.selected = true;
            }

            comercioSelect.appendChild(option);
        });

        // Si encontramos el comercio, forzamos la selección
        if (idComercioRedSocial) {
            comercioSelect.value = idComercioRedSocial;
        }


        // Forzar actualización visual
        comercioSelect.value = idComercioRedSocial;


        document.getElementById("editId").value = redsocial.id_red_social;
        document.getElementById("editRedSocial").value = redsocial.nombre_red_social;
        document.getElementById("editEnlace").value = redsocial.enlace;

        const modalElement = document.getElementById("RedSocialModal");
        modalElement.style.display = "flex";
    } catch (error) {
        console.error("Error al cargar datos de la Red Social:", error);
    }
};

document.getElementById("producto_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const productoActualizado = {
        id_red_social: parseInt(document.getElementById("editId").value, 10),
        nombre_red_social: document.getElementById("editRedSocial").value.trim(),
        enlace: document.getElementById("editEnlace").value.trim(),
        id_comercio: parseInt(document.getElementById("editIdComercio").value, 10)
    };

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/redessociales/${productoActualizado.id_red_social}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar la red social.");
        }

        alert("Red social actualizada con éxito!");

        document.getElementById("RedSocialModal").style.display = "none";
        initDataTable();
    } catch (error) {
        console.error("Error actualizando red social:", error);
        alert(`Error: ${error.message}`);
    }
});

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("RedSocialModal").style.display = "none";
});


const listRedesSociales = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/redessociales/");
        const data = await response.json();


        document.getElementById("tableBody_users").innerHTML = data.data.map((redsocial, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${redsocial.nombre_red_social}</td>
        <td>${redsocial.enlace}</td>
        <td>${redsocial.comercio}</td>
        <td>
            <button class="btn btn-sm btn-primary btn-edit" data-id="${redsocial.id_red_social}">
                <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${redsocial.id_red_social}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </td>
    </tr>
`).join("");

        // Asignar eventos a los botones de edición
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

document.addEventListener("DOMContentLoaded", function () {
    // Obtener el ID y Nombre del comercio desde el localStorage
    const idComercio = localStorage.getItem("id_comercio");
    const nombreComercio = localStorage.getItem("nombre_comercio");

    // Verificar si los datos existen en el localStorage
    if (idComercio && nombreComercio) {
        // Asignar el nombre del comercio al campo de entrada readonly
        document.getElementById("nombreComercio").value = nombreComercio;  // Asignamos el nombre al campo de entrada
        document.getElementById("idComercio").value = idComercio;  // Asignamos el ID al campo oculto
    } else {
        alert("No se encontró información del comercio.");
    }
});

// Post para agregar Red Social
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addForm");

    // Obtener el ID y Nombre del comercio desde el localStorage
    const idComercio = localStorage.getItem("id_comercio");
    const nombreComercio = localStorage.getItem("nombre_comercio");

    // Verificar si los datos existen en el localStorage
    if (idComercio && nombreComercio) {
        // Mostrar el nombre del comercio en el formulario
        document.getElementById("nombreComercio").textContent = nombreComercio;
        document.getElementById("idComercio").value = idComercio;  // Asignar el ID al campo oculto
    } else {
        alert("No se encontró información del comercio.");
    }

    // Evento para enviar el formulario
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Capturar datos del formulario
        const datos = {
            nombre_red_social: document.getElementById("addRedSocial").value.trim(),
            enlace: document.getElementById("addEnlace").value.trim(),
            id_comercio: parseInt(document.getElementById("idComercio").value, 10) // Convertir a entero
        };

        // Validaciones
        if (!datos.nombre_red_social || !datos.enlace || !datos.id_comercio) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        // Validar enlace
        const enlaceRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!enlaceRegex.test(datos.enlace)) {
            alert("Por favor, ingrese un enlace válido.");
            return;
        }

        try {
            const response = await fetch("https://ppt-munic.onrender.com/api/redessociales/", {
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
                initDataTable(); // Recarga la tabla para mostrar el nuevo registro
            } else if (result.error) {
                alert("❌ " + result.error);
            } else {
                alert("⚠️ Respuesta inesperada del servidor.");
            }

        } catch (error) {
            console.error("❌ Error al agregar la red social:", error);
            alert("❌ Error desconocido al agregar la red social.");
        }
    });
});


const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta Red Social?")) return;

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/redessociales/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error eliminando la Red Social");
        }

        alert("✅ Red Social eliminada correctamente");
        initDataTable(); // Recargar la tabla después de eliminar

    } catch (error) {
        console.error("❌ Error eliminando Red Social:", error);
        alert("❌ " + error.message);
    }
};


// MODAL
const modal = document.getElementById("RedSocialModal");
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

// ✅ Asegurar que los botones de editar solo abran el modal cuando se haga clic
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-edit");
    if (btn) {
        const id = btn.getAttribute("data-id");
        AbrirModal(id); // Solo se ejecuta cuando se da clic en el botón de editar
    }
});


