// ============================================
// MÓDULOS 3, 4, 5: DISTRIBUCIONES DISCRETAS
// Binomial, Hipergeométrica, Poisson
// ============================================


// ============================================
// UTILIDADES COMPARTIDAS
// ============================================

// Función combinaciones C(n, k)
// Se usa en Binomial e Hipergeométrica
function combinaciones(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k); // Optimización: C(n,k) = C(n, n-k)
    let resultado = 1;
    for (let i = 0; i < k; i++) {
        resultado = resultado * (n - i) / (i + 1);
    }
    return Math.round(resultado);
}

// Redondear a N decimales
function redondear(num, decimales) {
    const factor = Math.pow(10, decimales);
    return Math.round(num * factor) / factor;
}


// ============================================
//  ██████  DISTRIBUCIÓN BINOMIAL  ██████
// ============================================

/**
 * Calcula P(X = k) para una distribución Binomial
 * Fórmula: P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
 */
function probBinomialIndividual(n, p, k) {
    return combinaciones(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/**
 * Calcula P(X ≤ k) sumando P(X=0) + P(X=1) + ... + P(X=k)
 */
function probBinomialAcumulada(n, p, k) {
    let suma = 0;
    for (let i = 0; i <= k; i++) {
        suma += probBinomialIndividual(n, p, i);
    }
    return suma;
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR BINOMIAL
 */
function calcularBinomial() {
    ocultarMensajesDist('binomial');

    const nInput = document.getElementById('bin-n').value;
    const pInput = document.getElementById('bin-p').value;
    const kInput = document.getElementById('bin-k').value;

    // Validar n
    const n = parseInt(nInput);
    if (isNaN(n) || n < 1) {
        mostrarErrorDist('binomial', '"n" debe ser un número entero mayor o igual a 1.');
        return;
    }

    // Validar p
    const p = parseFloat(pInput);
    if (isNaN(p) || p < 0 || p > 1) {
        mostrarErrorDist('binomial', '"p" debe ser un número entre 0 y 1.');
        return;
    }

    // Validar k
    const k = parseInt(kInput);
    if (isNaN(k) || k < 0 || k > n) {
        mostrarErrorDist('binomial', `"k" debe ser un número entero entre 0 y n (${n}).`);
        return;
    }

    // Calcular las tres probabilidades
    const pExacta = probBinomialIndividual(n, p, k);
    const pMaximo = probBinomialAcumulada(n, p, k);
    const pMinimo = 1 - (k > 0 ? probBinomialAcumulada(n, p, k - 1) : 0);

    // Media y varianza
    const media = n * p;
    const varianza = n * p * (1 - p);
    const desviacion = Math.sqrt(varianza);

    // Mostrar resultados en tabla
    const tabla = document.getElementById('tabla-binomial');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>n (ensayos)</td><td>${n}</td></tr>
        <tr><td>p (prob. de éxito)</td><td>${p}</td></tr>
        <tr><td>k (éxitos deseados)</td><td>${k}</td></tr>
        <tr><td>Media μ = n·p</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ² = n·p·(1-p)</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X = ${k})</strong> exactamente k</td><td><strong>${redondear(pExacta, 6)}</strong> (${redondear(pExacta*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${k})</strong> como máximo k</td><td><strong>${redondear(pMaximo, 6)}</strong> (${redondear(pMaximo*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${k})</strong> al menos k</td><td><strong>${redondear(pMinimo, 6)}</strong> (${redondear(pMinimo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-binomial').style.display = 'block';

    // Procedimiento
    const q = 1 - p;
    const comb = combinaciones(n, k);
    document.getElementById('proc-binomial').textContent =
`FÓRMULA: P(X=k) = C(n,k) × p^k × (1-p)^(n-k)

PARÁMETROS: n=${n}, p=${p}, k=${k}

CÁLCULO P(X = ${k}):
C(${n},${k}) = ${comb}
p^k = ${p}^${k} = ${redondear(Math.pow(p, k), 6)}
(1-p)^(n-k) = ${redondear(q, 4)}^${n-k} = ${redondear(Math.pow(q, n-k), 6)}
P(X=${k}) = ${comb} × ${redondear(Math.pow(p, k), 6)} × ${redondear(Math.pow(q, n-k), 6)} = ${redondear(pExacta, 6)}

CÁLCULO P(X ≤ ${k}):
P(X≤${k}) = P(X=0) + P(X=1) + ... + P(X=${k}) = ${redondear(pMaximo, 6)}

CÁLCULO P(X ≥ ${k}):
P(X≥${k}) = 1 - P(X≤${k-1}) = 1 - ${redondear(k > 0 ? probBinomialAcumulada(n, p, k-1) : 0, 6)} = ${redondear(pMinimo, 6)}

MEDIA Y VARIANZA:
μ = n × p = ${n} × ${p} = ${redondear(media, 4)}
σ² = n × p × (1-p) = ${n} × ${p} × ${redondear(q, 4)} = ${redondear(varianza, 4)}`;
    document.getElementById('proc-binomial-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-binomial').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X representa el número de éxitos en ${n} ensayos independientes.\n` +
`La esperanza E(X) = ${redondear(media, 4)} indica que en promedio se esperan ${redondear(media, 2)} éxitos.\n\n` +
`• P(X = ${k}) = ${redondear(pExacta*100, 2)}%: probabilidad de obtener exactamente ${k} éxitos.\n` +
`• P(X ≤ ${k}) = ${redondear(pMaximo*100, 2)}%: probabilidad de obtener como máximo ${k} éxitos.\n` +
`• P(X ≥ ${k}) = ${redondear(pMinimo*100, 2)}%: probabilidad de obtener al menos ${k} éxitos.\n\n` +
`La dispersión σ = ${redondear(desviacion, 4)} indica qué tan variados son los resultados respecto al promedio.`;
    document.getElementById('interp-binomial-seccion').style.display = 'block';
}

function cargarEjemploBinomial() {
    document.getElementById('bin-n').value = '10';
    document.getElementById('bin-p').value = '0.95';
    document.getElementById('bin-k').value = '8';
    mostrarExitoDist('binomial', '✅ Ejemplo cargado: Un servidor tiene disponibilidad del 95%. Se realizan 10 solicitudes. ¿Probabilidad de que exactamente 8 sean exitosas?');
}

function limpiarBinomial() {
    document.getElementById('bin-n').value = '';
    document.getElementById('bin-p').value = '';
    document.getElementById('bin-k').value = '';
    document.getElementById('resultados-binomial').style.display = 'none';
    document.getElementById('proc-binomial-seccion').style.display = 'none';
    document.getElementById('interp-binomial-seccion').style.display = 'none';
    document.getElementById('tabla-binomial').innerHTML = '';
    ocultarMensajesDist('binomial');
}


// ============================================
//  ██████  DISTRIBUCIÓN HIPERGEOMÉTRICA  ██████
// ============================================

/**
 * Calcula P(X = k) para una distribución Hipergeométrica
 * Fórmula: P(X=k) = [C(K,k) × C(N-K, n-k)] / C(N,n)
 */
function probHipergeometrica(N, K, n, k) {
    return (combinaciones(K, k) * combinaciones(N - K, n - k)) / combinaciones(N, n);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR HIPERGEOMÉTRICA
 */
function calcularHipergeometrica() {
    ocultarMensajesDist('hiper');

    const NInput = document.getElementById('hiper-N').value;
    const KInput = document.getElementById('hiper-K').value;
    const nInput = document.getElementById('hiper-n').value;
    const kInput = document.getElementById('hiper-k').value;

    // Validar N
    const N = parseInt(NInput);
    if (isNaN(N) || N < 1) {
        mostrarErrorDist('hiper', '"N" (población) debe ser un número entero mayor o igual a 1.');
        return;
    }

    // Validar K
    const K = parseInt(KInput);
    if (isNaN(K) || K < 0 || K > N) {
        mostrarErrorDist('hiper', `"K" (éxitos en la población) debe ser un entero entre 0 y N (${N}).`);
        return;
    }

    // Validar n
    const n = parseInt(nInput);
    if (isNaN(n) || n < 1 || n > N) {
        mostrarErrorDist('hiper', `"n" (tamaño de muestra) debe ser un entero entre 1 y N (${N}).`);
        return;
    }

    // Validar k
    const k = parseInt(kInput);
    const kMin = Math.max(0, n - (N - K));
    const kMax = Math.min(n, K);
    if (isNaN(k) || k < kMin || k > kMax) {
        mostrarErrorDist('hiper', `"k" debe ser un entero entre ${kMin} y ${kMax} para estos parámetros.`);
        return;
    }

    // Calcular probabilidad
    const prob = probHipergeometrica(N, K, n, k);

    // Media y varianza
    const media = n * K / N;
    const varianza = n * (K / N) * (1 - K / N) * (N - n) / (N - 1);
    const desviacion = Math.sqrt(varianza);

    // Mostrar resultados
    const tabla = document.getElementById('tabla-hiper');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>N (población total)</td><td>${N}</td></tr>
        <tr><td>K (éxitos en la población)</td><td>${K}</td></tr>
        <tr><td>n (tamaño de la muestra)</td><td>${n}</td></tr>
        <tr><td>k (éxitos observados)</td><td>${k}</td></tr>
        <tr><td>Media μ = n·K/N</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ²</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X = ${k})</strong></td><td><strong>${redondear(prob, 6)}</strong> (${redondear(prob*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-hiper').style.display = 'block';

    // Procedimiento
    const cKk = combinaciones(K, k);
    const cNK_nk = combinaciones(N - K, n - k);
    const cNn = combinaciones(N, n);
    document.getElementById('proc-hiper').textContent =
`FÓRMULA: P(X=k) = [C(K,k) × C(N-K, n-k)] / C(N,n)

PARÁMETROS: N=${N}, K=${K}, n=${n}, k=${k}

CÁLCULO:
C(K,k) = C(${K},${k}) = ${cKk}
C(N-K, n-k) = C(${N-K},${n-k}) = ${cNK_nk}
C(N,n) = C(${N},${n}) = ${cNn}

P(X=${k}) = (${cKk} × ${cNK_nk}) / ${cNn}
P(X=${k}) = ${cKk * cNK_nk} / ${cNn}
P(X=${k}) = ${redondear(prob, 6)}

MEDIA Y VARIANZA:
μ = n × K/N = ${n} × ${K}/${N} = ${redondear(media, 4)}
σ² = n × (K/N) × (1-K/N) × (N-n)/(N-1)
σ² = ${n} × ${redondear(K/N, 4)} × ${redondear(1-K/N, 4)} × ${redondear((N-n)/(N-1), 4)}
σ² = ${redondear(varianza, 4)}`;
    document.getElementById('proc-hiper-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-hiper').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X representa el número de éxitos en una muestra de ${n} elementos extraída SIN reemplazo de una población de ${N}.\n` +
`La esperanza E(X) = ${redondear(media, 4)} indica el número esperado de éxitos.\n\n` +
`• P(X = ${k}) = ${redondear(prob*100, 2)}%: probabilidad de encontrar exactamente ${k} éxitos en la muestra.\n\n` +
`⚠️ NOTA: A diferencia de la Binomial, aquí los ensayos NO son independientes porque la extracción es sin reemplazo. Cada elemento extraído cambia la composición de la población.`;
    document.getElementById('interp-hiper-seccion').style.display = 'block';
}

function cargarEjemploHipergeometrica() {
    document.getElementById('hiper-N').value = '20';
    document.getElementById('hiper-K').value = '5';
    document.getElementById('hiper-n').value = '4';
    document.getElementById('hiper-k').value = '1';
    mostrarExitoDist('hiper', '✅ Ejemplo cargado: Un centro de datos tiene 20 servidores, 5 con discos defectuosos. Se inspeccionan 4 sin reemplazo. ¿Probabilidad de que exactamente 1 sea defectuoso?');
}

function limpiarHipergeometrica() {
    document.getElementById('hiper-N').value = '';
    document.getElementById('hiper-K').value = '';
    document.getElementById('hiper-n').value = '';
    document.getElementById('hiper-k').value = '';
    document.getElementById('resultados-hiper').style.display = 'none';
    document.getElementById('proc-hiper-seccion').style.display = 'none';
    document.getElementById('interp-hiper-seccion').style.display = 'none';
    document.getElementById('tabla-hiper').innerHTML = '';
    ocultarMensajesDist('hiper');
}


// ============================================
//  ██████  DISTRIBUCIÓN POISSON  ██████
// ============================================

/**
 * Calcula P(X = k) para una distribución Poisson
 * Fórmula: P(X=k) = (λ^k × e^(-λ)) / k!
 */
function probPoissonIndividual(lambda, k) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Calcula P(X ≤ k) sumando P(X=0) + P(X=1) + ... + P(X=k)
 */
function probPoissonAcumulada(lambda, k) {
    let suma = 0;
    for (let i = 0; i <= k; i++) {
        suma += probPoissonIndividual(lambda, i);
    }
    return suma;
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR POISSON
 */
function calcularPoisson() {
    ocultarMensajesDist('pois');

    const lambdaInput = document.getElementById('pois-lambda').value;
    const intervaloInput = document.getElementById('pois-intervalo').value;
    const kInput = document.getElementById('pois-k').value;

    // Validar λ base
    const lambdaBase = parseFloat(lambdaInput);
    if (isNaN(lambdaBase) || lambdaBase <= 0) {
        mostrarErrorDist('pois', '"λ" (tasa promedio) debe ser un número mayor que 0.');
        return;
    }

    // Validar multiplicador de intervalo
    const intervalo = parseFloat(intervaloInput);
    if (isNaN(intervalo) || intervalo <= 0) {
        mostrarErrorDist('pois', '"Intervalo" debe ser un número mayor que 0.');
        return;
    }

    // Validar k
    const k = parseInt(kInput);
    if (isNaN(k) || k < 0) {
        mostrarErrorDist('pois', '"k" debe ser un número entero mayor o igual a 0.');
        return;
    }

    // AJUSTAR λ AL INTERVALO (requisito del proyecto)
    const lambdaAjustada = lambdaBase * intervalo;

    // Calcular probabilidades
    const pExacta = probPoissonIndividual(lambdaAjustada, k);
    const pMaximo = probPoissonAcumulada(lambdaAjustada, k);
    const pMinimo = 1 - (k > 0 ? probPoissonAcumulada(lambdaAjustada, k - 1) : 0);

    // Media y varianza (en Poisson ambas son iguales a λ)
    const media = lambdaAjustada;
    const varianza = lambdaAjustada;
    const desviacion = Math.sqrt(lambdaAjustada);

    // Mostrar resultados
    const tabla = document.getElementById('tabla-poisson');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>λ base (por intervalo unitario)</td><td>${lambdaBase}</td></tr>
        <tr><td>Multiplicador del intervalo (t)</td><td>${intervalo}</td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>λ ajustada = λ × t</strong></td><td><strong>${redondear(lambdaAjustada, 4)}</strong></td></tr>
        <tr><td>k (eventos deseados)</td><td>${k}</td></tr>
        <tr><td>Media μ = λ</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ² = λ</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X = ${k})</strong> exactamente k</td><td><strong>${redondear(pExacta, 6)}</strong> (${redondear(pExacta*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${k})</strong> como máximo k</td><td><strong>${redondear(pMaximo, 6)}</strong> (${redondear(pMaximo*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${k})</strong> al menos k</td><td><strong>${redondear(pMinimo, 6)}</strong> (${redondear(pMinimo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-poisson').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-poisson').textContent =
`FÓRMULA: P(X=k) = (λ^k × e^(-λ)) / k!

PARÁMETROS:
λ base = ${lambdaBase} (eventos por intervalo unitario)
t = ${intervalo} (multiplicador del intervalo)
k = ${k}

AJUSTE DE λ AL INTERVALO:
λ ajustada = λ base × t = ${lambdaBase} × ${intervalo} = ${redondear(lambdaAjustada, 4)}

CÁLCULO P(X = ${k}):
λ^k = ${redondear(lambdaAjustada, 4)}^${k} = ${redondear(Math.pow(lambdaAjustada, k), 6)}
e^(-λ) = e^(-${redondear(lambdaAjustada, 4)}) = ${redondear(Math.exp(-lambdaAjustada), 6)}
k! = ${k}! = ${factorial(k)}
P(X=${k}) = (${redondear(Math.pow(lambdaAjustada, k), 6)} × ${redondear(Math.exp(-lambdaAjustada), 6)}) / ${factorial(k)}
P(X=${k}) = ${redondear(pExacta, 6)}

CÁLCULO P(X ≤ ${k}):
P(X≤${k}) = P(X=0) + P(X=1) + ... + P(X=${k}) = ${redondear(pMaximo, 6)}

CÁLCULO P(X ≥ ${k}):
P(X≥${k}) = 1 - P(X≤${k-1}) = 1 - ${redondear(k > 0 ? probPoissonAcumulada(lambdaAjustada, k-1) : 0, 6)} = ${redondear(pMinimo, 6)}

MEDIA Y VARIANZA (en Poisson son iguales):
μ = λ = ${redondear(lambdaAjustada, 4)}
σ² = λ = ${redondear(lambdaAjustada, 4)}`;
    document.getElementById('proc-poisson-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-poisson').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X representa el número de eventos en el intervalo analizado.\n` +
`La esperanza E(X) = ${redondear(lambdaAjustada, 4)} indica el número promedio de eventos esperados.\n\n` +
`• P(X = ${k}) = ${redondear(pExacta*100, 2)}%: probabilidad de que ocurran exactamente ${k} eventos.\n` +
`• P(X ≤ ${k}) = ${redondear(pMaximo*100, 2)}%: probabilidad de que ocurran como máximo ${k} eventos.\n` +
`• P(X ≥ ${k}) = ${redondear(pMinimo*100, 2)}%: probabilidad de que ocurran al menos ${k} eventos.\n\n` +
`⚠️ NOTA: λ se ajustó de ${lambdaBase} (por intervalo unitario) a ${redondear(lambdaAjustada, 4)} (para el intervalo de ${intervalo}). Esto permite analizar diferentes ventanas de tiempo o espacio.`;
    document.getElementById('interp-poisson-seccion').style.display = 'block';
}

function cargarEjemploPoisson() {
    document.getElementById('pois-lambda').value = '3';
    document.getElementById('pois-intervalo').value = '1';
    document.getElementById('pois-k').value = '5';
    mostrarExitoDist('pois', '✅ Ejemplo cargado: Un servidor recibe 3 errores por hora en promedio. ¿Probabilidad de recibir exactamente 5 errores en 1 hora? Cambia el intervalo a 2 para analizar 2 horas.');
}

function limpiarPoisson() {
    document.getElementById('pois-lambda').value = '';
    document.getElementById('pois-intervalo').value = '';
    document.getElementById('pois-k').value = '';
    document.getElementById('resultados-poisson').style.display = 'none';
    document.getElementById('proc-poisson-seccion').style.display = 'none';
    document.getElementById('interp-poisson-seccion').style.display = 'none';
    document.getElementById('tabla-poisson').innerHTML = '';
    ocultarMensajesDist('pois');
}


// ============================================
// MANEJO DE MENSAJES (compartido por los 3 módulos)
// ============================================
function mostrarErrorDist(modulo, mensaje) {
    const div = document.getElementById('error-' + modulo);
    div.textContent = '⚠️ ' + mensaje;
    div.style.display = 'block';
}

function mostrarExitoDist(modulo, mensaje) {
    const div = document.getElementById('exito-' + modulo);
    div.textContent = mensaje;
    div.style.display = 'block';
}

function ocultarMensajesDist(modulo) {
    document.getElementById('error-' + modulo).style.display = 'none';
    document.getElementById('exito-' + modulo).style.display = 'none';
}