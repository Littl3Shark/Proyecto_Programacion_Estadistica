// ============================================
// NAVEGACIÓN ENTRE MÓDULOS
// ============================================

// Lista de todos los módulos de la aplicación
const MODULOS = [
    'descriptiva',
    'conteo',
    'binomial',
    'hipergeometrica',
    'poisson',
    'uniforme',
    'normal',
    'gamma',
    'exponencial',
    'jicuadrada',
    'lognormal',
    'tlc'
];

// Nombres visibles para cada módulo
const NOMBRES_MODULOS = {
    'descriptiva': 'Estadística Descriptiva',
    'conteo': 'Conteo y Probabilidad',
    'binomial': 'Distribución Binomial',
    'hipergeometrica': 'Distribución Hipergeométrica',
    'poisson': 'Distribución Poisson',
    'uniforme': 'Distribución Uniforme Continua',
    'normal': 'Distribución Normal',
    'gamma': 'Distribución Gamma',
    'exponencial': 'Distribución Exponencial',
    'jicuadrada': 'Distribución Ji Cuadrada',
    'lognormal': 'Distribución Lognormal',
    'tlc': 'Teorema del Límite Central'
};

/**
 * Cambia el módulo visible cuando el usuario hace clic en el menú
 */
function cambiarModulo(idModulo) {
    // 1. Ocultar todos los módulos
    for (const id of MODULOS) {
        const div = document.getElementById('modulo-' + id);
        if (div) {
            div.style.display = 'none';
        }
    }

    // 2. Mostrar solo el módulo seleccionado
    const moduloActivo = document.getElementById('modulo-' + idModulo);
    if (moduloActivo) {
        moduloActivo.style.display = 'block';
    }

    // 3. Actualizar el título principal
    document.getElementById('titulo-modulo').textContent = '📌 Módulo: ' + NOMBRES_MODULOS[idModulo];

    // 4. Actualizar el menú para marcar el módulo activo
    const botones = document.querySelectorAll('#menu button');
    botones.forEach(boton => boton.classList.remove('activo'));

    // Buscar el botón que se presionó y marcarlo
    const botonPresionado = event.target;
    if (botonPresionado && botonPresionado.tagName === 'BUTTON') {
        botonPresionado.classList.add('activo');
    }
}

/**
 * Marcar el módulo activo en el menú (estilo visual)
 */
// Se agrega la clase CSS para el botón activo
const estilo = document.createElement('style');
estilo.textContent = `
    #menu button.activo {
        background-color: #1abc9c !important;
        font-weight: bold;
        border-left: 4px solid white;
    }
`;
document.head.appendChild(estilo);