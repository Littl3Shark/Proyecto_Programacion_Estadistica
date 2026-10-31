// ============================================
// MÓDULO 1: ESTADÍSTICA DESCRIPTIVA
// ============================================

/**
 * DATOS DEL EJEMPLO PRECARGADO
 * Caso de Ingeniería en Sistemas:
 * Tiempos de respuesta de un servidor web (en milisegundos)
 * 
 * Datos: 120, 135, 128, 142, 135, 130, 125, 135, 140, 122
 * n = 10
 * Media esperada = 131.2
 * Mediana esperada = 132.5
 * Moda esperada = 135
 * Varianza poblacional esperada ≈ 49.76
 * Varianza muestral esperada ≈ 55.29
 */
const EJEMPLO_DESCRIPTIVA = "120, 135, 128, 142, 135, 130, 125, 135, 140, 122";


// ============================================
// FUNCIÓN PRINCIPAL: CALCULAR TODO
// ============================================
function calcularDescriptiva() {
    // 1. Obtener el texto que escribió el usuario
    const textoEntrada = document.getElementById('datos-descriptiva').value;

    // 2. Limpiar mensajes anteriores
    ocultarMensajesDescriptiva();

    // 3. Validar y convertir el texto en números
    const resultado = parsearDatos(textoEntrada);

    // 4. Si hay errores, mostrarlos y detenerse
    if (resultado.error) {
        mostrarErrorDescriptiva(resultado.error);
        return;
    }

    const datos = resultado.datos;
    const n = datos.length;

    // 5. Ordenar los datos (necesario para mediana, mínimo, máximo)
    const ordenados = [...datos].sort((a, b) => a - b);

    // 6. Calcular cada medida
    const media = calcularMedia(datos);
    const mediana = calcularMediana(ordenados);
    const moda = calcularModa(datos);
    const minimo = ordenados[0];
    const maximo = ordenados[n - 1];
    const rango = maximo - minimo;

    // 7. Calcular varianzas y desviaciones
    const sumaCuadrados = calcularSumaCuadrados(datos, media);
    const varianzaPoblacional = sumaCuadrados / n;
    const varianzaMuestral = sumaCuadrados / (n - 1);
    const desviacionPoblacional = Math.sqrt(varianzaPoblacional);
    const desviacionMuestral = Math.sqrt(varianzaMuestral);

    // 8. Mostrar los resultados en la tabla
    mostrarResultadosDescriptiva({
        n, media, mediana, moda, minimo, maximo, rango,
        varianzaPoblacional, varianzaMuestral,
        desviacionPoblacional, desviacionMuestral,
        datos: datos, ordenados: ordenados, sumaCuadrados
    });

    // 9. Mostrar el procedimiento
    mostrarProcedimientoDescriptiva({
        n, media, mediana, moda, minimo, maximo, rango,
        sumaCuadrados, varianzaPoblacional, varianzaMuestral,
        desviacionPoblacional, desviacionMuestral
    });

    // 10. Mostrar la interpretación
    mostrarInterpretacionDescriptiva({
        n, media, mediana, moda, minimo, maximo, rango,
        desviacionMuestral
    });
}


// ============================================
// PARSEAR Y VALIDAR DATOS DE ENTRADA
// ============================================
function parsearDatos(texto) {
    // Verificar si el campo está vacío
    if (!texto || texto.trim() === '') {
        return { error: "⚠️ El campo de datos está vacío. Escribe números separados por comas o presiona 'Cargar Ejemplo'." };
    }

    // Reemplazar saltos de línea, tabs, punto y coma por comas
    // Esto permite pegar datos desde Excel o archivos de texto
    let limpio = texto.replace(/[\n\r\t;]+/g, ',');

    // Dividir por comas y/o espacios
    let partes = limpio.split(/[,\s]+/).filter(p => p.trim() !== '');

    let datos = [];
    let invalidos = [];

    for (let parte of partes) {
        let num = parseFloat(parte);
        if (isNaN(num)) {
            invalidos.push(parte);
        } else {
            datos.push(num);
        }
    }

    // Verificar si hubo valores no numéricos
    if (invalidos.length > 0) {
        return {
            error: `⚠️ Se encontraron ${invalidos.length} valor(es) no numérico(s): "${invalidos.join('", "')}". ` +
                   `Solo se permiten números separados por comas, espacios o saltos de línea.`
        };
    }

    // Verificar que haya suficientes datos
    if (datos.length < 2) {
        return {
            error: `⚠️ Se necesitan al menos 2 datos para calcular estadísticas. Ingresaste solo ${datos.length}.`
        };
    }

    return { datos };
}


