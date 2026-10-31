// ============================================
// MÓDULO 2: CONTEO Y PROBABILIDAD
// ============================================


// ============================================
// NAVEGACIÓN POR PESTAÑAS INTERNAS
// ============================================
function cambiarPestana(idPestana) {
    // Ocultar todos los contenidos de pestañas
    const contenidos = document.querySelectorAll('.contenido-pestana');
    contenidos.forEach(c => c.classList.remove('visible'));

    // Quitar clase activa de todas las pestañas
    const pestanas = document.querySelectorAll('.pestana');
    pestanas.forEach(p => p.classList.remove('activa'));

    // Mostrar el contenido seleccionado
    document.getElementById('pestana-' + idPestana).classList.add('visible');

    // Marcar la pestaña como activa
    event.target.classList.add('activa');

    // Limpiar mensajes de error/éxito al cambiar de pestaña
    ocultarMensajesConteo();
}


// ============================================
// UTILIDAD: FACTORIAL
// ============================================
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let resultado = 1;
    for (let i = 2; i <= n; i++) {
        resultado *= i;
    }
    return resultado;
}


// ============================================
// UTILIDAD: VALIDAR NÚMERO ENTERO POSITIVO
// ============================================
function validarEnteroPositivo(valor, nombreCampo) {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0) {
        return { valido: false, mensaje: `"${nombreCampo}" debe ser un número entero mayor o igual a 0.` };
    }
    return { valido: true, valor: num };
}

function validarProbabilidad(valor, nombreCampo) {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0 || num > 1) {
        return { valido: false, mensaje: `"${nombreCampo}" debe ser un número entre 0 y 1.` };
    }
    return { valido: true, valor: num };
}


// ============================================
// 1. COMBINACIONES: C(n, k)
// ============================================
function calcularCombinaciones() {
    ocultarMensajesConteo();

    const nInput = document.getElementById('comb-n').value;
    const kInput = document.getElementById('comb-k').value;

    // Validar n
    const validN = validarEnteroPositivo(nInput, 'n (total de elementos)');
    if (!validN.valido) { mostrarErrorConteo(validN.mensaje); return; }

    // Validar k
    const validK = validarEnteroPositivo(kInput, 'k (elementos a elegir)');
    if (!validK.valido) { mostrarErrorConteo(validK.mensaje); return; }

    const n = validN.valor;
    const k = validK.valor;

    // k no puede ser mayor que n
    if (k > n) {
        mostrarErrorConteo(`k (${k}) no puede ser mayor que n (${n}). No se pueden elegir más elementos de los disponibles.`);
        return;
    }

    // Calcular C(n, k) de forma eficiente
    // C(n,k) = C(n, n-k), usamos el menor para optimizar
    const kOptimo = Math.min(k, n - k);
    let resultado = 1;
    for (let i = 0; i < kOptimo; i++) {
        resultado = resultado * (n - i) / (i + 1);
    }
    resultado = Math.round(resultado);

    // Mostrar resultado
    const divResultado = document.getElementById('resultado-combinaciones');
    divResultado.innerHTML = `C(${n}, ${k}) = <strong>${resultado.toLocaleString()}</strong> combinaciones posibles`;
    divResultado.style.display = 'block';

    // Mostrar procedimiento
    const divProcedimiento = document.getElementById('proc-combinaciones');
    divProcedimiento.textContent =
`FÓRMULA: C(n, k) = n! / (k! × (n-k)!)

SUSTITUCIÓN:
n = ${n}, k = ${k}
C(${n}, ${k}) = ${n}! / (${k}! × ${n - k}!)

CÁLCULO:
${n}! = ${factorial(n).toLocaleString()}
${k}! = ${factorial(k).toLocaleString()}
${n - k}! = ${factorial(n - k).toLocaleString()}

C(${n}, ${k}) = ${factorial(n).toLocaleString()} / (${factorial(k).toLocaleString()} × ${factorial(n - k).toLocaleString()})
C(${n}, ${k}) = ${factorial(n).toLocaleString()} / ${(factorial(k) * factorial(n - k)).toLocaleString()}
C(${n}, ${k}) = ${resultado.toLocaleString()}`;

    // Mostrar interpretación
    const divInterpretacion = document.getElementById('interp-combinaciones');
    divInterpretacion.textContent =
`📊 INTERPRETACIÓN: Se pueden formar ${resultado.toLocaleString()} grupos diferentes de ${k} elementos elegidos de un total de ${n}. El orden de selección NO importa.`;

    document.getElementById('resultados-combinaciones').style.display = 'block';
}

