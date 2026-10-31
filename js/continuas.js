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
// ============================================
//  ██████  DISTRIBUCIÓN NORMAL  ██████
// ============================================

/**
 * CDF Normal con media μ y desviación estándar σ
 * Se estandariza: z = (x - μ) / σ, luego se usa Φ(z)
 */
function cdfNormal(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return cdfNormalEstandar(z);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR NORMAL
 */
function calcularNormal() {
    ocultarMensajesDist('norm');

    const muInput = document.getElementById('norm-mu').value;
    const sigmaInput = document.getElementById('norm-sigma').value;
    const xInput = document.getElementById('norm-x').value;
    const cInput = document.getElementById('norm-c').value;
    const dInput = document.getElementById('norm-d').value;

    // Validar μ
    const mu = parseFloat(muInput);
    if (isNaN(mu)) {
        mostrarErrorDist('norm', '"μ" (media) debe ser un número.');
        return;
    }

    // Validar σ
    const sigma = parseFloat(sigmaInput);
    if (isNaN(sigma) || sigma <= 0) {
        mostrarErrorDist('norm', '"σ" (desviación estándar) debe ser un número mayor que 0.');
        return;
    }

    // Validar x
    const x = parseFloat(xInput);
    if (isNaN(x)) {
        mostrarErrorDist('norm', '"x" (punto de evaluación) debe ser un número.');
        return;
    }

    // Validar c y d
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d)) {
        mostrarErrorDist('norm', '"c" y "d" (intervalo) deben ser números.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('norm', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // Estandarización: z = (x - μ) / σ
    const zX = (x - mu) / sigma;
    const zC = (c - mu) / sigma;
    const zD = (d - mu) / sigma;

    // Calcular probabilidades usando la CDF normal estándar
    const pIzquierda = cdfNormalEstandar(zX);
    const pDerecha = 1 - cdfNormalEstandar(zX);
    const pIntervalo = cdfNormalEstandar(zD) - cdfNormalEstandar(zC);

    // Media y varianza
    const media = mu;
    const varianza = sigma * sigma;

    // Mostrar resultados
    const tabla = document.getElementById('tabla-normal');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>μ (media)</td><td>${mu}</td></tr>
        <tr><td>σ (desviación estándar)</td><td>${sigma}</td></tr>
        <tr><td>Varianza σ²</td><td>${redondear(varianza, 4)}</td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>z para x=${x}</strong></td><td><strong>${redondear(zX, 4)}</strong></td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>z para c=${c}</strong></td><td><strong>${redondear(zC, 4)}</strong></td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>z para d=${d}</strong></td><td><strong>${redondear(zD, 4)}</strong></td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-normal').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-normal').textContent =
`ESTANDARIZACIÓN: z = (x - μ) / σ
Convierte cualquier Normal(μ, σ) a la Normal Estándar N(0,1) para usar la tabla Φ.

PARÁMETROS: μ = ${mu}, σ = ${sigma}

ESTANDARIZACIÓN DE CADA PUNTO:
z(x=${x}) = (${x} - ${mu}) / ${sigma} = ${redondear(zX, 4)}
z(c=${c}) = (${c} - ${mu}) / ${sigma} = ${redondear(zC, 4)}
z(d=${d}) = (${d} - ${mu}) / ${sigma} = ${redondear(zD, 4)}

PROBABILIDAD IZQUIERDA P(X ≤ ${x}):
P(X ≤ ${x}) = Φ(${redondear(zX, 4)}) = ${redondear(pIzquierda, 6)}

PROBABILIDAD DERECHA P(X ≥ ${x}):
P(X ≥ ${x}) = 1 - Φ(${redondear(zX, 4)}) = 1 - ${redondear(pIzquierda, 6)} = ${redondear(pDerecha, 6)}

PROBABILIDAD INTERVALO P(${c} ≤ X ≤ ${d}):
P(${c} ≤ X ≤ ${d}) = Φ(${redondear(zD, 4)}) - Φ(${redondear(zC, 4)})
= ${redondear(cdfNormalEstandar(zD), 6)} - ${redondear(cdfNormalEstandar(zC), 6)} = ${redondear(pIntervalo, 6)}

MEDIA Y VARIANZA:
Media = μ = ${mu}
Varianza = σ² = ${sigma}² = ${redondear(varianza, 4)}`;
    document.getElementById('proc-normal-seccion').style.display = 'block';

    // Interpretación (incluye significado de σ como pide el proyecto)
    document.getElementById('interp-normal').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X sigue una distribución Normal con media μ = ${mu} y desviación estándar σ = ${sigma}.\n` +
`La esperanza E(X) = μ = ${mu} es el valor central de la distribución.\n\n` +
`📌 SIGNIFICADO DE σ (desviación estándar):\n` +
`σ = ${sigma} mide qué tan dispersos están los datos alrededor de la media.\n` +
`• μ ± 1σ = [${redondear(mu - sigma, 2)}, ${redondear(mu + sigma, 2)}] → contiene ≈68.27% de los datos\n` +
`• μ ± 2σ = [${redondear(mu - 2*sigma, 2)}, ${redondear(mu + 2*sigma, 2)}] → contiene ≈95.45% de los datos\n` +
`• μ ± 3σ = [${redondear(mu - 3*sigma, 2)}, ${redondear(mu + 3*sigma, 2)}] → contiene ≈99.73% de los datos\n` +
`Un σ pequeño indica datos concentrados cerca de μ; un σ grande indica mayor variabilidad.\n\n` +
`RESULTADOS:\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}% (z = ${redondear(zX, 4)})\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}% (z = ${redondear(zX, 4)})\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}% (z de ${redondear(zC, 4)} a ${redondear(zD, 4)})`;
    document.getElementById('interp-normal-seccion').style.display = 'block';
}

function cargarEjemploNormal() {
    document.getElementById('norm-mu').value = '200';
    document.getElementById('norm-sigma').value = '30';
    document.getElementById('norm-x').value = '250';
    document.getElementById('norm-c').value = '150';
    document.getElementById('norm-d').value = '250';
    mostrarExitoDist('norm', '✅ Ejemplo cargado: El tiempo de respuesta de un servidor sigue N(μ=200ms, σ=30ms). ¿Probabilidad de diferentes rangos?');
}

function limpiarNormal() {
    ['norm-mu','norm-sigma','norm-x','norm-c','norm-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-normal').style.display = 'none';
    document.getElementById('proc-normal-seccion').style.display = 'none';
    document.getElementById('interp-normal-seccion').style.display = 'none';
    document.getElementById('tabla-normal').innerHTML = '';
    ocultarMensajesDist('norm');
}


// ============================================
//  ██████  DISTRIBUCIÓN LOGNORMAL  ██████
// ============================================

/**
 * CDF Lognormal
 * Si X ~ Lognormal(μ_y, σ_y), entonces ln(X) ~ Normal(μ_y, σ_y)
 * P(X ≤ x) = Φ((ln(x) - μ_y) / σ_y)
 */
function cdfLognormal(x, muY, sigmaY) {
    if (x <= 0) return 0;
    const z = (Math.log(x) - muY) / sigmaY;
    return cdfNormalEstandar(z);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR LOGNORMAL
 */
function calcularLognormal() {
    ocultarMensajesDist('logn');

    const muYInput = document.getElementById('logn-muy').value;
    const sigmaYInput = document.getElementById('logn-sigmay').value;
    const xInput = document.getElementById('logn-x').value;
    const cInput = document.getElementById('logn-c').value;
    const dInput = document.getElementById('logn-d').value;

    // Validar μ_y
    const muY = parseFloat(muYInput);
    if (isNaN(muY)) {
        mostrarErrorDist('logn', '"μ_y" (media del logaritmo) debe ser un número.');
        return;
    }

    // Validar σ_y
    const sigmaY = parseFloat(sigmaYInput);
    if (isNaN(sigmaY) || sigmaY <= 0) {
        mostrarErrorDist('logn', '"σ_y" (desviación del logaritmo) debe ser un número mayor que 0.');
        return;
    }

    // Validar x (debe ser > 0 porque ln(x) requiere x > 0)
    const x = parseFloat(xInput);
    if (isNaN(x) || x <= 0) {
        mostrarErrorDist('logn', '"x" debe ser un número mayor que 0 (la Lognormal solo toma valores positivos).');
        return;
    }

    // Validar c y d (deben ser > 0)
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d) || c <= 0 || d <= 0) {
        mostrarErrorDist('logn', '"c" y "d" deben ser números mayores que 0.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('logn', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // ESTANDARIZACIÓN DEL LOGARITMO NATURAL
    // Si X ~ Lognormal(μ_y, σ_y), entonces Y = ln(X) ~ Normal(μ_y, σ_y)
    // z = (ln(x) - μ_y) / σ_y
    const lnX = Math.log(x);
    const lnC = Math.log(c);
    const lnD = Math.log(d);
    const zX = (lnX - muY) / sigmaY;
    const zC = (lnC - muY) / sigmaY;
    const zD = (lnD - muY) / sigmaY;

    // Calcular probabilidades
    const pIzquierda = cdfNormalEstandar(zX);
    const pDerecha = 1 - cdfNormalEstandar(zX);
    const pIntervalo = cdfNormalEstandar(zD) - cdfNormalEstandar(zC);

    // Media y varianza de X (la variable lognormal original, NO del logaritmo)
    const mediaX = Math.exp(muY + (sigmaY * sigmaY) / 2);
    const varianzaX = (Math.exp(sigmaY * sigmaY) - 1) * Math.exp(2 * muY + sigmaY * sigmaY);
    const desviacionX = Math.sqrt(varianzaX);

    // Mostrar resultados
    const tabla = document.getElementById('tabla-lognormal');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>μ_y (media de ln(X))</td><td>${muY}</td></tr>
        <tr><td>σ_y (desviación de ln(X))</td><td>${sigmaY}</td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>Media de X = e^(μ_y + σ_y²/2)</strong></td><td><strong>${redondear(mediaX, 4)}</strong></td></tr>
        <tr style="background-color:#fef9e7;"><td><strong>Varianza de X</strong></td><td><strong>${redondear(varianzaX, 4)}</strong></td></tr>
        <tr><td>Desviación estándar de X</td><td>${redondear(desviacionX, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>ln(x=${x})</td><td>${redondear(lnX, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>z para x = (ln(x)-μ_y)/σ_y</td><td>${redondear(zX, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>ln(c=${c})</td><td>${redondear(lnC, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>z para c</td><td>${redondear(zC, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>ln(d=${d})</td><td>${redondear(lnD, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>z para d</td><td>${redondear(zD, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-lognormal').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-lognormal').textContent =
`TRANSFORMACIÓN LOGARÍTMICA:
Si X ~ Lognormal(μ_y, σ_y), entonces Y = ln(X) ~ Normal(μ_y, σ_y).
Esto permite usar la Normal Estándar para calcular probabilidades.

