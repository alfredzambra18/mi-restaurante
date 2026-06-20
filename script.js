// ==========================================
// VARIABLES GLOBALES
// ==========================================
// Son como cajas donde guardamos información que usaremos en todo el programa

let menuCompleto = [];        // Aquí guardaremos todos los platos
let carrito = [];             // Aquí guardamos lo que el cliente pide
let tasaDolar = 0;            // El valor del dólar en bolívares
let datosRestaurante = {};    // Info del restaurante (nombre, whatsapp, etc.)
let categoriaActual = 'todas'; // Para saber qué categoría está seleccionada

// ==========================================
// FUNCIÓN: Cargar datos al iniciar la página
// ==========================================
// Esto se ejecuta automáticamente cuando la página abre

async function cargarDatosIniciales() {
    try {
        // Intentamos leer el archivo data.json
        const respuesta = await fetch('data.json');
        const datos = await respuesta.json();
        
        // Guardamos todo en nuestras variables globales
        menuCompleto = datos.menu;
        tasaDolar = datos.tasa_dolar_bcv;
        datosRestaurante = datos.informacion_restaurante;
        
        // Actualizamos la información que se ve en pantalla
        actualizarInfoRestaurante();
        
        // Creamos los botones de categorías
        crearBotonesCategorias(datos.categorias);
        
        // Mostramos todos los platos
        mostrarPlatos(menuCompleto);
        
        console.log('✅ Datos cargados exitosamente');
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        // Si hay error, mostramos un mensaje
        document.getElementById('contenedorMenu').innerHTML = 
            '<div class="cargando">😕 Error al cargar el menú. Por favor recarga la página.</div>';
    }
}

// ==========================================
// FUNCIÓN: Mostrar info del restaurante
// ==========================================
function actualizarInfoRestaurante() {
    // Cambiamos el nombre en el encabezado
    document.getElementById('nombreRestaurante').textContent = datosRestaurante.nombre;
    
    // Cambiamos el logo (emoji)
    document.getElementById('logoRestaurante').textContent = datosRestaurante.logo_emoji;
    
    // Mostramos la dirección
    document.getElementById('direccionRestaurante').textContent = datosRestaurante.direccion;
    
    // Mostramos la tasa del dólar
    document.getElementById('tasaValor').textContent = tasaDolar.toFixed(2);
    
    // Información del pie de página
    document.getElementById('infoPie').textContent = 
        `${datosRestaurante.nombre} | ${datosRestaurante.direccion} | ${datosRestaurante.horario}`;
    
    // Cambiamos el título de la pestaña
    document.title = `🍽️ ${datosRestaurante.nombre} - Menú Digital`;
}

// ==========================================
// FUNCIÓN: Crear botones de categorías
// ==========================================
function crearBotonesCategorias(categorias) {
    const contenedor = document.getElementById('botonesCategorias');
    
    // Limpiamos lo que haya
    contenedor.innerHTML = '';
    
    // Botón "Todos" (siempre está seleccionado al inicio)
    const botonTodos = document.createElement('button');
    botonTodos.className = 'boton-categoria activo';
    botonTodos.textContent = '📋 Todos';
    botonTodos.onclick = () => filtrarPorCategoria('todas', botonTodos);
    contenedor.appendChild(botonTodos);
    
    // Creamos un botón por cada categoría
    categorias.forEach(categoria => {
        const boton = document.createElement('button');
        boton.className = 'boton-categoria';
        boton.textContent = categoria;
        boton.onclick = () => filtrarPorCategoria(categoria, boton);
        contenedor.appendChild(boton);
    });
}

// ==========================================
// FUNCIÓN: Filtrar platos por categoría
// ==========================================
function filtrarPorCategoria(categoria, botonSeleccionado) {
    // Guardamos la categoría actual
    categoriaActual = categoria;
    
    // Quitamos la clase 'activo' de todos los botones
    document.querySelectorAll('.boton-categoria').forEach(boton => {
        boton.classList.remove('activo');
    });
    
    // Ponemos 'activo' solo al botón seleccionado
    botonSeleccionado.classList.add('activo');
    
    // Filtramos los platos
    let platosFiltrados;
    if (categoria === 'todas') {
        platosFiltrados = menuCompleto;
    } else {
        platosFiltrados = menuCompleto.filter(plato => plato.categoria === categoria);
    }
    
    // También aplicamos el filtro de búsqueda si hay algo escrito
    const textoBusqueda = document.getElementById('buscarPlato').value.toLowerCase();
    if (textoBusqueda) {
        platosFiltrados = platosFiltrados.filter(plato => 
            plato.nombre.toLowerCase().includes(textoBusqueda) ||
            plato.descripcion.toLowerCase().includes(textoBusqueda)
        );
    }
    
    // Mostramos los platos filtrados
    mostrarPlatos(platosFiltrados);
}

