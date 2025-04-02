let dataTable;
let dataTableIsInitialized = false;

// CONFIGURACIÓN GENERAL DATATABLE
const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3] },
        { orderable: false, targets: [4] },
        { searchable: true, targets: [1, 2] },
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún producto encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún producto encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

// ===================== FUNCIONES ===================== //

function initDataTable() {
    if (dataTableIsInitialized) dataTable.destroy();
    document.getElementById("tableBody_users").innerHTML = "";
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
}

async function cargarComercios() {
    const comerciosSelect = document.getElementById("idComercio");
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/comercios/");
        const data = await response.json();
        if (data.success) {
            data.data.forEach(comercio => {
                let option = document.createElement("option");
                option.value = comercio.id_comercio;
                option.textContent = comercio.nombre_comercio;
                comerciosSelect.appendChild(option);
            });
        } else {
            console.error("Error al obtener comercios");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

// ===================== CREAR IMAGEN (POST) ===================== //
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addForm");
    const btnGuardar = document.getElementById("btn");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Subiendo...";

        try {
            const idComercio = document.getElementById("idComercio").value;
            const imageInput = document.getElementById("imageInput");
            const files = imageInput.files;

            if (!idComercio) {
                alert("⚠️ Debes seleccionar un comercio válido.");
                return;
            }

            if (files.length === 0) {
                alert("⚠️ Debes seleccionar al menos una imagen.");
                return;
            }

            if (files.length > 8) {
                alert("⚠️ Solo puedes subir un máximo de 8 imágenes.");
                return;
            }

            const formData = new FormData();
            formData.append("id_comercio", idComercio);

            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
            }

            const response = await fetch("https://ppt-munic.onrender.com/api/albumComercio/", {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Error al registrar las imágenes");
            }

            alert("✅ Imágenes subidas correctamente");
            form.reset();
            btnGuardar.textContent = "Guardar";

            // Refrescar tabla si hay un comercio seleccionado
            listAlbumComercio(idComercio);

        } catch (error) {
            console.error("❌ Error al subir las imágenes:", error);
            alert("❌ " + error.message);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar";
        }
    });
});


async function listAlbumComercio(id_comercio) {
    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/albumComercio/comercio/${id_comercio}`);
        const result = await response.json();

        if (!result.success) {
            alert("⚠️ " + result.message);
            return;
        }

        const data = result.data;

        // Limpiar tabla y agregar filas con DataTables API
        const table = $("#datatable_users").DataTable();
        table.clear();

        data.forEach((imagen, index) => {
            table.row.add([
                index + 1,
                imagen.nombre_imagen,
                `<img 
                    src="data:${imagen.tipo_imagen};base64,${arrayBufferToBase64(imagen.datos_imagen.data)}" 
                    alt="${imagen.nombre_imagen}" 
                    class="thumbnail-img"
                    data-full="data:${imagen.tipo_imagen};base64,${arrayBufferToBase64(imagen.datos_imagen.data)}"
                    style="width: 80px; height: auto; border-radius: 5px; cursor: pointer;" 
                />`,
                imagen.nombre_comercio,
                `
                <button class="btn btn-sm btn-primary btn-edit" data-id="${imagen.id_imagen}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${imagen.id_imagen}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                `
            ]);
        });

        table.draw();

        // Reactivar miniaturas después del draw
        activarMiniaturas();

    } catch (ex) {
        console.error("Error:", ex);
        alert("❌ Error al obtener las imágenes del comercio");
    }
}

function activarMiniaturas() {
    document.querySelectorAll(".thumbnail-img").forEach(img => {
        img.addEventListener("click", () => {
            const fullImage = img.getAttribute("data-full");
            document.getElementById("previewImg").src = fullImage;
            modalPreview.classList.remove("fade-out");
            modalPreview.style.display = "flex";
        });
    });
}

// CONVERTIR IMAGENES
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// OPCIONES DEL MODAL DE PREVISUALIZACION
function setupModalPreview() {
    const closeModalPreview = document.getElementById("closeModalPreview");
    closeModalPreview.onclick = function () {
        modalPreview.classList.add("fade-out");
        setTimeout(() => { modalPreview.style.display = "none"; }, 300);
    };
    modalPreview.addEventListener("click", function (event) {
        if (event.target === modalPreview) {
            modalPreview.classList.add("fade-out");
            setTimeout(() => { modalPreview.style.display = "none"; }, 300);
        }
    });
}