function cargarEjemploCombinaciones() {
    document.getElementById('comb-n').value = '10';
    document.getElementById('comb-k').value = '3';
    mostrarExitoConteo('✅ Ejemplo cargado: De 10 desarrolladores, ¿cuántos equipos de 3 se pueden formar?');
}

function limpiarCombinaciones() {
    document.getElementById('comb-n').value = '';
    document.getElementById('comb-k').value = '';
    document.getElementById('resultado-combinaciones').style.display = 'none';
    document.getElementById('resultados-combinaciones').style.display = 'none';
    ocultarMensajesConteo();
}


// ============================================
// 2. UNIÓN DE DOS EVENTOS: P(A∪B)
// ============================================
function calcularUnion() {
    ocultarMensajesConteo();

    const pAInput = document.getElementById('union-pa').value;
    const pBInput = document.getElementById('union-pb').value;
    const pABInput = document.getElementById('union-pab').value;

    const validPA = validarProbabilidad(pAInput, 'P(A)');
    if (!validPA.valido) { mostrarErrorConteo(validPA.mensaje); return; }

    const validPB = validarProbabilidad(pBInput, 'P(B)');
    if (!validPB.valido) { mostrarErrorConteo(validPB.mensaje); return; }

    const validPAB = validarProbabilidad(pABInput, 'P(A∩B)');
    if (!validPAB.valido) { mostrarErrorConteo(validPAB.mensaje); return; }

    const pA = validPA.valor;
    const pB = validPB.valor;
    const pAB = validPAB.valor;

    // Validar que P(A∩B) no sea mayor que P(A) o P(B)
    if (pAB > pA || pAB > pB) {
        mostrarErrorConteo(`P(A∩B) = ${pAB} no puede ser mayor que P(A) = ${pA} ni mayor que P(B) = ${pB}. La intersección es un subconjunto de ambos eventos.`);
        return;
    }

    const resultado = pA + pB - pAB;

    const divResultado = document.getElementById('resultado-union');
    divResultado.innerHTML = `P(A∪B) = <strong>${resultado.toFixed(4)}</strong> (${(resultado * 100).toFixed(2)}%)`;
    divResultado.style.display = 'block';

    const divProcedimiento = document.getElementById('proc-union');
    divProcedimiento.textContent =
`FÓRMULA: P(A∪B) = P(A) + P(B) - P(A∩B)

SUSTITUCIÓN:
P(A) = ${pA}
P(B) = ${pB}
P(A∩B) = ${pAB}

CÁLCULO:
P(A∪B) = ${pA} + ${pB} - ${pAB}
P(A∪B) = ${(pA + pB).toFixed(4)} - ${pAB}
P(A∪B) = ${resultado.toFixed(4)}`;

    const divInterpretacion = document.getElementById('interp-union');
    divInterpretacion.textContent =
`📊 INTERPRETACIÓN: La probabilidad de que ocurra el evento A, el evento B, o ambos es de ${(resultado * 100).toFixed(2)}%. Se resta P(A∩B) para no contar dos veces la zona donde ambos eventos ocurren simultáneamente.`;

    document.getElementById('resultados-union').style.display = 'block';
}

function cargarEjemploUnion() {
    document.getElementById('union-pa').value = '0.15';
    document.getElementById('union-pb').value = '0.10';
    document.getElementById('union-pab').value = '0.05';
    mostrarExitoConteo('✅ Ejemplo cargado: P(fallo de hardware)=0.15, P(fallo de software)=0.10, P(ambos)=0.05');
}

function limpiarUnion() {
    document.getElementById('union-pa').value = '';
    document.getElementById('union-pb').value = '';
    document.getElementById('union-pab').value = '';
    document.getElementById('resultado-union').style.display = 'none';
    document.getElementById('resultados-union').style.display = 'none';
    ocultarMensajesConteo();
}


