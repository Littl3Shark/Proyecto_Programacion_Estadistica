// ============================================
// MÓDULOS 6-11: DISTRIBUCIONES CONTINUAS
// Uniforme, Exponencial, Normal, Lognormal, Gamma, Ji-cuadrada
// ============================================


// ============================================
// 🔧 FUNCIONES MATEMÁTICAS BASE
// Estas funciones se usan internamente para
// calcular probabilidades de distribuciones continuas
// ============================================

/**
 * Logaritmo de la función Gamma: ln(Γ(x))
 * Aproximación de Lanczos (g=7, n=9)
 * Precisión: ~15 dígitos significativos
 */
function lnGamma(x) {
    if (x <= 0) return Infinity;

    const coef = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    if (x < 0.5) {
        // Fórmula de reflexión: Γ(x)·Γ(1-x) = π/sin(πx)
        return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
    }

    x -= 1;
    let a = coef[0];
    const t = x + 7.5; // g + 0.5
    for (let i = 1; i < 9; i++) {
        a += coef[i] / (x + i);
    }

    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Función Gamma incompleta regularizada P(a, x)
 * Se usa para Gamma, Ji-cuadrada y Exponencial
 */
function gammaIncompletaReg(a, x) {
    if (x < 0 || a <= 0) return NaN;
    if (x === 0) return 0;

    if (x < a + 1) {
        return gammaIncSerie(a, x);
    } else {
        return 1 - gammaIncFraccion(a, x);
    }
}

// Serie de Taylor para P(a, x) cuando x < a+1
function gammaIncSerie(a, x) {
    const maxIter = 200;
    const eps = 1e-10;

    let suma = 1 / a;
    let termino = 1 / a;

    for (let n = 1; n <= maxIter; n++) {
        termino *= x / (a + n);
        suma += termino;
        if (Math.abs(termino) < Math.abs(suma) * eps) break;
    }

    return suma * Math.exp(-x + a * Math.log(x) - lnGamma(a));
}

// Fracción continua para Q(a, x) = 1 - P(a, x) cuando x >= a+1
function gammaIncFraccion(a, x) {
    const maxIter = 200;
    const eps = 1e-10;
    const tiny = 1e-30;

    let b = x + 1 - a;
    let c = 1 / tiny;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i <= maxIter; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < tiny) d = tiny;
        c = b + an / c;
        if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d;
        const delta = d * c;
        h *= delta;
        if (Math.abs(delta - 1) < eps) break;
    }

    return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/**
 * CDF de la Normal Estándar: Φ(z) = P(Z ≤ z)
 * Aproximación de Abramowitz & Stegun (error < 7.5×10⁻⁸)
 */
function cdfNormalEstandar(z) {
    if (z === 0) return 0.5;

    const negativo = z < 0;
    if (negativo) z = -z;

    const t = 1 / (1 + 0.2316419 * z);
    const phi = 0.3989422804014327 * Math.exp(-z * z / 2);

    const resultado = 1 - phi * t * (
        0.319381530 + t * (
        -0.356563782 + t * (
         1.781477937 + t * (
        -1.821255978 + t *
         1.330274429)))
    );

    return negativo ? 1 - resultado : resultado;
}

/**
 * PDF de la Normal Estándar: φ(z)
 */
