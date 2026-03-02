import * as THREE from "three";

const API_HTTP = "http://127.0.0.1:8788/text";

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ---------- scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050806");

// ---------- camera ----------
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.2, 6);

// ---------- lights ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const key = new THREE.PointLight(0x00ff99, 2.2);
key.position.set(2.5, 2.0, 3.5);
scene.add(key);

// ---------- starfield ----------
const starsGeo = new THREE.BufferGeometry();
const starCount = 2000;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
}
starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ size: 0.06 }));
scene.add(stars);

// ---------- orb ----------
const orb = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0x061a10,
    emissive: 0x00ff88,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.15
  })
);
scene.add(orb);

// ---------- simple “3D text” without extra libs (as a placeholder)
// We'll swap this for Troika text next for crisp ticker rings.
const makeLabel = (text) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "64px Arial";
  ctx.fillStyle = "#A6FFB8";
  ctx.fillText(text, 40, 160);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.5, 1.1, 1);
  sprite.userData.canvas = canvas;
  sprite.userData.ctx = ctx;
  sprite.userData.tex = tex;
  return sprite;
};

const headline = makeLabel("LIVRA • SANKOFA MODE");
headline.position.set(0, 2.1, 0);
scene.add(headline);

const ticker = makeLabel("EMERALD NIGHT • GHANA • ANANSI • MR A THE MARTIAN •");
ticker.position.set(0, -2.2, 0);
scene.add(ticker);

function setLabel(sprite, text, color = "#A6FFB8") {
  const { canvas, ctx, tex } = sprite.userData;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "56px Arial";
  ctx.fillStyle = color;
  ctx.fillText(text, 40, 150);
  tex.needsUpdate = true;
}

// ---------- live updates (poll /text) ----------
async function poll() {
  try {
    const r = await fetch(API_HTTP);
    const j = await r.json();
    const msg = j?.data;
    if (!msg) return;

    if (msg.headline) setLabel(headline, msg.headline);
    if (msg.ticker) setLabel(ticker, msg.ticker, "#2DEB76");
  } catch {}
}
setInterval(poll, 350);

// ---------- animate ----------
function animate() {
  requestAnimationFrame(animate);

  orb.rotation.y += 0.01;
  orb.rotation.x += 0.004;
  stars.rotation.y += 0.0006;

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});