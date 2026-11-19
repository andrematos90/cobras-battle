// Texturas do chão geradas por código (sem arquivos de imagem): ladrilhos 256x256 que se repetem sem emenda.
// "stone" (pedra) continua sendo a imagem de src/chaoData.js; aqui ficam areia e grama.
export const TERRAINS = [["stone", "🪨 Pedra"], ["sand", "🏖️ Areia"], ["grass", "🌿 Grama"]];

const rng = seed => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
// ruído de valor periódico: x,y em [0,1) e o resultado se repete nas bordas (por isso o ladrilho emenda)
function pnoise(G, rnd) {
  const v = Array.from({ length: G * G }, rnd);
  return (x, y) => {
    const fx = x * G, fy = y * G, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = v[(y0 % G) * G + (x0 % G)], b = v[(y0 % G) * G + ((x0 + 1) % G)], c = v[((y0 + 1) % G) * G + (x0 % G)], d = v[((y0 + 1) % G) * G + ((x0 + 1) % G)];
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  };
}
const N = 256;
export function makeTile(kind) {
  const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d");
  const rnd = rng(kind === "sand" ? 7 : 21), n1 = pnoise(5, rnd), n2 = pnoise(16, rnd), n3 = pnoise(48, rnd);
  const im = g.createImageData(N, N), d = im.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N, a = n1(u, v) - .5, b = n2(u, v) - .5, c = n3(u, v) - .5, i = (y * N + x) * 4; let R, G, B;
    if (kind === "sand") {
      const rip = Math.sin((v * 16 + a * 1.6) * 6.2832) * 5;   // marcas de vento: 16 ondas por ladrilho (número inteiro = emenda perfeita)
      const k = a * 34 + b * 18 + c * 16 + rip + (rnd() - .5) * 12;
      R = 218 + k; G = 190 + k * .95; B = 138 + k * .8;
    } else {
      const k = a * 34 + b * 22 + c * 14 + (rnd() - .5) * 10;
      R = 44 + k * .6; G = 122 + k * 1.1; B = 40 + k * .5;
    }
    d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const wrap = f => { for (let ox = -N; ox <= N; ox += N) for (let oy = -N; oy <= N; oy += N) f(ox, oy); };   // desenha também nas bordas opostas
  if (kind === "grass") {   // folhas de grama
    const cols = ["#2f7d32", "#3f9a3c", "#5bb450", "#256b2b", "#7ccb5f"];
    g.lineCap = "round";
    for (let q = 0; q < 1100; q++) {
      const x = rnd() * N, y = rnd() * N, l = 6 + rnd() * 9, an = -1.5708 + (rnd() - .5) * .9; g.strokeStyle = cols[(rnd() * cols.length) | 0]; g.lineWidth = 1 + rnd() * 1.4;
      wrap((ox, oy) => { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(an) * l, y + oy + Math.sin(an) * l); g.stroke(); });
    }
  } else {   // grãos e pedrinhas de areia
    for (let q = 0; q < 260; q++) {
      const x = rnd() * N, y = rnd() * N, r = .6 + rnd() * 1.6; g.fillStyle = rnd() < .5 ? "rgba(120,86,44,.35)" : "rgba(255,244,214,.4)";
      wrap((ox, oy) => { g.beginPath(); g.arc(x + ox, y + oy, r, 0, 6.2832); g.fill(); });
    }
  }
  g.fillStyle = kind === "sand" ? "rgba(70,44,18,.22)" : "rgba(6,22,10,.24)"; g.fillRect(0, 0, N, N);   // escurece um pouco para as cobras e a comida aparecerem
  return cv;
}
