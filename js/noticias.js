let dataTableNoticia;
let dataTableNoticiaIsInitialized = false;

const dataTableOptionsNoticia = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3, 4] }, // Centrar columnas
        { orderable: false, targets: [4] }, // Deshabilitar orden en "Opciones"
        { searchable: true, targets: [1, 2] }, // Habilitar búsqueda en "Título" y "Contenido"
        { width: "40%", targets: [1] }, // Ajustar ancho de "Título"
        { width: "30%", targets: [2] }  // Ajustar ancho de "Contenido"
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontró ninguna noticia",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "No se encontraron noticias",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

const initDataTableNoticia = async () => {
    if (dataTableNoticiaIsInitialized) dataTableNoticia.destroy();

    await listNoticias(); // Esperar a que se carguen los datos

    dataTableNoticia = $("#datatable_users").DataTable(dataTableOptionsNoticia);
    dataTableNoticiaIsInitialized = true;
};

document.addEventListener("DOMContentLoaded", initDataTableNoticia);


document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const noticiaId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadNoticiaData(noticiaId);
    } else if (btn.classList.contains("btn-delete")) {
        console.log("Botón Eliminar clickeado, ID de la noticia:", noticiaId);
        await confirmDelete(noticiaId);
    }
});


const listNoticias = async () => {
    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/noticias/");
        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error("Los datos recibidos no son válidos");
        }

        const tbody = document.getElementById("tableBody_users");
        tbody.innerHTML = data.data.map((noticia, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${noticia.titulo}</td>
                <td>${noticia.contenido}</td>
                <td>${formatDate(noticia.fecha_publicacion)}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${noticia.id_noticia}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${noticia.id_noticia}">
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


const formatDate = (date) => {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "Fecha no válida";

    const day = newDate.getDate().toString().padStart(2, '0');
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const year = newDate.getFullYear();
    return `${day}/${month}/${year}`;
};

const idUsuario = localStorage.getItem("idusuario");
if (!idUsuario) {
    alert("⚠ No has iniciado sesión. Serás redirigido a la página de login.");
    window.location.href = "login.html"; // Redirigir si no hay sesión iniciada
}

document.getElementById("addForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const titulo = document.getElementById("addTitulo").value.trim();
    const contenido = document.getElementById("addContenido").value.trim();
    const fecha = document.getElementById("addFecha").value.trim();
    const idUsuario = localStorage.getItem("idusuario"); // Recuperar el ID

    if (!titulo || !contenido || !fecha || !idUsuario) {
        alert("❌ Todos los campos son obligatorios.");
        return;
    }

    const nuevaNoticia = {
        titulo,
        contenido,
        fecha_publicacion: new Date(fecha).toISOString().slice(0, 19).replace("T", " "),
        id_usuario: Number(idUsuario)
    };

    try {
        const response = await fetch("https://ppt-munic.onrender.com/api/noticias/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaNoticia)
        });

        if (!response.ok) throw new Error("Error al crear la noticia");

        alert("✅ Noticia creada con éxito!");
        closeModal();
        initDataTableNoticia();
    } catch (error) {
        console.error("❌ Error al agregar noticia:", error);
        alert("❌ " + error.message);
    }
});

const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/noticias/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error eliminando la noticia");
        }

        alert("✅ Noticia eliminada correctamente");

        // Recargar la tabla después de eliminar (usando la función correcta)
        await initDataTableNoticia();  // Llamar a la función correcta para recargar la tabla de noticias

    } catch (error) {
        console.error("❌ Error eliminando noticia:", error);
        alert("❌ " + error.message);
    }
};

const loadNoticiaData = async (noticiaId) => {
    try {
        console.log("Ejecutando loadNoticiaData con ID:", noticiaId);

        const response = await fetch(`https://ppt-munic.onrender.com/api/noticias/${noticiaId}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            throw new Error("No se encontraron datos para esta noticia.");
        }

        const noticia = result.data[0];

    
        const editId = document.getElementById("editId");
        const editTitulo = document.getElementById("editTitulo");
        const editContenido = document.getElementById("editContenido");
        const editFecha = document.getElementById("editFecha");

        if (!editId || !editTitulo || !editContenido || !editFecha) {
            console.error("No se encontraron los elementos del formulario en el DOM.");
            return;
        }

      
        editId.value = noticia.id_noticia;
        editTitulo.value = noticia.titulo;
        editContenido.value = noticia.contenido;
        editFecha.value = noticia.fecha_publicacion.split("T")[0]; 

      
        const modalElement = document.getElementById("noticiaModal");
        if (!modalElement) throw new Error("El modal 'noticiaModal' no existe en el DOM.");

        modalElement.style.display = "flex"; 

    } catch (error) {
        console.error("Error al cargar datos de la noticia:", error);
    }
};

document.getElementById("noticia_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const idUsuario = localStorage.getItem("idusuario"); 
    if (!idUsuario) {
        alert("⚠ No tienes permiso para editar noticias. Inicia sesión.");
        return;
    }

    const idNoticia = document.getElementById("editId").value;
    const titulo = document.getElementById("editTitulo").value.trim();
    const contenido = document.getElementById("editContenido").value.trim();
    const fecha = document.getElementById("editFecha").value.trim();


    if (!titulo || !contenido || !fecha) {
        alert("❌ Todos los campos son obligatorios.");
        return;
    }

    const noticiaActualizada = {
        id_noticia: idNoticia,
        titulo,
        contenido,
        fecha_publicacion: fecha,
        id_usuario: Number(idUsuario) 
    };

    try {
        const response = await fetch(`https://ppt-munic.onrender.com/api/noticias/${idNoticia}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(noticiaActualizada)
        });

        if (!response.ok) throw new Error("Error actualizando noticia");

        alert("✅ Noticia actualizada con éxito!");

        closeModal();
        initDataTableNoticia();

    } catch (error) {
        console.error("Error actualizando noticia:", error);
        alert("❌ " + error.message);
    }
});


// Cerrar modal
const closeModal = () => {
    const modalElement = document.getElementById("noticiaModal");
    if (modalElement) {
        modalElement.style.display = "none";
    }
};

// Cerrar modal al hacer clic en "X"
document.querySelector(".close").onclick = function () {
    closeModal();
};

// Cerrar modal si se hace clic fuera del contenido
window.onclick = function (event) {
    if (event.target === document.getElementById("noticiaModal")) {
        closeModal();
    }
};