// ============================================
// FÓRMULAS MATEMÁTICAS
// ============================================

// Media (promedio): suma de todos / cantidad
function calcularMedia(datos) {
    const suma = datos.reduce((acc, val) => acc + val, 0);
    return suma / datos.length;
}

// Mediana: el valor central de los datos ordenados
// NOTA: Esta función recibe los datos YA ordenados
function calcularMediana(ordenados) {
    const n = ordenados.length;

    if (n % 2 === 1) {
        // Cantidad impar: el valor del medio
        return ordenados[Math.floor(n / 2)];
    } else {
        // Cantidad par: promedio de los dos valores centrales
        const medio1 = ordenados[n / 2 - 1];
        const medio2 = ordenados[n / 2];
        return (medio1 + medio2) / 2;
    }
}

// Moda: el valor que más se repite
function calcularModa(datos) {
    const frecuencia = {};
    let maxFrecuencia = 0;

    // Contar cuántas veces aparece cada número
    for (const num of datos) {
        frecuencia[num] = (frecuencia[num] || 0) + 1;
        if (frecuencia[num] > maxFrecuencia) {
            maxFrecuencia = frecuencia[num];
        }
    }

    // Si todos aparecen una sola vez, no hay moda
    if (maxFrecuencia === 1) {
        return { valor: 'No existe', detalle: 'Todos los valores aparecen una sola vez' };
    }

    // Encontrar todos los valores con la máxima frecuencia
    const modas = [];
    for (const num in frecuencia) {
        if (frecuencia[num] === maxFrecuencia) {
            modas.push(parseFloat(num));
        }
    }

    if (modas.length === 1) {
        return { valor: modas[0], detalle: `Aparece ${maxFrecuencia} veces` };
    } else {
        return {
            valor: modas.sort((a, b) => a - b).join(', '),
            detalle: `Multimodal: ${modas.length} valores aparecen ${maxFrecuencia} veces`
        };
    }
}

// Suma de las diferencias al cuadrado respecto a la media
// Se usa para calcular la varianza
function calcularSumaCuadrados(datos, media) {
    return datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
}


// ============================================
// FUNCIONES DE INTERFAZ (mostrar resultados)
// ============================================

