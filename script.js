document.getElementById("planoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // --- 1. OBTENER DATOS ---
  // Reemplazamos comas por puntos para evitar errores decimales
  const thetaDeg = parseFloat(e.target.theta.value.replace(",", "."));
  const masa = parseFloat(e.target.masa.value.replace(",", "."));
  const miu = parseFloat(e.target.miu.value.replace(",", "."));
  const fAplicada = parseFloat(e.target.fuerza.value.replace(",", ".")); 
  const phiDeg = parseFloat(e.target.phi.value.replace(",", "."));       

  // Validación simple
  if (isNaN(thetaDeg) || isNaN(masa) || isNaN(miu) || isNaN(fAplicada) || isNaN(phiDeg)) {
    alert("Por favor, revisa que todos los campos contengan números válidos.");
    return;
  }

  // --- 2. FÍSICA Y CÁLCULOS ---
  const g = 9.81; // Gravedad estándar
  
  // Convertir grados a radianes (necesario para Math.sin/cos)
  const theta = thetaDeg * (Math.PI / 180); // Ángulo plano
  const phi = phiDeg * (Math.PI / 180);     // Ángulo fuerza externa

  // A. Componentes del Peso (Weight)
  // Wx: Paralelo al plano (hala hacia abajo)
  // Wy: Perpendicular al plano (aplasta contra el suelo)
  const weight = masa * g;
  const Wx = weight * Math.sin(theta); 
  const Wy = weight * Math.cos(theta);

  // B. Componentes de la Fuerza Aplicada (F)
  // Fx: Paralelo al plano (empuja arriba o abajo dependiendo de phi)
  // Fy: Perpendicular (levanta o empuja contra el suelo)
  const Fx = fAplicada * Math.cos(phi);
  const Fy = fAplicada * Math.sin(phi);

  // C. Calcular Fuerza Normal (N)
  // Sumatoria Fy = 0 -> N + Fy - Wy = 0  =>  N = Wy - Fy
  // Si Fy es muy grande y levanta el bloque, N es 0.
  let normal = Wy - Fy;
  if (normal < 0) normal = 0; 

  // D. Calcular Fricción Cinética (fk)
  // fk = Coeficiente * Normal
  const friccion = miu * normal;

  // E. Sumatoria de Fuerzas en X (Eje del movimiento)
  // Definimos: POSITIVO (+) = Hacia ARRIBA del plano
  // Fuerza Neta teórica = (Fuerza externa en X) - (Peso en X)
  let fuerzaNetaSinFriccion = Fx - Wx;
  
  let aceleracion = 0;
  let direccionMovimiento = 0; // 1: Sube, -1: Baja, 0: Quieto

  // Lógica de movimiento:
  if (fuerzaNetaSinFriccion > 0) {
    // Intenta subir -> La fricción se opone (va hacia abajo -)
    // Verificamos si tiene fuerza suficiente para vencer la fricción
    const fuerzaTotal = fuerzaNetaSinFriccion - friccion;
    if (fuerzaTotal > 0) {
        aceleracion = fuerzaTotal / masa;
        direccionMovimiento = 1; // Sube
    } else {
        aceleracion = 0; // Se queda quieto por fricción
    }
  } else if (fuerzaNetaSinFriccion < 0) {
    // Intenta bajar -> La fricción se opone (va hacia arriba +)
    // Verificamos fuerza (usamos Math.abs para magnitudes)
    const fuerzaEmpujeBajada = Math.abs(fuerzaNetaSinFriccion);
    if (fuerzaEmpujeBajada > friccion) {
        // Fuerza resultante neta (hacia abajo, negativa)
        const fuerzaTotal = fuerzaNetaSinFriccion + friccion; 
        aceleracion = fuerzaTotal / masa; // Dará negativo
        direccionMovimiento = -1; // Baja
    } else {
        aceleracion = 0;
    }
  }

  // --- 3. MOSTRAR RESULTADOS ---
  document.getElementById("valNormal").textContent = normal.toFixed(2);
  document.getElementById("valFriccion").textContent = friccion.toFixed(2);
  document.getElementById("valAcel").textContent = aceleracion.toFixed(2);
  document.getElementById("resultado").style.display = "block";

  // --- 4. DIBUJAR EN CANVAS ---
  dibujarSistema(theta, phi, normal, friccion, aceleracion, direccionMovimiento, fAplicada);
});