function pdfNormalEstandar(z) {
    return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * Redondear a N decimales (ya definida en discretas.js,
 * pero la redefinimos aquí por si se usa este archivo solo)
 */
if (typeof redondear === 'undefined') {
    function redondear(num, decimales) {
        const factor = Math.pow(10, decimales);
        return Math.round(num * factor) / factor;
    }
}


// ============================================
//  ██████  DISTRIBUCIÓN UNIFORME CONTINUA  ██████
// ============================================

/**
 * CDF Uniforme: P(X ≤ x)
 */
function cdfUniforme(x, a, b) {
    if (x <= a) return 0;
    if (x >= b) return 1;
    return (x - a) / (b - a);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR UNIFORME
 */
function calcularUniforme() {
    ocultarMensajesDist('uni');

    const aInput = document.getElementById('uni-a').value;
    const bInput = document.getElementById('uni-b').value;
    const xInput = document.getElementById('uni-x').value;
    const cInput = document.getElementById('uni-c').value;
    const dInput = document.getElementById('uni-d').value;

    // Validar a
    const a = parseFloat(aInput);
    if (isNaN(a)) {
        mostrarErrorDist('uni', '"a" (límite inferior) debe ser un número.');
        return;
    }

    // Validar b
    const b = parseFloat(bInput);
    if (isNaN(b)) {
        mostrarErrorDist('uni', '"b" (límite superior) debe ser un número.');
        return;
    }

    // b debe ser mayor que a
    if (b <= a) {
        mostrarErrorDist('uni', `"b" (${b}) debe ser mayor que "a" (${a}).`);
        return;
    }

    // Validar x (punto para P(X≤x) y P(X≥x))
    const x = parseFloat(xInput);
    if (isNaN(x)) {
        mostrarErrorDist('uni', '"x" (punto de evaluación) debe ser un número.');
        return;
    }

    // Validar c y d (intervalo)
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d)) {
        mostrarErrorDist('uni', '"c" y "d" (intervalo) deben ser números.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('uni', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // Calcular media y varianza
    const media = (a + b) / 2;
    const varianza = Math.pow(b - a, 2) / 12;
    const desviacion = Math.sqrt(varianza);

    // Calcular probabilidades
    const pIzquierda = cdfUniforme(x, a, b);        // P(X ≤ x)
    const pDerecha = 1 - cdfUniforme(x, a, b);      // P(X ≥ x)
    const pIntervalo = cdfUniforme(d, a, b) - cdfUniforme(c, a, b); // P(c ≤ X ≤ d)

    // Mostrar resultados
    const tabla = document.getElementById('tabla-uniforme');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>a (límite inferior)</td><td>${a}</td></tr>
        <tr><td>b (límite superior)</td><td>${b}</td></tr>
        <tr><td>Media μ = (a+b)/2</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ² = (b-a)²/12</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-uniforme').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-uniforme').textContent =
`FÓRMULA DE DENSIDAD: f(x) = 1/(b-a) para a ≤ x ≤ b

PARÁMETROS: a=${a}, b=${b}

MEDIA Y VARIANZA:
μ = (a + b) / 2 = (${a} + ${b}) / 2 = ${redondear(media, 4)}
σ² = (b - a)² / 12 = (${b} - ${a})² / 12 = ${redondear(Math.pow(b-a,2),2)} / 12 = ${redondear(varianza, 4)}

PROBABILIDAD IZQUIERDA P(X ≤ ${x}):
F(x) = (x - a) / (b - a) = (${x} - ${a}) / (${b} - ${a}) = ${redondear(pIzquierda, 6)}
${x <= a ? 'Nota: x ≤ a, por lo que P(X ≤ x) = 0' : x >= b ? 'Nota: x ≥ b, por lo que P(X ≤ x) = 1' : ''}

PROBABILIDAD DERECHA P(X ≥ ${x}):
P(X ≥ ${x}) = 1 - P(X ≤ ${x}) = 1 - ${redondear(pIzquierda, 6)} = ${redondear(pDerecha, 6)}

PROBABILIDAD INTERVALO P(${c} ≤ X ≤ ${d}):
P(${c} ≤ X ≤ ${d}) = F(${d}) - F(${c})
= ${redondear(cdfUniforme(d, a, b), 6)} - ${redondear(cdfUniforme(c, a, b), 6)} = ${redondear(pIntervalo, 6)}`;
    document.getElementById('proc-uniforme-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-uniforme').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X se distribuye uniformemente entre ${a} y ${b}. Todos los valores en ese intervalo tienen la misma probabilidad de ocurrir.\n` +
`La esperanza E(X) = ${redondear(media, 4)} es el punto medio del intervalo.\n\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}%: probabilidad de que X sea a lo sumo ${x}.\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}%: probabilidad de que X sea al menos ${x}.\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}%: probabilidad de que X esté entre ${c} y ${d}.`;
    document.getElementById('interp-uniforme-seccion').style.display = 'block';
}

function cargarEjemploUniforme() {
    document.getElementById('uni-a').value = '100';
    document.getElementById('uni-b').value = '500';
    document.getElementById('uni-x').value = '200';
    document.getElementById('uni-c').value = '200';
    document.getElementById('uni-d').value = '400';
    mostrarExitoDist('uni', '✅ Ejemplo cargado: El tiempo de respuesta de un servidor varía uniformemente entre 100ms y 500ms. ¿Probabilidades de diferentes rangos?');
}

function limpiarUniforme() {
    ['uni-a','uni-b','uni-x','uni-c','uni-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-uniforme').style.display = 'none';
    document.getElementById('proc-uniforme-seccion').style.display = 'none';
    document.getElementById('interp-uniforme-seccion').style.display = 'none';
    document.getElementById('tabla-uniforme').innerHTML = '';
    ocultarMensajesDist('uni');
}


// ============================================
//  ██████  DISTRIBUCIÓN EXPONENCIAL  ██████
// ============================================

/**
 * CDF Exponencial: P(X ≤ x) = 1 - e^(-λx)
 */
function cdfExponencial(x, lambda) {
    if (x < 0) return 0;
    return 1 - Math.exp(-lambda * x);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR EXPONENCIAL
 */
function calcularExponencial() {
    ocultarMensajesDist('expo');

    const lambdaInput = document.getElementById('expo-lambda').value;
    const xInput = document.getElementById('expo-x').value;
    const cInput = document.getElementById('expo-c').value;
    const dInput = document.getElementById('expo-d').value;

    // Validar λ
    const lambda = parseFloat(lambdaInput);
    if (isNaN(lambda) || lambda <= 0) {
        mostrarErrorDist('expo', '"λ" (tasa) debe ser un número mayor que 0.');
        return;
    }

    // Validar x
    const x = parseFloat(xInput);
    if (isNaN(x) || x < 0) {
        mostrarErrorDist('expo', '"x" debe ser un número ≥ 0 (la exponencial no toma valores negativos).');
        return;
    }

    // Validar c y d
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d) || c < 0 || d < 0) {
        mostrarErrorDist('expo', '"c" y "d" deben ser números ≥ 0.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('expo', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // Calcular media y varianza
    const media = 1 / lambda;
    const varianza = 1 / (lambda * lambda);
    const desviacion = Math.sqrt(varianza);

    // Calcular probabilidades
    const pIzquierda = cdfExponencial(x, lambda);
    const pDerecha = 1 - cdfExponencial(x, lambda);
    const pIntervalo = cdfExponencial(d, lambda) - cdfExponencial(c, lambda);

    // Mostrar resultados
    const tabla = document.getElementById('tabla-exponencial');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>λ (tasa de ocurrencia)</td><td>${lambda}</td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>Media μ = 1/λ</strong> (tiempo promedio)</td><td><strong>${redondear(media, 4)}</strong></td></tr>
        <tr><td>Varianza σ² = 1/λ²</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-exponencial').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-exponencial').textContent =
`FÓRMULA DE DENSIDAD: f(x) = λ·e^(-λx) para x ≥ 0