// ===================== INICIALIZACIÓN ===================== //

document.addEventListener("DOMContentLoaded", function () {
    initDataTable();
    cargarComercios();
    setupModalPreview();

    document.getElementById("btnCargarImagenes").addEventListener("click", function () {
        const idComercio = document.getElementById("idComercio").value;
        if (!idComercio) {
            alert("⚠️ Debes seleccionar un comercio primero.");
            return;
        }
        listAlbumComercio(idComercio);
    });
});

// =============================EDITAR=================================//

// ESCUCHAR CLIC EN BOTONES (Editar y Eliminar)
document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const imagenId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadImagenData(imagenId);
    } else if (btn.classList.contains("btn-delete")) {
        await confirmDelete(imagenId);
    }
});

// CARGAR DATOS EN MODAL PARA EDITAR
const loadImagenData = async (imagenId) => {
    try {
        console.log("Cargando datos de imagen ID:", imagenId);

        // Obtener la imagen por ID
        const response = await fetch(`https://ppt-munic.onrender.com/api/albumComercio/${imagenId}`);
        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontró la imagen.");

        const imagen = result.data[0];

        // Obtener comercios disponibles
        const catResponse = await fetch("https://ppt-munic.onrender.com/api/comercios/");
        const catResult = await catResponse.json();
        if (!catResult.success) throw new Error("Error obteniendo comercios");

        const comercioSelect = document.getElementById("editIdComercio");
        comercioSelect.innerHTML = "";

        // Seleccionar comercio actual de la imagen
        catResult.data.forEach(comercio => {
            let option = document.createElement("option");
            option.value = comercio.id_comercio;
            option.textContent = comercio.nombre_comercio;
            if (comercio.id_comercio === imagen.id_comercio) {
                option.selected = true;
            }
            comercioSelect.appendChild(option);
        });

        // Set ID oculto
        document.getElementById("editId").value = imagen.id_imagen;

        // Mostrar modal
        modal.style.display = "flex";

    } catch (error) {
        console.error("Error al cargar datos de la imagen:", error);
    }
};

// Submit del formulario de edición
document.getElementById("producto_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const id_imagen = document.getElementById("editId").value;
    const id_comercio = document.getElementById("editIdComercio").value;
    const fileInput = document.getElementById("editImagen");

    // Crear FormData para enviar imagen + comercio
    const formData = new FormData();
    formData.append("id_comercio", id_comercio);

    // Adjuntar imagen solo si el usuario seleccionó una nueva imagen
    if (fileInput.files.length > 0) {
        formData.append("files", fileInput.files[0]);
    }

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/albumComercio/${id_imagen}`, {
            method: "PUT",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Error inesperado al actualizar");
        }

        alert("✅ Imagen/comercio actualizado correctamente");
        closeModal();
        initDataTable();

    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("❌ Error al actualizar: " + error.message);
    }
});

// Cerrar modal personalizado
const closeModal = () => {
    const modalElement = document.getElementById("productoModal");
    if (modalElement) {
        modalElement.style.display = "none";
    }
};


// MODAL de edición
const modal = document.getElementById("productoModal");
const closeModalBtn = document.querySelector(".close");
closeModalBtn.onclick = closeModal;
window.onclick = function (event) {
    if (event.target === modal) {
        closeModal();
    }
};

// ===================== ELIMINAR IMAGEN ===================== //
const confirmDelete = async (id_imagen) => {
    const confirmacion = confirm("¿Estás seguro de eliminar esta imagen?");
    if (!confirmacion) return;

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/albumComercio/${id_imagen}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Error inesperado al eliminar");
        }

        alert("✅ Imagen eliminada correctamente");

        // Recargar la tabla actual según el comercio seleccionado
        const idComercio = document.getElementById("idComercio").value;
        if (idComercio) {
            await listAlbumComercio(idComercio);
        } else {
            initDataTable();
        }

    } catch (error) {
        console.error("Error al eliminar imagen:", error);
        alert("❌ Error al eliminar: " + error.message);
    }
};