PARÁMETROS: μ_y = ${muY}, σ_y = ${sigmaY}

PASO 1: APLICAR LOGARITMO NATURAL
ln(x=${x}) = ${redondear(lnX, 4)}
ln(c=${c}) = ${redondear(lnC, 4)}
ln(d=${d}) = ${redondear(lnD, 4)}

PASO 2: ESTANDARIZAR
z = (ln(x) - μ_y) / σ_y
z(x) = (${redondear(lnX, 4)} - ${muY}) / ${sigmaY} = ${redondear(zX, 4)}
z(c) = (${redondear(lnC, 4)} - ${muY}) / ${sigmaY} = ${redondear(zC, 4)}
z(d) = (${redondear(lnD, 4)} - ${muY}) / ${sigmaY} = ${redondear(zD, 4)}

PASO 3: USAR CDF NORMAL ESTÁNDAR Φ
P(X ≤ ${x}) = Φ(${redondear(zX, 4)}) = ${redondear(pIzquierda, 6)}
P(X ≥ ${x}) = 1 - Φ(${redondear(zX, 4)}) = ${redondear(pDerecha, 6)}
P(${c} ≤ X ≤ ${d}) = Φ(${redondear(zD, 4)}) - Φ(${redondear(zC, 4)}) = ${redondear(pIntervalo, 6)}