// ==========================================
// FUNCIÓN: Mostrar platos en pantalla
// ==========================================
function mostrarPlatos(platos) {
    const contenedor = document.getElementById('contenedorMenu');
    
    // Si no hay platos, mostramos mensaje
    if (platos.length === 0) {
        contenedor.innerHTML = '<div class="cargando">😕 No hay platos disponibles</div>';
        return;
    }
    
    // Limpiamos el contenedor
    contenedor.innerHTML = '';
    
    // Creamos una tarjeta por cada plato
    platos.forEach(plato => {
        const precioBolivares = (plato.precio_dolares * tasaDolar).toFixed(2);
        
        const tarjeta = document.createElement('div');
        tarjeta.className = 'plato-tarjeta';
        
        // Si no está disponible, añadimos clase especial
        if (!plato.disponible) {
            tarjeta.classList.add('plato-agotado');
        }
        
        tarjeta.innerHTML = `
            ${plato.mas_vendido ? '<div class="etiqueta-destacado">⭐ Más Vendido</div>' : ''}
            ${!plato.disponible ? '<div class="etiqueta-agotado">AGOTADO</div>' : ''}
            
            <img src="${plato.foto}" 
                 alt="${plato.nombre}" 
                 class="plato-imagen"
                 onerror="this.src='https://via.placeholder.com/400x200?text=🍽️+Sin+Foto'">
            
            <div class="plato-info">
                <div class="plato-categoria">${plato.categoria}</div>
                <div class="plato-nombre">${plato.nombre}</div>
                <div class="plato-descripcion">${plato.descripcion}</div>
                
                <div class="plato-precios">
                    <div class="precio-dolares">$${plato.precio_dolares.toFixed(2)}</div>
                    <div class="precio-bolivares">Bs ${precioBolivares}</div>
                </div>
                
                <button class="boton-agregar" 
                        ${!plato.disponible ? 'disabled' : ''}
                        onclick="agregarAlCarrito(${plato.numero})">
                    ${plato.disponible ? '🛒 Agregar al pedido' : 'No disponible'}
                </button>
            </div>
        `;
        
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// FUNCIÓN: Agregar plato al carrito
// ==========================================
function agregarAlCarrito(numeroPlato) {
    // Buscamos el plato en el menú
    const plato = menuCompleto.find(p => p.numero === numeroPlato);
    
    if (!plato || !plato.disponible) {
        alert('Este plato no está disponible');
        return;
    }
    
    // Agregamos al carrito
    carrito.push({
        numero: plato.numero,
        nombre: plato.nombre,
        precio_dolares: plato.precio_dolares
    });
    
    // Actualizamos el carrito visual
    actualizarCarrito();
    
    // Pequeña animación de feedback
    const botonCarrito = document.getElementById('botonCarrito');
    botonCarrito.style.transform = 'scale(1.2)';
    setTimeout(() => {
        botonCarrito.style.transform = 'scale(1)';
    }, 200);
    
    console.log(`✅ Agregado: ${plato.nombre}`);
}

// ==========================================
// FUNCIÓN: Actualizar carrito visual
// ==========================================
function actualizarCarrito() {
    const contadorCarrito = document.getElementById('contadorCarrito');
    const itemsCarrito = document.getElementById('itemsCarrito');
    const carritoPie = document.getElementById('carritoPie');
    const totalDolares = document.getElementById('totalDolares');
    const totalBolivares = document.getElementById('totalBolivares');
    
    // Actualizamos el número del contador
    contadorCarrito.textContent = carrito.length;
    
    // Si el carrito está vacío
    if (carrito.length === 0) {
        itemsCarrito.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        carritoPie.style.display = 'none';
        return;
    }
    
    // Mostramos los items del carrito
    carritoPie.style.display = 'block';
    itemsCarrito.innerHTML = carrito.map((item, index) => `
        <div class="item-carrito">
            <div>
                <div class="item-carrito-nombre">${item.nombre}</div>
                <div class="item-carrito-precio">$${item.precio_dolares.toFixed(2)}</div>
            </div>
            <button class="boton-eliminar" onclick="eliminarDelCarrito(${index})">✕</button>
        </div>
    `).join('');
    
    // Calculamos totales
    const sumaDolares = carrito.reduce((total, item) => total + item.precio_dolares, 0);
    const sumaBolivares = sumaDolares * tasaDolar;
    
    totalDolares.textContent = `$${sumaDolares.toFixed(2)}`;
    totalBolivares.textContent = `Bs ${sumaBolivares.toFixed(2)}`;
}

// ==========================================
// FUNCIÓN: Eliminar item del carrito
// ==========================================
function eliminarDelCarrito(index) {
    carrito.splice(index, 1); // Quitamos el item en esa posición
    actualizarCarrito();
}

// ==========================================
// FUNCIÓN: Mostrar/ocultar panel del carrito
// ==========================================
function mostrarCarrito() {
    document.getElementById('panelCarrito').classList.add('abierto');
}

function ocultarCarrito() {
    document.getElementById('panelCarrito').classList.remove('abierto');
}

// ==========================================
// FUNCIÓN: Preparar pedido para WhatsApp
// ==========================================
function prepararPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('🛒 Tu carrito está vacío. Agrega algunos platos primero.');
        return;
    }
    
    // Creamos el resumen del pedido
    let resumenHTML = '<strong>📋 Tu Pedido:</strong><br>';
    let sumaDolares = 0;
    
    carrito.forEach((item, index) => {
        resumenHTML += `${index + 1}. ${item.nombre} - $${item.precio_dolares.toFixed(2)}<br>`;
        sumaDolares += item.precio_dolares;
    });
    
    const sumaBolivares = sumaDolares * tasaDolar;
    resumenHTML += `<br><strong>💵 Total USD: $${sumaDolares.toFixed(2)}</strong>`;
    resumenHTML += `<br><strong>🇻🇪 Total Bs: ${sumaBolivares.toFixed(2)}</strong>`;
    
    // Mostramos en el modal
    document.getElementById('resumenPedido').innerHTML = resumenHTML;
    
    // Abrimos el modal
    document.getElementById('modalWhatsApp').classList.add('abierto');
    
    // Ocultamos el panel del carrito
    ocultarCarrito();
}

// ==========================================
// FUNCIÓN: Enviar pedido por WhatsApp
// ==========================================
function enviarWhatsApp() {
    // Obtenemos los datos del formulario
    const mesa = document.getElementById('mesaCliente').value.trim();
    const nombre = document.getElementById('nombreCliente').value.trim();
    const notas = document.getElementById('notasCliente').value.trim();
    
    // Validamos que al menos ponga la mesa
    if (!mesa) {
        alert('⚠️ Por favor indica el número de mesa');
        return;
    }
    
    // Construimos el mensaje
    let mensaje = `🍽️ *NUEVO PEDIDO* 🍽️\n\n`;
    mensaje += `🏪 *${datosRestaurante.nombre}*\n`;
    mensaje += `🪑 *Mesa:* ${mesa}\n`;
    
    if (nombre) {
        mensaje += `👤 *Cliente:* ${nombre}\n`;
    }
    
    mensaje += `\n📋 *PEDIDO:*\n`;
    
    let sumaDolares = 0;
    carrito.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre} - $${item.precio_dolares.toFixed(2)}\n`;
        sumaDolares += item.precio_dolares;
    });
    
    const sumaBolivares = sumaDolares * tasaDolar;
    
    mensaje += `\n💵 *Total USD:* $${sumaDolares.toFixed(2)}`;
    mensaje += `\n🇻🇪 *Total Bs:* ${sumaBolivares.toFixed(2)}`;
    
    if (notas) {
        mensaje += `\n\n📝 *Notas:* ${notas}`;
    }
    
    mensaje += `\n\n⏰ *Fecha:* ${new Date().toLocaleString()}`;
    
    // Codificamos el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Creamos el enlace de WhatsApp
    const numeroWhatsApp = datosRestaurante.whatsapp;
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    
    // Abrimos WhatsApp en nueva pestaña
    window.open(urlWhatsApp, '_blank');
    
    // Limpiamos el carrito
    carrito = [];
    actualizarCarrito();
    
    // Cerramos el modal
    cerrarModal();
    
    // Limpiamos el formulario
    document.getElementById('mesaCliente').value = '';
    document.getElementById('nombreCliente').value = '';
    document.getElementById('notasCliente').value = '';
    
    console.log('✅ Pedido enviado a WhatsApp');
}

// ==========================================
// FUNCIÓN: Cerrar modal
// ==========================================
function cerrarModal() {
    document.getElementById('modalWhatsApp').classList.remove('abierto');
}

// ==========================================
// FUNCIÓN: Buscar platos en tiempo real
// ==========================================
function buscarPlatos() {
    const texto = document.getElementById('buscarPlato').value.toLowerCase();
    
    let platosFiltrados;
    
    // Primero filtramos por categoría actual
    if (categoriaActual === 'todas') {
        platosFiltrados = menuCompleto;
    } else {
        platosFiltrados = menuCompleto.filter(plato => plato.categoria === categoriaActual);
    }
    
    // Luego filtramos por texto de búsqueda
    if (texto) {
        platosFiltrados = platosFiltrados.filter(plato => 
            plato.nombre.toLowerCase().includes(texto) ||
            plato.descripcion.toLowerCase().includes(texto)
        );
    }
    
    mostrarPlatos(platosFiltrados);
}

// ==========================================
// EVENTOS: Conectar funciones con elementos HTML
// ==========================================

// Cuando la página termine de cargar, ejecutamos esto
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosIniciales();
    
    // Conectamos el buscador con la función de búsqueda
    document.getElementById('buscarPlato').addEventListener('input', buscarPlatos);
    
    // Cerramos el modal si hacen clic fuera de él
    document.getElementById('modalWhatsApp').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });
    
    console.log('🍽️ Página lista y funcionando');
});

// Permitir cerrar el modal con la tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModal();
        ocultarCarrito();
    }
});