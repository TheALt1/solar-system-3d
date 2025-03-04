import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { db, doc, setDoc, getDoc } from "./firebase.js";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCENE, CAMERA, & RENDERER
// ─────────────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    2000
);
camera.position.set(0, 50, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// ─────────────────────────────────────────────────────────────────────────────
// 2. LIGHTING
// ─────────────────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 5, 1000);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// ─────────────────────────────────────────────────────────────────────────────
// 3. STARRY BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOAD SUN MODEL & PLANETS
// ─────────────────────────────────────────────────────────────────────────────
const loader = new GLTFLoader();
const planets = [];
const planetData = [
    { name: "Sun", file: "assets/sun.glb", distance: 0, scale: 8 },
    { name: "Mercury", file: "assets/mercury.glb", distance: 10, scale: 1.2, speed: 0.04 },
    { name: "Venus", file: "assets/venus.glb", distance: 18, scale: 1.5, speed: 0.03 },
    { name: "Earth", file: "assets/earth.glb", distance: 26, scale: 2, speed: 0.02 },
    { name: "Mars", file: "assets/mars.glb", distance: 34, scale: 1.8, speed: 0.015 },
    { name: "Jupiter", file: "assets/jupiter.glb", distance: 50, scale: 3, speed: 0.01 },
    { name: "Saturn", file: "assets/saturn.glb", distance: 65, scale: 0.01, speed: 0.008 },
    { name: "Uranus", file: "assets/uranus.glb", distance: 80, scale: 2.5, speed: 0.007 },
    { name: "Neptune", file: "assets/neptune.glb", distance: 95, scale: 2.3, speed: 0.006 }
];

// Load each planet model with proper scaling & positioning
planetData.forEach((data, index) => {
    loader.load(data.file, gltf => {
        const planet = gltf.scene;
        planet.scale.set(data.scale, data.scale, data.scale);
        planet.position.set(data.distance, 0, 0);
        
        if (data.name === "Sun") {
            planet.position.set(-8, -8, -8); // Sun must always be centered
            sunLight.target = planet; // Ensure Sun emits light properly
        }

        scene.add(planet);
        if (data.name !== "Sun") {
            planets.push({ mesh: planet, ...data });
        }

        // Create Orbit Line (Skip for Sun)
        if (data.distance > 0) {
            const orbitGeometry = new THREE.RingGeometry(
                data.distance - 0.3, 
                data.distance + 0.3, 
                100
            );
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ANIMATION: MAKE PLANETS ORBIT
// ─────────────────────────────────────────────────────────────────────────────
function animatePlanets() {
    planets.forEach(planet => {
        const angle = Date.now() * planet.speed * 0.0005; // Slow rotation
        planet.mesh.position.x = planet.distance * Math.cos(angle);
        planet.mesh.position.z = planet.distance * Math.sin(angle);
    });
}

function animate() {
    requestAnimationFrame(animate);
    animatePlanets();
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ─────────────────────────────────────────────────────────────────────────────
// 6. SAVE & LOAD CONFIGURATION (FIREBASE)
// ─────────────────────────────────────────────────────────────────────────────
async function saveConfiguration() {
    await setDoc(doc(db, "solarSystem", "config"), { planets });
    alert("Configuration saved!");
}

async function loadConfiguration() {
    const docSnap = await getDoc(doc(db, "solarSystem", "config"));
    if (docSnap.exists()) {
        alert("Configuration loaded!");
    } else {
        alert("No saved configuration!");
    }
}

// Buttons to save & load
document.getElementById("saveBtn").addEventListener("click", saveConfiguration);
document.getElementById("loadBtn").addEventListener("click", loadConfiguration);

// ─────────────────────────────────────────────────────────────────────────────
// 7. HANDLE SCREEN RESIZE
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
