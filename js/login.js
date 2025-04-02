/*===== FOCUS =====*/
const inputs = document.querySelectorAll(".form__input")
const user = document.getElementById('usuario');
const pass = document.getElementById('password');

/*=== Add focus ===*/
function addfocus(){
    let parent = this.parentNode.parentNode
    parent.classList.add("focus")
}

/*=== Remove focus ===*/
function remfocus(){
    let parent = this.parentNode.parentNode
    if(this.value == ""){
        parent.classList.remove("focus")
    }
}

/*=== To call function===*/
inputs.forEach(input=>{
    input.addEventListener("focus",addfocus)
    input.addEventListener("blur",remfocus)
})







// Función para validar los campos del login
function validarCamposLogin() {
  if (user.value === "" || pass.value === "") {
    alert("Por favor, completa todos los campos.");
    return false;
  }
  return true;
}

// Función para validar los campos de registro
function validarCamposRegistro() {
  if (user.value === "" || pass.value === "") {
    alert("Por favor, completa todos los campos.");
    return false;
  }
  return true;
}

const Button = document.getElementById('btnlogin');

// Login
Button.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!validarCamposLogin()) return;

  // Encriptar la contraseña
 // const contraseñaEncriptada = CryptoJS.SHA256(contraseña).toString();

  const requestOptions = {
    method: "POST", // Ahora es un POST para enviar las credenciales
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: user.value, password: pass.value }),
    redirect: "follow",
    credentials: 'include'
  };

  try {
    const response = await fetch('https://ppt-munic.onrender.com/api/usuarios/login', requestOptions);
    const result = await response.json();
    console.log(result.user)
    if (result.message == "Inicio Exitoso.") {
      // Si el login es exitoso, guardamos el token en localStorage
      localStorage.setItem('idusuario', result.user.id_usuario
      ); 
      window.location.href = 'index.html'; // Redirigir al dashboard
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  } catch (error) {
    console.error("Error en el login:", error);
    alert("Hubo un error al iniciar sesión. Intenta nuevamente.");
  }
});


// Registro
// registerButton.addEventListener('click', async (e) => {
//   e.preventDefault();
//   if (!validarCamposRegistro()) return;

//   const usuario = document.querySelector('#registro-usuario').value;
//   const contraseña = document.querySelector('#registro-password').value;

//   // Encriptar la contraseña
//   const contraseñaEncriptada = CryptoJS.SHA256(contraseña).toString();

//   const registerOptions = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ usuario, contraseña: contraseñaEncriptada }),
//     redirect: "follow"
//   };

//   try {
//     const response = await fetch('http://localhost:3000/api/usuarios/register', registerOptions);
//     const data = await response.json();

//     if (data.success) {
//       alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
//       container.classList.remove("sign-up-mode");
//     } else {
//       alert("Hubo un error al crear la cuenta. Intenta nuevamente.");
//     }
//   } catch (error) {
//     console.error("Error en el registro:", error);
//     alert("Hubo un error al registrar la cuenta.");
//   }
// });
