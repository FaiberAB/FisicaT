document.getElementById("planoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const thetaDeg = parseFloat(e.target.theta.value);
  const masa = parseFloat(e.target.masa.value);
  const miu = parseFloat(e.target.miu.value);
  const phiDeg = parseFloat(e.target.phi.value);
  
  const fAplicadaConstante = 100; 

  if (isNaN(thetaDeg) || isNaN(masa) || isNaN(miu) || isNaN(phiDeg)) {
    alert("Por favor, ingresa todos los valores correctamente.");
    return;
  }
  if (miu < 0 || miu > 1.2) {
    alert("El Coeficiente de Fricción debe estar entre 0 y 1.2");
    return;
  }

  const g = 9.81; 
  const theta = thetaDeg * (Math.PI / 180);
  const phi = phiDeg * (Math.PI / 180);

  const weight = masa * g;
  const Wx = weight * Math.sin(theta); 
  const Wy = weight * Math.cos(theta);

  const Fx = fAplicadaConstante * Math.cos(phi);
  const Fy = fAplicadaConstante * Math.sin(phi);

  let normal = Wy - Fy;
  if (normal < 0) normal = 0; 

  const friccion = miu * normal;

  let fuerzaNetaSinFriccion = Fx - Wx;
  
  let aceleracion = 0;
  let direccionMovimiento = 0; 
  let fuerzaTotal = 0;

  if (fuerzaNetaSinFriccion > 0) {
    fuerzaTotal = fuerzaNetaSinFriccion - friccion; 
    if (fuerzaTotal > 0) {
        aceleracion = fuerzaTotal / masa;
        direccionMovimiento = 1; 
    } 
  } else if (fuerzaNetaSinFriccion < 0) {
    fuerzaTotal = fuerzaNetaSinFriccion + friccion;
    if (fuerzaTotal < 0) { 
        aceleracion = fuerzaTotal / masa;
        direccionMovimiento = -1; 
    }
  }

  if (Math.abs(aceleracion) < 1e-4) aceleracion = 0;

  document.getElementById("valNormal").textContent = normal.toFixed(2);
  document.getElementById("valFriccion").textContent = friccion.toFixed(2);
  document.getElementById("valAcel").textContent = aceleracion.toFixed(2);
  
  // Forzar display flex para que respete la dirección de columna del CSS
  document.getElementById("resultado").style.display = "flex"; 

  dibujarSistema(theta, phi, normal, friccion, aceleracion, direccionMovimiento, fAplicadaConstante);
});

function dibujarSistema(theta, phi, N, fk, a, dirMov, Fapp) {
  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save(); 

  const cx = w / 2;
  const cy = h / 2 + 60; 
  
  ctx.translate(cx, cy); 
  ctx.rotate(-theta);    

  ctx.beginPath();
  ctx.moveTo(-220, 0);
  ctx.lineTo(220, 0);
  ctx.strokeStyle = "#34495e";
  ctx.lineWidth = 4;
  ctx.stroke();

  const size = 70;
  const bx = 0;         
  const by = -size / 2; 
  
  ctx.fillStyle = "#3498db"; 
  ctx.fillRect(-size/2, -size, size, size); 
  ctx.strokeStyle = "#2980b9";
  ctx.lineWidth = 2;
  ctx.strokeRect(-size/2, -size, size, size);
  
  if (Fapp > 0) {
    const lenF = 110;
    const fx = lenF * Math.cos(phi);
    const fy = -lenF * Math.sin(phi); 
    dibujarFlecha(ctx, bx, by, fx, fy, "F", "#e67e22");
  }

  if (N > 0) {
    dibujarFlecha(ctx, bx, by, 0, -90, "N", "#27ae60");
  }

  if (fk > 0 && dirMov !== 0) {
    const lenFk = 60;
    const dirX = (dirMov === 1) ? -1 : 1; 
    dibujarFlecha(ctx, bx, by + size/2, dirX * lenFk, 0, "fr", "#c0392b");
  }

  if (Math.abs(a) > 0.01) {
    const lenA = 80;
    const dirA = (a > 0) ? 1 : -1; 
    dibujarFlecha(ctx, bx, by - size - 10, dirA * lenA, 0, "a", "#8e44ad");
  }

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(theta); 
  dibujarFlecha(ctx, 0, 0, 0, 100, "mg", "#7f8c8d");
  ctx.restore();

  ctx.restore(); 
}

function dibujarFlecha(ctx, x, y, dx, dy, texto, color) {
  const endX = x + dx;
  const endY = y + dy;
  
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  const angulo = Math.atan2(dy, dx);
  const head = 12;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - head * Math.cos(angulo - Math.PI/6), endY - head * Math.sin(angulo - Math.PI/6));
  ctx.lineTo(endX - head * Math.cos(angulo + Math.PI/6), endY - head * Math.sin(angulo + Math.PI/6));
  ctx.fill();

  ctx.font = "bold 14px Arial";
  ctx.fillStyle = color;
  ctx.fillText(texto, endX + (dx > 0 ? 10 : -20), endY + (dy > 0 ? 20 : -10));
}
