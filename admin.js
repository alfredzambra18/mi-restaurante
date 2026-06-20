// ==========================================
// CONFIGURACIÓN DE SEGURIDAD
// ==========================================

let datosCompletos = null;
let sesionIniciada = false;

// ==========================================
// FUNCIÓN: Cargar contraseña desde data.json
// ==========================================
async function obtenerPasswordGuardada() {
    try {
        const respuesta = await fetch('data.json');
        const datos = await respuesta.json();
        
        if (datos.password) {
            return datos.password;
        } else {
            return 'admin123';
        }
    } catch (error) {
        console.error('Error al leer contraseña:', error);
        return 'admin123';
    }
}

// ==========================================
// FUNCIÓN: Iniciar sesión
// ==========================================
async function iniciarSesion() {
    const passwordIngresada = document.getElementById('passwordInput').value;
    const errorLogin = document.getElementById('errorLogin');
    
    const passwordCorrecta = await obtenerPasswordGuardada();
    
    if (passwordIngresada === passwordCorrecta) {
        sesionIniciada = true;
        document.getElementById('loginPantalla').style.display = 'none';
        document.getElementById('panelPrincipal').style.display = 'block';
        document.getElementById('errorLogin').style.display = 'none';
        
        cargarDatosAdmin();
        
        console.log('✅ Sesión iniciada correctamente');
    } else {
        errorLogin.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
        
        console.log('❌ Intento de acceso fallido');
    }
}

// ==========================================
// FUNCIÓN: Cerrar sesión
// ==========================================
function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sesionIniciada = false;
        document.getElementById('loginPantalla').style.display = 'block';
        document.getElementById('panelPrincipal').style.display = 'none';
        document.getElementById('passwordInput').value = '';
        
        document.getElementById('passwordActual').value = '';
        document.getElementById('passwordNueva').value = '';
        document.getElementById('passwordConfirmar').value = '';
        
        console.log('👋 Sesión cerrada');
    }
}