MEDIA Y VARIANZA DE X (la variable original, no del logaritmo):
Media de X = e^(μ_y + σ_y²/2) = e^(${muY} + ${redondear(sigmaY*sigmaY/2, 4)}) = e^(${redondear(muY + sigmaY*sigmaY/2, 4)}) = ${redondear(mediaX, 4)}
Varianza de X = (e^(σ_y²) - 1) × e^(2μ_y + σ_y²)
= (e^(${redondear(sigmaY*sigmaY, 4)}) - 1) × e^(${redondear(2*muY + sigmaY*sigmaY, 4)})
= (${redondear(Math.exp(sigmaY*sigmaY) - 1, 6)}) × ${redondear(Math.exp(2*muY + sigmaY*sigmaY), 4)}
= ${redondear(varianzaX, 4)}`;
    document.getElementById('proc-lognormal-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-lognormal').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X sigue una distribución Lognormal. Esto significa que ln(X) sigue una distribución Normal con μ_y = ${muY} y σ_y = ${sigmaY}.\n\n` +
`📌 ESTANDARIZACIÓN DEL LOGARITMO NATURAL:\n` +
`Para calcular probabilidades, primero aplicamos ln() al valor de X, luego estandarizamos:\n` +
`z = (ln(x) - μ_y) / σ_y\n` +
`Esto convierte el problema Lognormal en uno Normal Estándar, que podemos resolver con Φ(z).\n\n` +
`La esperanza E(X) = e^(μ_y + σ_y²/2) = ${redondear(mediaX, 4)} es la media de X (NO es μ_y).\n` +
`⚠️ NOTA: La media de X es diferente de μ_y porque la transformación exponencial no es lineal.\n\n` +
`RESULTADOS:\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}% (z = ${redondear(zX, 4)})\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}% (z = ${redondear(zX, 4)})\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}% (z de ${redondear(zC, 4)} a ${redondear(zD, 4)})`;
    document.getElementById('interp-lognormal-seccion').style.display = 'block';
}