function mostrarResultadosDescriptiva(r) {
    const tabla = document.getElementById('tabla-descriptiva');
    const seccion = document.getElementById('resultados-descriptiva');

    // Redondear a 4 decimales para mostrar
    const red = (num) => Math.round(num * 10000) / 10000;

    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>n (cantidad de observaciones)</td><td>${r.n}</td></tr>
        <tr><td>Media (promedio)</td><td>${red(r.media)}</td></tr>
        <tr><td>Mediana</td><td>${red(r.mediana)}</td></tr>
        <tr><td>Moda</td><td>${r.moda.valor}</td></tr>
        <tr><td>Mínimo</td><td>${red(r.minimo)}</td></tr>
        <tr><td>Máximo</td><td>${red(r.maximo)}</td></tr>
        <tr><td>Rango</td><td>${red(r.rango)}</td></tr>
        <tr><td>Varianza POBLACIONAL (σ²)</td><td>${red(r.varianzaPoblacional)}</td></tr>
        <tr><td>Varianza MUESTRAL (s²)</td><td>${red(r.varianzaMuestral)}</td></tr>
        <tr><td>Desviación Estándar POBLACIONAL (σ)</td><td>${red(r.desviacionPoblacional)}</td></tr>
        <tr><td>Desviación Estándar MUESTRAL (s)</td><td>${red(r.desviacionMuestral)}</td></tr>
    `;

    seccion.style.display = 'block';
}


function mostrarProcedimientoDescriptiva(r) {
    const procedimiento = document.getElementById('procedimiento-descriptiva');
    const seccion = document.getElementById('procedimiento-seccion');
    const red = (num) => Math.round(num * 10000) / 10000;

    procedimiento.textContent =
`PASO 1: Contar las observaciones
n = ${r.n}

PASO 2: Calcular la Media (promedio)
Media = (suma de todos los datos) / n
Media = ${red(r.media)}

PASO 3: Calcular la Mediana
Se ordenan los datos de menor a mayor.
Mediana = ${red(r.mediana)}
Detalle: ${r.mediana % 1 !== 0 ? 'Como n es par, se promedian los dos valores centrales.' : 'Como n es impar, se toma el valor central.'}

PASO 4: Identificar la Moda
Moda = ${r.moda.valor}
Detalle: ${r.moda.detalle}

PASO 5: Calcular el Rango
Rango = Máximo - Mínimo
Rango = ${red(r.maximo)} - ${red(r.minimo)} = ${red(r.rango)}

PASO 6: Calcular la Suma de Cuadrados
Se suma (cada dato - media)²
Σ(xi - x̄)² = ${red(r.sumaCuadrados)}

PASO 7: Calcular Varianzas
Varianza POBLACIONAL = Σ(xi - x̄)² / n = ${red(r.sumaCuadrados)} / ${r.n} = ${red(r.varianzaPoblacional)}
Varianza MUESTRAL    = Σ(xi - x̄)² / (n-1) = ${red(r.sumaCuadrados)} / ${r.n - 1} = ${red(r.varianzaMuestral)}

PASO 8: Calcular Desviaciones Estándar
σ (poblacional) = √${red(r.varianzaPoblacional)} = ${red(r.desviacionPoblacional)}
s (muestral)    = √${red(r.varianzaMuestral)} = ${red(r.desviacionMuestral)}`;

    seccion.style.display = 'block';
}


function mostrarInterpretacionDescriptiva(r) {
    const interpretacion = document.getElementById('interpretacion-descriptiva');
    const seccion = document.getElementById('interpretacion-seccion');
    const red = (num) => Math.round(num * 100) / 100;

    let texto = `📊 INTERPRETACIÓN:\n\n`;
    texto += `Se analizaron ${r.n} observaciones.\n\n`;
    texto += `• El valor promedio es ${red(r.media)}.\n`;
    texto += `• La mitad de los datos son menores o iguales a ${red(r.mediana)}.\n`;

    if (r.moda.valor !== 'No existe') {
        texto += `• El valor más frecuente es ${r.moda.valor} (${r.moda.detalle.toLowerCase()}).\n`;
    } else {
        texto += `• No existe un valor que se repita más que los demás.\n`;
    }

    texto += `• Los datos van desde ${red(r.minimo)} hasta ${red(r.maximo)}, con un rango de ${red(r.rango)}.\n`;
    texto += `• La dispersión típica respecto al promedio es de aproximadamente ${red(r.desviacionMuestral)} (desviación estándar muestral).\n\n`;
    texto += `⚠️ NOTA: La varianza POBLACIONAL divide entre n (${r.n}), mientras que la MUESTRAL divide entre n-1 (${r.n - 1}). `;
    texto += `La muestral es ligeramente mayor porque corrige el sesgo al estimar desde una muestra.`;

    interpretacion.textContent = texto;
    seccion.style.display = 'block';
}


// ============================================
// BOTONES: EJEMPLO, LIMPIAR, IMPORTAR
// ============================================

function cargarEjemploDescriptiva() {
    document.getElementById('datos-descriptiva').value = EJEMPLO_DESCRIPTIVA;
    ocultarMensajesDescriptiva();
    // No calculamos automáticamente, dejamos que el usuario presione "Calcular"
    mostrarExitoDescriptiva("✅ Ejemplo cargado: Tiempos de respuesta de un servidor web (ms). Presiona 'Calcular' para ver los resultados.");
}

function limpiarDescriptiva() {
    document.getElementById('datos-descriptiva').value = '';
    ocultarMensajesDescriptiva();
    document.getElementById('resultados-descriptiva').style.display = 'none';
    document.getElementById('procedimiento-seccion').style.display = 'none';
    document.getElementById('interpretacion-seccion').style.display = 'none';
    document.getElementById('tabla-descriptiva').innerHTML = '';
}

function importarArchivoDescriptiva(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        document.getElementById('datos-descriptiva').value = e.target.result;
        mostrarExitoDescriptiva(`✅ Archivo "${archivo.name}" importado correctamente. Presiona 'Calcular' para procesar los datos.`);
    };
    lector.readAsText(archivo);

    // Limpiar el input para poder importar el mismo archivo otra vez
    evento.target.value = '';
}


// ============================================
// MANEJO DE MENSAJES (errores y éxitos)
// ============================================

function mostrarErrorDescriptiva(mensaje) {
    const div = document.getElementById('error-descriptiva');
    div.textContent = mensaje;
    div.style.display = 'block';
}

function mostrarExitoDescriptiva(mensaje) {
    const div = document.getElementById('exito-descriptiva');
    div.textContent = mensaje;
    div.style.display = 'block';
}

function ocultarMensajesDescriptiva() {
    document.getElementById('error-descriptiva').style.display = 'none';
    document.getElementById('exito-descriptiva').style.display = 'none';
}