// ==========================================
// FUNCIÓN: Cambiar contraseña (NUEVA)
// ==========================================
async function cambiarPassword() {
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    
    const passwordGuardada = await obtenerPasswordGuardada();
    
    if (passwordActual !== passwordGuardada) {
        alert('❌ La contraseña actual es incorrecta');
        document.getElementById('passwordActual').value = '';
        document.getElementById('passwordActual').focus();
        return;
    }
    
    if (passwordNueva.length < 6) {
        alert('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
        document.getElementById('passwordNueva').focus();
        return;
    }
    
    if (passwordNueva !== passwordConfirmar) {
        alert('⚠️ Las contraseñas nuevas no coinciden');
        document.getElementById('passwordConfirmar').value = '';
        document.getElementById('passwordConfirmar').focus();
        return;
    }
    
    if (passwordNueva === passwordActual) {
        alert('⚠️ La nueva contraseña debe ser diferente a la actual');
        document.getElementById('passwordNueva').value = '';
        document.getElementById('passwordConfirmar').value = '';
        document.getElementById('passwordNueva').focus();
        return;
    }
    
    datosCompletos.password = passwordNueva;
    guardarCambios();
    
    document.getElementById('passwordActual').value = '';
    document.getElementById('passwordNueva').value = '';
    document.getElementById('passwordConfirmar').value = '';
    
    mostrarMensajeExito();
    alert('✅ ¡Contraseña cambiada exitosamente!\n\n' +
          '🔑 Tu nueva contraseña es: ' + passwordNueva + '\n\n' +
          '⚠️ No la olvides. Si la pierdes, tendrás que editar el archivo data.json manualmente.');
    
    console.log('🔒 Contraseña actualizada correctamente');
}

// ==========================================
// FUNCIÓN: Cargar datos en el panel
// ==========================================
async function cargarDatosAdmin() {
    try {
        const respuesta = await fetch('data.json');
        datosCompletos = await respuesta.json();
        
        llenarFormularios();
        llenarCategorias();
        mostrarTablaPlatos();
        
        document.getElementById('nombreRestAdmin').textContent = 
            `Administrando: ${datosCompletos.informacion_restaurante.nombre}`;
        
        console.log('✅ Datos cargados en panel admin');
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        alert('Error al cargar los datos. Verifica que data.json exista.');
    }
}

// ==========================================
// FUNCIÓN: Llenar formularios con datos actuales
// ==========================================
function llenarFormularios() {
    const info = datosCompletos.informacion_restaurante;
    
    document.getElementById('editNombre').value = info.nombre;
    document.getElementById('editLogo').value = info.logo_emoji;
    document.getElementById('editWhatsApp').value = info.whatsapp;
    document.getElementById('editDireccion').value = info.direccion;
    document.getElementById('editHorario').value = info.horario;
    document.getElementById('editMensaje').value = info.mensaje_bienvenida;
    document.getElementById('editTasa').value = datosCompletos.tasa_dolar_bcv;
}

// ==========================================
// FUNCIÓN: Llenar selector de categorías
// ==========================================
function llenarCategorias() {
    const selectCategoria = document.getElementById('nuevoCategoria');
    
    selectCategoria.innerHTML = '<option value="">Seleccionar categoría...</option>';
    
    datosCompletos.categorias.forEach(categoria => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

// ==========================================
// FUNCIÓN: Mostrar tabla de platos
// ==========================================
function mostrarTablaPlatos() {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    
    if (datosCompletos.menu.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">📋 No hay platos en el menú</td></tr>';
        return;
    }
    
    cuerpoTabla.innerHTML = datosCompletos.menu.map(plato => `
        <tr>
            <td><strong>#${plato.numero}</strong></td>
            <td>${plato.nombre}</td>
            <td>${plato.categoria}</td>
            <td><strong>$${plato.precio_dolares.toFixed(2)}</strong></td>
            <td>
                <span class="${plato.disponible ? 'estado-disponible' : 'estado-agotado'}">
                    ${plato.disponible ? '✅ Disponible' : '❌ Agotado'}
                </span>
            </td>
            <td>
                ${plato.mas_vendido ? '<span class="badge-destacado">⭐ Destacado</span>' : '-'}
            </td>
            <td>
                <button class="boton-eliminar" onclick="eliminarPlato(${plato.numero})" title="Eliminar plato">
                    🗑️
                </button>
                <button class="boton-guardar" 
                        style="padding: 0.3rem 0.8rem; font-size: 0.8rem; margin-left: 0.3rem;"
                        onclick="alternarDisponible(${plato.numero})"
                        title="${plato.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}">
                    ${plato.disponible ? '❌ Agotar' : '✅ Activar'}
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// FUNCIÓN: Guardar datos del restaurante
// ==========================================
function guardarDatosRestaurante() {
    datosCompletos.informacion_restaurante.nombre = document.getElementById('editNombre').value;
    datosCompletos.informacion_restaurante.logo_emoji = document.getElementById('editLogo').value;
    datosCompletos.informacion_restaurante.whatsapp = document.getElementById('editWhatsApp').value;
    datosCompletos.informacion_restaurante.direccion = document.getElementById('editDireccion').value;
    datosCompletos.informacion_restaurante.horario = document.getElementById('editHorario').value;
    datosCompletos.informacion_restaurante.mensaje_bienvenida = document.getElementById('editMensaje').value;
    
    guardarCambios();
    mostrarMensajeExito();
}

// ==========================================
// FUNCIÓN: Actualizar tasa del dólar
// ==========================================
function actualizarTasa() {
    const nuevaTasa = parseFloat(document.getElementById('editTasa').value);
    
    if (isNaN(nuevaTasa) || nuevaTasa <= 0) {
        alert('⚠️ Por favor ingresa una tasa válida (mayor a 0)');
        return;
    }
    
    datosCompletos.tasa_dolar_bcv = nuevaTasa;
    guardarCambios();
    mostrarMensajeExito();
    
    console.log(`💵 Tasa actualizada: ${nuevaTasa} Bs/USD`);
}

// ==========================================
// FUNCIÓN: Agregar nuevo plato
// ==========================================
function agregarNuevoPlato() {
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const categoria = document.getElementById('nuevoCategoria').value;
    const precio = parseFloat(document.getElementById('nuevoPrecio').value);
    const descripcion = document.getElementById('nuevoDescripcion').value.trim();
    const foto = document.getElementById('nuevoFoto').value.trim();
    const disponible = document.getElementById('nuevoDisponible').checked;
    const destacado = document.getElementById('nuevoDestacado').checked;
    
    if (!nombre) {
        alert('⚠️ El nombre del plato es obligatorio');
        return;
    }
    
    if (!categoria) {
        alert('⚠️ Selecciona una categoría');
        return;
    }
    
    if (isNaN(precio) || precio <= 0) {
        alert('⚠️ Ingresa un precio válido (mayor a 0)');
        return;
    }
    
    if (!descripcion) {
        alert('⚠️ La descripción es obligatoria');
        return;
    }
    
    const fotoFinal = foto || 'https://via.placeholder.com/400x200?text=🍽️+Sin+Foto';
    
    const numeroMaximo = datosCompletos.menu.length > 0 
        ? Math.max(...datosCompletos.menu.map(p => p.numero)) 
        : 0;
    
    const nuevoPlato = {
        numero: numeroMaximo + 1,
        nombre: nombre,
        categoria: categoria,
        descripcion: descripcion,
        precio_dolares: precio,
        foto: fotoFinal,
        disponible: disponible,
        mas_vendido: destacado
    };
    
    datosCompletos.menu.push(nuevoPlato);
    guardarCambios();
    mostrarTablaPlatos();
    limpiarFormularioPlato();
    mostrarMensajeExito();
    
    console.log('✅ Plato agregado:', nuevoPlato.nombre);
}

// ==========================================
// FUNCIÓN: Eliminar plato
// ==========================================
function eliminarPlato(numeroPlato) {
    const plato = datosCompletos.menu.find(p => p.numero === numeroPlato);
    
    if (!plato) return;
    
    if (confirm(`¿Estás seguro de eliminar "${plato.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`)) {
        datosCompletos.menu = datosCompletos.menu.filter(p => p.numero !== numeroPlato);
        guardarCambios();
        mostrarTablaPlatos();
        mostrarMensajeExito();
        
        console.log('🗑️ Plato eliminado:', plato.nombre);
    }
}

// ==========================================
// FUNCIÓN: Alternar disponible/agotado
// ==========================================
function alternarDisponible(numeroPlato) {
    const plato = datosCompletos.menu.find(p => p.numero === numeroPlato);
    
    if (plato) {
        plato.disponible = !plato.disponible;
        guardarCambios();
        mostrarTablaPlatos();
        mostrarMensajeExito();
        
        console.log(`🔄 ${plato.nombre}: ${plato.disponible ? 'Disponible' : 'Agotado'}`);
    }
}

// ==========================================
// FUNCIÓN: Limpiar formulario de nuevo plato
// ==========================================
function limpiarFormularioPlato() {
    document.getElementById('nuevoNombre').value = '';
    document.getElementById('nuevoCategoria').value = '';
    document.getElementById('nuevoPrecio').value = '';
    document.getElementById('nuevoDescripcion').value = '';
    document.getElementById('nuevoFoto').value = '';
    document.getElementById('nuevoDisponible').checked = true;
    document.getElementById('nuevoDestacado').checked = false;
}

// ==========================================
// FUNCIÓN: Mostrar mensaje de éxito temporal
// ==========================================
function mostrarMensajeExito() {
    const mensaje = document.getElementById('mensajeExito');
    mensaje.style.display = 'block';
    mensaje.style.animation = 'none';
    mensaje.offsetHeight;
    mensaje.style.animation = 'desvanecer 3s forwards';
}

// ==========================================
// FUNCIÓN: Guardar cambios descargando data.json
// ==========================================
function guardarCambios() {
    const jsonString = JSON.stringify(datosCompletos, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'data.json';
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('restaurante_backup', jsonString);
    
    console.log('💾 Cambios guardados exitosamente');
}

// ==========================================
// EVENTO: Permitir login con tecla Enter
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                iniciarSesion();
            }
        });
    }
});

// ==========================================
// MENSAJES EN CONSOLA
// ==========================================
console.log('👨‍🍳 Panel de Administración listo');
console.log('🔑 La contraseña se lee desde data.json');
console.log('💡 Si olvidas la contraseña, edita data.json y cambia el campo "password"');