PARÁMETRO: λ = ${lambda}

DIFERENCIACIÓN λ vs 1/λ:
• λ = ${lambda} → es la TASA (eventos por unidad de tiempo)
• 1/λ = 1/${lambda} = ${redondear(media, 4)} → es el TIEMPO PROMEDIO entre eventos

MEDIA Y VARIANZA:
μ = 1/λ = ${redondear(media, 4)}
σ² = 1/λ² = 1/${redondear(lambda*lambda, 6)} = ${redondear(varianza, 4)}

PROBABILIDAD IZQUIERDA P(X ≤ ${x}):
F(x) = 1 - e^(-λx) = 1 - e^(-${lambda}×${x}) = 1 - e^(-${redondear(lambda*x, 4)})
= 1 - ${redondear(Math.exp(-lambda*x), 6)} = ${redondear(pIzquierda, 6)}

PROBABILIDAD DERECHA P(X ≥ ${x}):
P(X ≥ ${x}) = e^(-λx) = e^(-${redondear(lambda*x, 4)}) = ${redondear(pDerecha, 6)}

PROBABILIDAD INTERVALO P(${c} ≤ X ≤ ${d}):
P(${c} ≤ X ≤ ${d}) = e^(-λc) - e^(-λd)
= e^(-${redondear(lambda*c, 4)}) - e^(-${redondear(lambda*d, 4)})
= ${redondear(Math.exp(-lambda*c), 6)} - ${redondear(Math.exp(-lambda*d), 6)} = ${redondear(pIntervalo, 6)}`;
    document.getElementById('proc-exponencial-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-exponencial').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X representa el tiempo entre eventos consecutivos que ocurren a una tasa constante λ = ${lambda}.\n` +
`La esperanza E(X) = 1/λ = ${redondear(media, 4)} es el tiempo promedio entre eventos.\n\n` +
`⚠️ IMPORTANTE: λ es la TASA (${lambda} eventos por unidad), mientras que 1/λ = ${redondear(media, 4)} es el TIEMPO PROMEDIO entre eventos. No son lo mismo.\n\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}%: probabilidad de que el tiempo sea a lo sumo ${x}.\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}%: probabilidad de que el tiempo sea al menos ${x}.\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}%: probabilidad de que el tiempo esté entre ${c} y ${d}.\n\n` +
`📌 La exponencial tiene "falta de memoria": P(X > s+t | X > s) = P(X > t). El tiempo transcurrido no afecta la probabilidad futura.`;
    document.getElementById('interp-exponencial-seccion').style.display = 'block';
}

function cargarEjemploExponencial() {
    document.getElementById('expo-lambda').value = '0.002';
    document.getElementById('expo-x').value = '200';
    document.getElementById('expo-c').value = '200';
    document.getElementById('expo-d').value = '1000';
    mostrarExitoDist('expo', '✅ Ejemplo cargado: La tasa de fallos de un servidor es λ=0.002 por hora. El tiempo promedio entre fallos es 1/λ=500 horas.');
}

function limpiarExponencial() {
    ['expo-lambda','expo-x','expo-c','expo-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-exponencial').style.display = 'none';
    document.getElementById('proc-exponencial-seccion').style.display = 'none';
    document.getElementById('interp-exponencial-seccion').style.display = 'none';
    document.getElementById('tabla-exponencial').innerHTML = '';
    ocultarMensajesDist('expo');
}
