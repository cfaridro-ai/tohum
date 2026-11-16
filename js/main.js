/* TOHUM — main.js
   Cuatro módulos: 1) arranque, 2) lluvia de código, 3) cursor, 4) navegación */

const wait = ms => new Promise(r => setTimeout(r, ms));

/* 1) ARRANQUE: escribe líneas y luego revela el sitio */
(async () => {
  const boot = document.getElementById('boot');
  const out = document.getElementById('boot-text');
  const lines = ['TOHUM_OS v0.1', '> cargando semilla...', '> montando interfaz...', '> listo.'];
  boot.addEventListener('click', () => boot.classList.add('done')); // clic = saltar
  for (const l of lines) { out.textContent += l + '\n'; await wait(380); }
  await wait(400);
  boot.classList.add('done');
})();

/* 2) LLUVIA DE CÓDIGO en canvas (guiño a los monitores de tu referencia) */
const canvas = document.getElementById('rain');
const ctx = canvas.getContext('2d');
const chars = '01アイウエオカキクケコTOHUM'.split('');
const fs = 16;               // tamaño de letra
let drops = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  // una "gota" por columna, cada una arranca en altura aleatoria
  drops = Array.from({ length: Math.floor(canvas.width / fs) }, () => Math.random() * -50);
}
resize();
addEventListener('resize', resize);

setInterval(() => {
  ctx.fillStyle = 'rgba(4,6,5,.12)';         // rastro: pinta casi-negro semitransparente
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#8fe000';
  ctx.font = fs + 'px monospace';
  drops.forEach((y, i) => {
    ctx.fillText(chars[Math.random() * chars.length | 0], i * fs, y * fs);
    drops[i] = (y * fs > canvas.height && Math.random() > .975) ? 0 : y + 1;
  });
}, 50);

/* 3) CURSOR: el punto sigue directo, el anillo con retraso (lerp) */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const label = ring.querySelector('span');
let mx = 0, my = 0, rx = 0, ry = 0;

addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.transform = `translate(${mx}px, ${my}px)`;
});
(function loop() {
  rx += (mx - rx) * .15;     // se acerca 15% de la distancia en cada frame
  ry += (my - ry) * .15;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  requestAnimationFrame(loop);
})();

// Todo elemento con data-cursor="TEXTO" agranda el anillo y muestra ese texto
document.querySelectorAll('[data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.classList.add('hover'); label.textContent = el.dataset.cursor; });
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* 4) NAVEGACIÓN: clic en los blades o flechas ← → */
const blades = [...document.querySelectorAll('.blade')];
const panels = [...document.querySelectorAll('.panel')];
let cur = 0;

function go(i) {
  cur = (i + panels.length) % panels.length;   // el % hace que dé la vuelta
  blades.forEach((b, n) => b.classList.toggle('active', n === cur));
  panels.forEach((p, n) => p.classList.toggle('active', n === cur));
}
blades.forEach((b, i) => b.addEventListener('click', () => go(i)));
addEventListener('keydown', e => {
  if (document.querySelector('.screen.open')) return;   // pantalla abierta: las flechas no navegan
  if (e.key === 'ArrowRight') go(cur + 1);
  if (e.key === 'ArrowLeft') go(cur - 1);
});
go(0);

/* Reloj de la barra superior */
const clock = document.getElementById('clock');
const tick = () => clock.textContent = new Date().toLocaleTimeString('es-MX', { hour12: false });
tick(); setInterval(tick, 1000);

/* 5) GLITCH DEL TÍTULO: TOHUM ⇄ CARLOS ALVAREZ al pasar el cursor */
const heroTitle = document.querySelector('.title');
const NAME_ON = 'CARLOS\nALVAREZ';
const NAME_OFF = 'TOHUM';
const junk = '01#%&$@/<>ｱｲｳ';      // caracteres basura que aparecen mientras cambia
let scrambleTimer, glitchTimeout;

function scramble(to) {
  clearInterval(scrambleTimer);
  const total = 12;                  // número de "frames" de la transformación
  let frame = 0;
  scrambleTimer = setInterval(() => {
    frame++;
    // las letras ya "resueltas" se quedan; el resto sigue siendo basura aleatoria
    const text = [...to].map((ch, i) =>
      ch === '\n' || i < (frame / total) * to.length
        ? ch
        : junk[Math.random() * junk.length | 0]
    ).join('');
    heroTitle.textContent = text;
    heroTitle.dataset.text = text;   // para que las capas de color copien el mismo texto
    if (frame >= total) clearInterval(scrambleTimer);
  }, 35);
}

function burst() {
  heroTitle.classList.add('glitching');
  clearTimeout(glitchTimeout);
  glitchTimeout = setTimeout(() => heroTitle.classList.remove('glitching'), 450);
}

heroTitle.addEventListener('mouseenter', () => {
  // fija el ancho actual para que al encogerse el texto el mouse no "salga" y parpadee
  heroTitle.style.minWidth = heroTitle.offsetWidth + 'px';
  heroTitle.classList.add('is-name');
  burst(); scramble(NAME_ON);
});
heroTitle.addEventListener('mouseleave', () => {
  heroTitle.classList.remove('is-name');
  heroTitle.style.minWidth = '';
  burst(); scramble(NAME_OFF);
});

/* 6) PANTALLAS DE CATEGORÍA: abrir con data-screen, cerrar con Volver o Esc */
function closeScreen() {
  const open = document.querySelector('.screen.open');
  if (open) open.classList.remove('open');
  ring.classList.remove('hover');          // el anillo no se queda agrandado
}

document.querySelectorAll('[data-screen]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();                    // evita que el href="#..." salte la página
    const target = document.getElementById('screen-' + link.dataset.screen);
    if (!target) return;                   // si esa pantalla aún no existe, no hace nada
    target.scrollTop = 0;
    target.classList.add('open');
    ring.classList.remove('hover');
  });
});

document.querySelectorAll('.screen-back').forEach(b => b.addEventListener('click', closeScreen));
addEventListener('keydown', e => { if (e.key === 'Escape') closeScreen(); });