// ============================================
// 3. PROBABILIDAD CONDICIONAL: P(A|B)
// ============================================
function calcularCondicional() {
    ocultarMensajesConteo();

    const pABInput = document.getElementById('cond-pab').value;
    const pBInput = document.getElementById('cond-pb').value;

    const validPAB = validarProbabilidad(pABInput, 'P(A∩B)');
    if (!validPAB.valido) { mostrarErrorConteo(validPAB.mensaje); return; }

    const validPB = validarProbabilidad(pBInput, 'P(B)');
    if (!validPB.valido) { mostrarErrorConteo(validPB.mensaje); return; }

    const pAB = validPAB.valor;
    const pB = validPB.valor;

    // P(B) no puede ser 0
    if (pB === 0) {
        mostrarErrorConteo('P(B) no puede ser 0. No se puede condicionar a un evento imposible.');
        return;
    }

    // P(A∩B) no puede ser mayor que P(B)
    if (pAB > pB) {
        mostrarErrorConteo(`P(A∩B) = ${pAB} no puede ser mayor que P(B) = ${pB}.`);
        return;
    }

    const resultado = pAB / pB;

    const divResultado = document.getElementById('resultado-condicional');
    divResultado.innerHTML = `P(A|B) = <strong>${resultado.toFixed(4)}</strong> (${(resultado * 100).toFixed(2)}%)`;
    divResultado.style.display = 'block';

    const divProcedimiento = document.getElementById('proc-condicional');
    divProcedimiento.textContent =
`FÓRMULA: P(A|B) = P(A∩B) / P(B)

SUSTITUCIÓN:
P(A∩B) = ${pAB}
P(B) = ${pB}

CÁLCULO:
P(A|B) = ${pAB} / ${pB}
P(A|B) = ${resultado.toFixed(4)}`;

    const divInterpretacion = document.getElementById('interp-condicional');
    divInterpretacion.textContent =
`📊 INTERPRETACIÓN: Dado que el evento B ya ocurrió, la probabilidad de que también ocurra el evento A es de ${(resultado * 100).toFixed(2)}%.`;

    document.getElementById('resultados-condicional').style.display = 'block';
}

function cargarEjemploCondicional() {
    document.getElementById('cond-pab').value = '0.05';
    document.getElementById('cond-pb').value = '0.10';
    mostrarExitoConteo('✅ Ejemplo cargado: Dado que hay fallo de software (P=0.10), ¿cuál es la probabilidad de que también haya fallo de hardware (intersección=0.05)?');
}

function limpiarCondicional() {
    document.getElementById('cond-pab').value = '';
    document.getElementById('cond-pb').value = '';
    document.getElementById('resultado-condicional').style.display = 'none';
    document.getElementById('resultados-condicional').style.display = 'none';
    ocultarMensajesConteo();
}


