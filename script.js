document.getElementById("planoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // --- 1. OBTENER DATOS (Incluyendo el select de Phi) ---
  const thetaDeg = parseFloat(e.target.theta.value);
  const masa = parseFloat(e.target.masa.value);
  const miu = parseFloat(e.target.miu.value);
  const phiDeg = parseFloat(e.target.phi.value); // Valor del select
  
  // Magnitud de Fuerza APLICADA: Fija en 100 N para cumplir con la simplificación.
  const fAplicadaConstante = 100; 

  // Validación
  if (isNaN(thetaDeg) || isNaN(masa) || isNaN(miu) || isNaN(phiDeg)) {
    alert("Por favor, ingresa o selecciona todos los valores numéricos correctamente.");
    return;
  }
  if (miu < 0 || miu > 1.2) {
    alert("El Coeficiente de Fricción (μk) debe ser un valor razonable (0 a 1.2).");
    return;
  }

  // --- 2. FÍSICA Y CÁLCULOS ---
  const g = 9.81; 
  
  // Conversión a radianes
  const theta = thetaDeg * (Math.PI / 180);
  const phi = phiDeg * (Math.PI / 180);

  // A. Componentes del Peso (W)
  const weight = masa * g;
  const Wx = weight * Math.sin(theta); 
  const Wy = weight * Math.cos(theta);

  // B. Componentes de la Fuerza Aplicada (F)
  const Fx = fAplicadaConstante * Math.cos(phi);
  const Fy = fAplicadaConstante * Math.sin(phi);

  // C. Fuerza Normal (N = Wy - Fy)
  let normal = Wy - Fy;
  if (normal < 0) normal = 0; // El bloque no puede empujar el suelo hacia arriba

  // D. Fricción Cinética (fk = miu * N)
  const friccion = miu * normal;

  // E. Sumatoria de Fuerzas en X para Aceleración
  // POSITIVO (+) = Hacia ARRIBA del plano
  let fuerzaNetaSinFriccion = Fx - Wx;
  
  let aceleracion = 0;
  let direccionMovimiento = 0; // 1: Sube, -1: Baja, 0: Quieto
  let fuerzaTotal = 0;

  // Determinar dirección de la fricción y fuerza total
  if (fuerzaNetaSinFriccion > 0) {
    // Intenta subir. Fricción va hacia ABAJO (-)
    fuerzaTotal = fuerzaNetaSinFriccion - friccion; 
    if (fuerzaTotal > 0) {
        aceleracion = fuerzaTotal / masa;
        direccionMovimiento = 1; // Sube
    } 
  } else if (fuerzaNetaSinFriccion < 0) {
    // Intenta bajar. Fricción va hacia ARRIBA (+)
    fuerzaTotal = fuerzaNetaSinFriccion + friccion;
    if (fuerzaTotal < 0) { // Solo si la fuerza neta hacia abajo es mayor que la fricción
        aceleracion = fuerzaTotal / masa;
        direccionMovimiento = -1; // Baja
    }
  }

  // Si la aceleración calculada es un número muy pequeño cerca de cero (por fricción estática o equilibrio), la forzamos a 0.
  if (Math.abs(aceleracion) < 1e-4) aceleracion = 0;

  // --- 3. MOSTRAR RESULTADOS ---
  document.getElementById("valNormal").textContent = normal.toFixed(2);
  document.getElementById("valFriccion").textContent = friccion.toFixed(2);
  document.getElementById("valAcel").textContent = aceleracion.toFixed(2);
  document.getElementById("resultado").style.display = "flex"; // Usar flex para mostrar la tarjeta

  // --- 4. DIBUJAR EN CANVAS ---
  dibujarSistema(theta, phi, normal, friccion, aceleracion, direccionMovimiento, fAplicadaConstante);
});


// (Mantener la función dibujarSistema y dibujarFlecha como estaban)

// Función de dibujo gráfico
function dibujarSistema(theta, phi, N, fk, a, dirMov, Fapp) {
  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save(); 

  // Configurar centro y rotación del mundo
  const cx = w / 2;
  const cy = h / 2 + 60; 
  
  ctx.translate(cx, cy); 
  ctx.rotate(-theta);    

  // 1. DIBUJAR PLANO 
  ctx.beginPath();
  ctx.moveTo(-220, 0);
  ctx.lineTo(220, 0);
  ctx.strokeStyle = "#34495e";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 2. DIBUJAR BLOQUE
  const size = 70;
  const bx = 0;         
  const by = -size / 2; 
  
  ctx.fillStyle = "#3498db"; 
  ctx.fillRect(-size/2, -size, size, size); 
  ctx.strokeStyle = "#2980b9";
  ctx.lineWidth = 2;
  ctx.strokeRect(-size/2, -size, size, size);
  
  // --- VECTORES DE FUERZA ---
  
  // A. Fuerza Aplicada (F) - Naranja
  if (Fapp > 0) {
    const lenF = 110;
    const fx = lenF * Math.cos(phi);
    const fy = -lenF * Math.sin(phi); 
    dibujarFlecha(ctx, bx, by, fx, fy, "F", "#e67e22");
  }

  // B. Fuerza Normal (N) - Verde
  if (N > 0) {
    dibujarFlecha(ctx, bx, by, 0, -90, "N", "#27ae60");
  }

  // C. Fuerza de Fricción (fk) - Rojo
  if (fk > 0 && dirMov !== 0) {
    const lenFk = 60;
    const dirX = (dirMov === 1) ? -1 : 1; 
    dibujarFlecha(ctx, bx, by + size/2, dirX * lenFk, 0, "fr", "#c0392b");
  }

  // D. Aceleración (a) - Morado 
  if (Math.abs(a) > 0.01) {
    const lenA = 80;
    const dirA = (a > 0) ? 1 : -1; 
    dibujarFlecha(ctx, bx, by - size - 10, dirA * lenA, 0, "a", "#8e44ad");
  }

  // E. Peso (mg) - Gris (Siempre vertical hacia abajo)
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(theta); 
  dibujarFlecha(ctx, 0, 0, 0, 100, "mg", "#7f8c8d");
  ctx.restore();

  ctx.restore(); 
}

// Función auxiliar para flechas (sin cambios)
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
  ctx.fillStyle = color;
  ctx.fillText(texto, endX + (dx > 0 ? 10 : -20), endY + (dy > 0 ? 20 : -10));
}