function cargarEjemploLognormal() {
    document.getElementById('logn-muy').value = '3';
    document.getElementById('logn-sigmay').value = '0.5';
    document.getElementById('logn-x').value = '30';
    document.getElementById('logn-c').value = '15';
    document.getElementById('logn-d').value = '30';
    mostrarExitoDist('logn', '✅ Ejemplo cargado: El tiempo de respuesta de una API sigue Lognormal(μ_y=3, σ_y=0.5). Los valores de x, c, d están en ms.');
}

function limpiarLognormal() {
    ['logn-muy','logn-sigmay','logn-x','logn-c','logn-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-lognormal').style.display = 'none';
    document.getElementById('proc-lognormal-seccion').style.display = 'none';
    document.getElementById('interp-lognormal-seccion').style.display = 'none';
    document.getElementById('tabla-lognormal').innerHTML = '';
    ocultarMensajesDist('logn');
}
// ============================================
//  ██████  DISTRIBUCIÓN GAMMA  ██████
// ============================================

/**
 * CDF Gamma con parámetros de forma α y escala θ
 * P(X ≤ x) = gammaIncompletaReg(α, x/θ)
 *
 * Nota: gammaIncompletaReg(a, y) calcula P(a, y) = γ(a,y)/Γ(a)
 * que es la CDF de la Gamma con forma a y escala 1.
 * Para escala θ, se evalúa en x/θ.
 */