// ============================================
// 4. TEOREMA DE BAYES
// ============================================
function calcularBayes() {
    ocultarMensajesConteo();

    // Leer las 3 hipótesis
    const hipotesis = [];
    let sumaPrevias = 0;

    for (let i = 1; i <= 3; i++) {
        const pAiInput = document.getElementById(`bayes-pa${i}`).value;
        const pBaiInput = document.getElementById(`bayes-pba${i}`).value;

        const validPAi = validarProbabilidad(pAiInput, `P(A${i})`);
        if (!validPAi.valido) { mostrarErrorConteo(validPAi.mensaje); return; }

        const validPBai = validarProbabilidad(pBaiInput, `P(B|A${i})`);
        if (!validPBai.valido) { mostrarErrorConteo(validPBai.mensaje); return; }

        hipotesis.push({
            nombre: `A${i}`,
            previa: validPAi.valor,
            verosimilitud: validPBai.valor,
            conjunta: validPAi.valor * validPBai.valor
        });

        sumaPrevias += validPAi.valor;
    }

    // Validar que las probabilidades previas sumen 1 (con tolerancia por redondeo)
    if (Math.abs(sumaPrevias - 1) > 0.01) {
        mostrarErrorConteo(`Las probabilidades previas P(A1) + P(A2) + P(A3) deben sumar 1. Actualmente suman ${sumaPrevias.toFixed(4)}. Ajusta los valores.`);
        return;
    }

    // Calcular P(B) = suma de todas las conjuntas
    const pB = hipotesis.reduce((acc, h) => acc + h.conjunta, 0);

    if (pB === 0) {
        mostrarErrorConteo('P(B) es 0. No se puede aplicar Bayes si el evento observado es imposible.');
        return;
    }

    // Calcular cada P(Ai|B)
    const resultados = hipotesis.map(h => ({
        nombre: h.nombre,
        posterior: h.conjunta / pB
    }));

    // Mostrar resultados en tabla
    let tablaHTML = `<tr><th>Hipótesis</th><th>P(Ai)</th><th>P(B|Ai)</th><th>P(B|Ai)×P(Ai)</th><th>P(Ai|B)</th></tr>`;
    hipotesis.forEach((h, idx) => {
        tablaHTML += `<tr>
            <td>${h.nombre}</td>
            <td>${h.previa.toFixed(4)}</td>
            <td>${h.verosimilitud.toFixed(4)}</td>
            <td>${h.conjunta.toFixed(6)}</td>
            <td><strong>${resultados[idx].posterior.toFixed(4)}</strong> (${(resultados[idx].posterior * 100).toFixed(2)}%)</td>
        </tr>`;
    });
    tablaHTML += `<tr style="background-color: #fef9e7; font-weight: bold;">
        <td colspan="3">P(B) = Σ P(B|Ai)×P(Ai)</td>
        <td colspan="2">${pB.toFixed(6)}</td>
    </tr>`;

    document.getElementById('tabla-bayes').innerHTML = tablaHTML;
    document.getElementById('resultados-bayes').style.display = 'block';

    // Procedimiento
    let procTexto = `FÓRMULA DE BAYES: P(Ai|B) = [P(B|Ai) × P(Ai)] / P(B)\n`;
    procTexto += `donde P(B) = Σ P(B|Ai) × P(Ai)\n\n`;
    procTexto += `DATOS:\n`;
    hipotesis.forEach(h => {
        procTexto += `${h.nombre}: P(${h.nombre}) = ${h.previa}, P(B|${h.nombre}) = ${h.verosimilitud}\n`;
    });
    procTexto += `\nCÁLCULO DE P(B):\n`;
    hipotesis.forEach(h => {
        procTexto += `P(B|${h.nombre})×P(${h.nombre}) = ${h.verosimilitud} × ${h.previa} = ${h.conjunta.toFixed(6)}\n`;
    });
    procTexto += `P(B) = ${hipotesis.map(h => h.conjunta.toFixed(6)).join(' + ')} = ${pB.toFixed(6)}\n\n`;
    procTexto += `PROBABILIDADES POSTERIORES:\n`;
    resultados.forEach((r, idx) => {
        procTexto += `P(${r.nombre}|B) = ${hipotesis[idx].conjunta.toFixed(6)} / ${pB.toFixed(6)} = ${r.posterior.toFixed(4)} (${(r.posterior * 100).toFixed(2)}%)\n`;
    });

    document.getElementById('proc-bayes').textContent = procTexto;
    document.getElementById('proc-bayes-seccion').style.display = 'block';

    // Interpretación
    // Encontrar la hipótesis con mayor probabilidad posterior
    const maxIdx = resultados.reduce((max, r, idx) => r.posterior > resultados[max].posterior ? idx : max, 0);
    let interpTexto = `📊 INTERPRETACIÓN:\n\n`;
    resultados.forEach(r => {
        interpTexto += `• P(${r.nombre}|B) = ${(r.posterior * 100).toFixed(2)}%\n`;
    });
    interpTexto += `\nLa hipótesis más probable dado que B ocurrió es ${resultados[maxIdx].nombre} con ${(resultados[maxIdx].posterior * 100).toFixed(2)}% de probabilidad.\n\n`;
    interpTexto += `⚠️ NOTA: Las probabilidades posteriores suman ${(resultados.reduce((s, r) => s + r.posterior, 0) * 100).toFixed(2)}% (debe ser ≈100%).`;

    document.getElementById('interp-bayes').textContent = interpTexto;
    document.getElementById('interp-bayes-seccion').style.display = 'block';
}

function cargarEjemploBayes() {
    // Servidor 1: 50% del tráfico, 1% de errores
    document.getElementById('bayes-pa1').value = '0.50';
    document.getElementById('bayes-pba1').value = '0.01';
    // Servidor 2: 30% del tráfico, 2% de errores
    document.getElementById('bayes-pa2').value = '0.30';
    document.getElementById('bayes-pba2').value = '0.02';
    // Servidor 3: 20% del tráfico, 5% de errores
    document.getElementById('bayes-pa3').value = '0.20';
    document.getElementById('bayes-pba3').value = '0.05';
    mostrarExitoConteo('✅ Ejemplo cargado: 3 servidores web. Se detecta un error, ¿de qué servidor proviene?');
}

function limpiarBayes() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`bayes-pa${i}`).value = '';
        document.getElementById(`bayes-pba${i}`).value = '';
    }
    document.getElementById('resultados-bayes').style.display = 'none';
    document.getElementById('proc-bayes-seccion').style.display = 'none';
    document.getElementById('interp-bayes-seccion').style.display = 'none';
    document.getElementById('tabla-bayes').innerHTML = '';
    ocultarMensajesConteo();
}


// ============================================
// MANEJO DE MENSAJES DEL MÓDULO CONTEO
// ============================================
function mostrarErrorConteo(mensaje) {
    const div = document.getElementById('error-conteo');
    div.textContent = '⚠️ ' + mensaje;
    div.style.display = 'block';
}

function mostrarExitoConteo(mensaje) {
    const div = document.getElementById('exito-conteo');
    div.textContent = mensaje;
    div.style.display = 'block';
}

function ocultarMensajesConteo() {
    document.getElementById('error-conteo').style.display = 'none';
    document.getElementById('exito-conteo').style.display = 'none';
}