// Función de dibujo gráfico
function dibujarSistema(theta, phi, N, fk, a, dirMov, Fapp) {
  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // Limpiar lienzo
  ctx.clearRect(0, 0, w, h);
  ctx.save(); // Guardar estado inicial

  // Configurar centro y rotación del mundo
  const cx = w / 2;
  const cy = h / 2 + 60; // Un poco más abajo del centro visual
  
  ctx.translate(cx, cy); // Mover origen al centro
  ctx.rotate(-theta);    // Rotar todo el sistema según el ángulo del plano

  // 1. DIBUJAR PLANO (SUELO)
  ctx.beginPath();
  ctx.moveTo(-220, 0);
  ctx.lineTo(220, 0);
  ctx.strokeStyle = "#34495e";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 2. DIBUJAR BLOQUE
  const size = 70;
  const bx = 0;         // Centro X del bloque
  const by = -size / 2; // Centro Y del bloque (mitad de altura hacia arriba)
  
  ctx.fillStyle = "#3498db"; // Azul
  ctx.fillRect(-size/2, -size, size, size); // Dibuja desde esquina sup-izq
  ctx.strokeStyle = "#2980b9";
  ctx.lineWidth = 2;
  ctx.strokeRect(-size/2, -size, size, size);

  // --- VECTORES DE FUERZA ---
  
  // A. Fuerza Aplicada (F) - Naranja
  if (Fapp > 0) {
    const lenF = 110;
    // Componentes visuales relativas al plano
    const fx = lenF * Math.cos(phi);
    const fy = -lenF * Math.sin(phi); // Y canvas es invertido
    dibujarFlecha(ctx, bx, by, fx, fy, "F", "#e67e22");
  }

  // B. Fuerza Normal (N) - Verde
  if (N > 0) {
    dibujarFlecha(ctx, bx, by, 0, -90, "N", "#27ae60");
  }

  // C. Fuerza de Fricción (fk) - Rojo
  if (fk > 0 && dirMov !== 0) {
    const lenFk = 60;
    const dirX = (dirMov === 1) ? -1 : 1; // Opuesto al movimiento
    // Dibujar en la base del bloque
    dibujarFlecha(ctx, bx, by + size/2, dirX * lenFk, 0, "fr", "#c0392b");
  }

  // D. Aceleración (a) - Morado (al lado del bloque)
  if (Math.abs(a) > 0.01) {
    const lenA = 80;
    const dirA = (a > 0) ? 1 : -1; 
    dibujarFlecha(ctx, bx, by - size - 10, dirA * lenA, 0, "a", "#8e44ad");
  }

  // E. Peso (mg) - Gris (Siempre vertical hacia abajo)
  // Truco: Rotar temporalmente el contexto de vuelta para dibujar vertical real
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(theta); // Contrarrestar rotación del plano
  dibujarFlecha(ctx, 0, 0, 0, 100, "mg", "#7f8c8d");
  ctx.restore();

  ctx.restore(); // Restaurar estado final
}

// Función auxiliar para flechas
function dibujarFlecha(ctx, x, y, dx, dy, texto, color) {
  const endX = x + dx;
  const endY = y + dy;
  
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  
  // Línea
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Cabeza
  const angulo = Math.atan2(dy, dx);
  const head = 12;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - head * Math.cos(angulo - Math.PI/6), endY - head * Math.sin(angulo - Math.PI/6));
  ctx.lineTo(endX - head * Math.cos(angulo + Math.PI/6), endY - head * Math.sin(angulo + Math.PI/6));
  ctx.fill();

  // Texto etiqueta
  ctx.font = "bold 14px Arial";
  // Ajuste ligero de posición de texto
  ctx.fillText(texto, endX + (dx > 0 ? 10 : -20), endY + (dy > 0 ? 20 : -10));
}