function cdfGamma(x, alfa, theta) {
    if (x <= 0) return 0;
    return gammaIncompletaReg(alfa, x / theta);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR GAMMA
 */
function calcularGamma() {
    ocultarMensajesDist('gam');

    const alfaInput = document.getElementById('gam-alfa').value;
    const thetaInput = document.getElementById('gam-theta').value;
    const xInput = document.getElementById('gam-x').value;
    const cInput = document.getElementById('gam-c').value;
    const dInput = document.getElementById('gam-d').value;

    // Validar α (forma)
    const alfa = parseFloat(alfaInput);
    if (isNaN(alfa) || alfa <= 0) {
        mostrarErrorDist('gam', '"α" (forma) debe ser un número mayor que 0.');
        return;
    }

    // Validar θ (escala)
    const theta = parseFloat(thetaInput);
    if (isNaN(theta) || theta <= 0) {
        mostrarErrorDist('gam', '"θ" (escala) debe ser un número mayor que 0.');
        return;
    }

    // Validar x
    const x = parseFloat(xInput);
    if (isNaN(x) || x < 0) {
        mostrarErrorDist('gam', '"x" debe ser un número ≥ 0 (la Gamma solo toma valores positivos).');
        return;
    }

    // Validar c y d
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d) || c < 0 || d < 0) {
        mostrarErrorDist('gam', '"c" y "d" deben ser números ≥ 0.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('gam', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // Calcular media y varianza
    const media = alfa * theta;
    const varianza = alfa * theta * theta;
    const desviacion = Math.sqrt(varianza);

    // Calcular probabilidades usando la gamma incompleta regularizada
    const pIzquierda = cdfGamma(x, alfa, theta);
    const pDerecha = 1 - cdfGamma(x, alfa, theta);
    const pIntervalo = cdfGamma(d, alfa, theta) - cdfGamma(c, alfa, theta);

    // Valores intermedios para el procedimiento
    const yX = x / theta;
    const yC = c / theta;
    const yD = d / theta;

    // Mostrar resultados
    const tabla = document.getElementById('tabla-gamma');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>α (forma)</td><td>${alfa}</td></tr>
        <tr><td>θ (escala)</td><td>${theta}</td></tr>
        <tr><td>Media μ = α·θ</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ² = α·θ²</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>x/θ (valor transformado de x=${x})</td><td>${redondear(yX, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-gamma').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-gamma').textContent =
`FUNCIÓN DE DENSIDAD GAMMA:
f(x) = [x^(α-1) × e^(-x/θ)] / [Γ(α) × θ^α]  para x ≥ 0

PARÁMETROS: α = ${alfa} (forma), θ = ${theta} (escala)

MEDIA Y VARIANZA:
μ = α × θ = ${alfa} × ${theta} = ${redondear(media, 4)}
σ² = α × θ² = ${alfa} × ${theta}² = ${alfa} × ${redondear(theta*theta, 4)} = ${redondear(varianza, 4)}

CÁLCULO DE PROBABILIDADES:
La CDF de la Gamma(α, θ) se calcula con la función gamma incompleta regularizada:
P(X ≤ x) = P(α, x/θ) donde P(a,y) = γ(a,y)/Γ(a)

TRANSFORMACIÓN:
y(x) = x/θ = ${x}/${theta} = ${redondear(yX, 4)}
y(c) = c/θ = ${c}/${theta} = ${redondear(yC, 4)}
y(d) = d/θ = ${d}/${theta} = ${redondear(yD, 4)}

PROBABILIDAD IZQUIERDA P(X ≤ ${x}):
P(X ≤ ${x}) = P(${alfa}, ${redondear(yX, 4)}) = ${redondear(pIzquierda, 6)}

PROBABILIDAD DERECHA P(X ≥ ${x}):
P(X ≥ ${x}) = 1 - P(${alfa}, ${redondear(yX, 4)}) = ${redondear(pDerecha, 6)}

PROBABILIDAD INTERVALO P(${c} ≤ X ≤ ${d}):
P(${c} ≤ X ≤ ${d}) = P(${alfa}, ${redondear(yD, 4)}) - P(${alfa}, ${redondear(yC, 4)})
= ${redondear(cdfGamma(d, alfa, theta), 6)} - ${redondear(cdfGamma(c, alfa, theta), 6)}
= ${redondear(pIntervalo, 6)}

NOTA: El cálculo de P(a,y) usa serie de Taylor cuando y < a+1,
y fracción continua (método de Lentz) cuando y ≥ a+1.`;
    document.getElementById('proc-gamma-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-gamma').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X sigue una distribución Gamma con forma α = ${alfa} y escala θ = ${theta}.\n` +
`La esperanza E(X) = α·θ = ${redondear(media, 4)} representa el valor promedio.\n\n` +
`📌 PARÁMETROS:\n` +
`• α (forma) = ${alfa}: controla la forma de la curva. α=1 es exponencial, α>1 es unimodal.\n` +
`• θ (escala) = ${theta}: estira o comprime la distribución. Mayor θ → mayor dispersión.\n\n` +
`RESULTADOS:\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}%: probabilidad de que X sea a lo sumo ${x}.\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}%: probabilidad de que X sea al menos ${x}.\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}%: probabilidad de que X esté entre ${c} y ${d}.\n\n` +
`⚠️ NOTA: La Gamma generaliza a la Exponencial (cuando α=1) y a la Ji-cuadrada (cuando α=ν/2, θ=2).`;
    document.getElementById('interp-gamma-seccion').style.display = 'block';
}

function cargarEjemploGamma() {
    document.getElementById('gam-alfa').value = '3';
    document.getElementById('gam-theta').value = '2';
    document.getElementById('gam-x').value = '5';
    document.getElementById('gam-c').value = '3';
    document.getElementById('gam-d').value = '8';
    mostrarExitoDist('gam', '✅ Ejemplo cargado: Tiempo total de procesamiento de un lote de tareas (α=3, θ=2 minutos). Media esperada: 6 minutos.');
}

function limpiarGamma() {
    ['gam-alfa','gam-theta','gam-x','gam-c','gam-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-gamma').style.display = 'none';
    document.getElementById('proc-gamma-seccion').style.display = 'none';
    document.getElementById('interp-gamma-seccion').style.display = 'none';
    document.getElementById('tabla-gamma').innerHTML = '';
    ocultarMensajesDist('gam');
}


// ============================================
//  ██████  DISTRIBUCIÓN JI-CUADRADA  ██████
// ============================================

/**
 * CDF Ji-cuadrada con ν grados de libertad
 * Ji²(ν) es un caso especial de Gamma: Gamma(α=ν/2, θ=2)
 * P(X ≤ x) = gammaIncompletaReg(ν/2, x/2)
 */
function cdfJiCuadrada(x, nu) {
    if (x <= 0) return 0;
    return gammaIncompletaReg(nu / 2, x / 2);
}

/**
 * FUNCIÓN PRINCIPAL: CALCULAR JI-CUADRADA
 */
function calcularJiCuadrada() {
    ocultarMensajesDist('ji');

    const nuInput = document.getElementById('ji-nu').value;
    const xInput = document.getElementById('ji-x').value;
    const cInput = document.getElementById('ji-c').value;
    const dInput = document.getElementById('ji-d').value;

    // Validar ν
    const nu = parseFloat(nuInput);
    if (isNaN(nu) || nu <= 0) {
        mostrarErrorDist('ji', '"ν" (grados de libertad) debe ser un número mayor que 0.');
        return;
    }

    // Validar x
    const x = parseFloat(xInput);
    if (isNaN(x) || x < 0) {
        mostrarErrorDist('ji', '"x" debe ser un número ≥ 0 (la Ji-cuadrada solo toma valores positivos).');
        return;
    }

    // Validar c y d
    const c = parseFloat(cInput);
    const d = parseFloat(dInput);
    if (isNaN(c) || isNaN(d) || c < 0 || d < 0) {
        mostrarErrorDist('ji', '"c" y "d" deben ser números ≥ 0.');
        return;
    }
    if (d <= c) {
        mostrarErrorDist('ji', `"d" (${d}) debe ser mayor que "c" (${c}).`);
        return;
    }

    // Calcular media y varianza
    const media = nu;
    const varianza = 2 * nu;
    const desviacion = Math.sqrt(varianza);

    // Calcular probabilidades
    const pIzquierda = cdfJiCuadrada(x, nu);
    const pDerecha = 1 - cdfJiCuadrada(x, nu);
    const pIntervalo = cdfJiCuadrada(d, nu) - cdfJiCuadrada(c, nu);

    // Parámetros equivalentes de Gamma para el procedimiento
    const alfaGamma = nu / 2;
    const thetaGamma = 2;

    // Mostrar resultados
    const tabla = document.getElementById('tabla-jicuadrada');
    tabla.innerHTML = `
        <tr><th>Medida</th><th>Valor</th></tr>
        <tr><td>ν (grados de libertad)</td><td>${nu}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>Equivalente Gamma: α = ν/2</td><td>${redondear(alfaGamma, 4)}</td></tr>
        <tr style="background-color:#f0f4f8;"><td>Equivalente Gamma: θ</td><td>2</td></tr>
        <tr><td>Media μ = ν</td><td>${redondear(media, 4)}</td></tr>
        <tr><td>Varianza σ² = 2ν</td><td>${redondear(varianza, 4)}</td></tr>
        <tr><td>Desviación estándar σ</td><td>${redondear(desviacion, 4)}</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≤ ${x})</strong> izquierda</td><td><strong>${redondear(pIzquierda, 6)}</strong> (${redondear(pIzquierda*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(X ≥ ${x})</strong> derecha</td><td><strong>${redondear(pDerecha, 6)}</strong> (${redondear(pDerecha*100, 2)}%)</td></tr>
        <tr style="background-color:#eafaf1;"><td><strong>P(${c} ≤ X ≤ ${d})</strong> intervalo</td><td><strong>${redondear(pIntervalo, 6)}</strong> (${redondear(pIntervalo*100, 2)}%)</td></tr>
    `;
    document.getElementById('resultados-jicuadrada').style.display = 'block';

    // Procedimiento
    document.getElementById('proc-jicuadrada').textContent =
`RELACIÓN CON LA DISTRIBUCIÓN GAMMA:
Ji²(ν) = Gamma(α = ν/2, θ = 2)
Esto permite usar la función gamma incompleta regularizada.

PARÁMETRO: ν = ${nu} (grados de libertad)
Equivalente: α = ν/2 = ${redondear(alfaGamma, 4)}, θ = 2

MEDIA Y VARIANZA:
μ = ν = ${nu}
σ² = 2ν = 2 × ${nu} = ${redondear(varianza, 4)}

CÁLCULO DE PROBABILIDADES:
P(X ≤ x) = P(ν/2, x/2) donde P(a,y) es la gamma incompleta regularizada

PROBABILIDAD IZQUIERDA P(X ≤ ${x}):
P(X ≤ ${x}) = P(${redondear(alfaGamma, 4)}, ${x}/2) = P(${redondear(alfaGamma, 4)}, ${redondear(x/2, 4)}) = ${redondear(pIzquierda, 6)}

PROBABILIDAD DERECHA P(X ≥ ${x}):
P(X ≥ ${x}) = 1 - P(${redondear(alfaGamma, 4)}, ${redondear(x/2, 4)}) = ${redondear(pDerecha, 6)}

PROBABILIDAD INTERVALO P(${c} ≤ X ≤ ${d}):
P(${c} ≤ X ≤ ${d}) = P(${redondear(alfaGamma, 4)}, ${redondear(d/2, 4)}) - P(${redondear(alfaGamma, 4)}, ${redondear(c/2, 4)})
= ${redondear(cdfJiCuadrada(d, nu), 6)} - ${redondear(cdfJiCuadrada(c, nu), 6)}
= ${redondear(pIntervalo, 6)}

NOTA: La Ji-cuadrada se usa frecuentemente en:
• Pruebas de bondad de ajuste (Chi-square test)
• Pruebas de independencia en tablas de contingencia
• Estimación de varianzas poblacionales`;
    document.getElementById('proc-jicuadrada-seccion').style.display = 'block';

    // Interpretación
    document.getElementById('interp-jicuadrada').textContent =
`📊 INTERPRETACIÓN:\n\n` +
`La variable aleatoria X sigue una distribución Ji-cuadrada con ν = ${nu} grados de libertad.\n` +
`La esperanza E(X) = ν = ${nu} y la varianza σ² = 2ν = ${redondear(varianza, 4)}.\n\n` +
`📌 RELACIÓN CON GAMMA:\n` +
`Ji²(${nu}) equivale a Gamma(α=${redondear(alfaGamma, 4)}, θ=2).\n` +
`Esto significa que la Ji-cuadrada es un caso especial de la Gamma.\n\n` +
`RESULTADOS:\n` +
`• P(X ≤ ${x}) = ${redondear(pIzquierda*100, 2)}%: probabilidad de que X sea a lo sumo ${x}.\n` +
`• P(X ≥ ${x}) = ${redondear(pDerecha*100, 2)}%: probabilidad de que X sea al menos ${x}.\n` +
`• P(${c} ≤ X ≤ ${d}) = ${redondear(pIntervalo*100, 2)}%: probabilidad de que X esté entre ${c} y ${d}.\n\n` +
`📌 USO EN INGENIERÍA EN SISTEMAS:\n` +
`La Ji-cuadrada se usa en pruebas de bondad de ajuste para verificar si los datos observados (ej: tiempos de respuesta, frecuencias de errores) siguen una distribución teórica esperada.`;
    document.getElementById('interp-jicuadrada-seccion').style.display = 'block';
}

function cargarEjemploJiCuadrada() {
    document.getElementById('ji-nu').value = '4';
    document.getElementById('ji-x').value = '5';
    document.getElementById('ji-c').value = '2';
    document.getElementById('ji-d').value = '7';
    mostrarExitoDist('ji', '✅ Ejemplo cargado: Prueba de bondad de ajuste con ν=4 grados de libertad. Equivale a Gamma(α=2, θ=2).');
}

function limpiarJiCuadrada() {
    ['ji-nu','ji-x','ji-c','ji-d'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('resultados-jicuadrada').style.display = 'none';
    document.getElementById('proc-jicuadrada-seccion').style.display = 'none';
    document.getElementById('interp-jicuadrada-seccion').style.display = 'none';
    document.getElementById('tabla-jicuadrada').innerHTML = '';
    ocultarMensajesDist('ji');
}