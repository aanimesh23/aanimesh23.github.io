import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
const isLowPower = navigator.hardwareConcurrency <= 4;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PARTICLE_COUNT = isMobile ? 600 : (isLowPower ? 1500 : 3000);
const CONNECTION_DISTANCE = isMobile ? 0 : 3.2;
const MAX_CONNECTIONS = isMobile ? 0 : 900;
const MOUSE_REPEL_RADIUS = 5;
const MOUSE_REPEL_STRENGTH = 1.0;
const EXPLOSION_VELOCITY = 8;
const EXPLOSION_COOLDOWN = 1000;

let scene, camera, renderer, composer;
let particleSystem, connectionLines;
let positions, velocities, homePositions, colors;
let mouse = new THREE.Vector2(9999, 9999);
let mouseWorld = new THREE.Vector3(9999, 9999, 0);
let raycaster = new THREE.Raycaster();
let clock = new THREE.Clock();
let isExploding = false;
let lastExplosionTime = 0;
let scrollProgress = 0;
let animationFrameId;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('three-canvas'),
        antialias: !isMobile,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

    if (!isMobile && !prefersReduced) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6, 1.0, 0.4
        );
        composer.addPass(bloomPass);
    }

    createParticles();
    if (!isMobile) createConnections();

    if (!isMobile) {
        window.addEventListener('mousemove', onMouseMove);
    }
    window.addEventListener('click', onExplosionClick);
    window.addEventListener('resize', onResize);

    if (!prefersReduced) {
        animate();
    } else {
        render();
    }
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    homePositions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);
    colors = new Float32Array(PARTICLE_COUNT * 3);

    const colorA = new THREE.Color('#00d4ff');
    const colorB = new THREE.Color('#7b2ff7');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 18 * Math.cbrt(Math.random());

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        homePositions[i3] = positions[i3];
        homePositions[i3 + 1] = positions[i3 + 1];
        homePositions[i3 + 2] = positions[i3 + 2];

        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        const t = Math.random();
        const color = colorA.clone().lerp(colorB, t);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.12 : 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function createConnections() {
    const geometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6);

    geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
    });

    connectionLines = new THREE.LineSegments(geometry, material);
    scene.add(connectionLines);
}

function updateConnections() {
    if (!connectionLines || isMobile) return;

    const linePositions = connectionLines.geometry.attributes.position.array;
    const lineColors = connectionLines.geometry.attributes.color.array;
    let connectionCount = 0;

    const step = PARTICLE_COUNT > 1500 ? 3 : 2;

    for (let i = 0; i < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS; i += step) {
        const i3 = i * 3;
        for (let j = i + step; j < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS; j += step) {
            const j3 = j * 3;
            const dx = positions[i3] - positions[j3];
            const dy = positions[i3 + 1] - positions[j3 + 1];
            const dz = positions[i3 + 2] - positions[j3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < CONNECTION_DISTANCE) {
                const c6 = connectionCount * 6;
                linePositions[c6] = positions[i3];
                linePositions[c6 + 1] = positions[i3 + 1];
                linePositions[c6 + 2] = positions[i3 + 2];
                linePositions[c6 + 3] = positions[j3];
                linePositions[c6 + 4] = positions[j3 + 1];
                linePositions[c6 + 5] = positions[j3 + 2];

                const alpha = 1 - dist / CONNECTION_DISTANCE;
                lineColors[c6] = 0 * alpha;
                lineColors[c6 + 1] = 0.83 * alpha;
                lineColors[c6 + 2] = 1 * alpha;
                lineColors[c6 + 3] = 0.48 * alpha;
                lineColors[c6 + 4] = 0.18 * alpha;
                lineColors[c6 + 5] = 0.97 * alpha;

                connectionCount++;
            }
        }
    }

    connectionLines.geometry.setDrawRange(0, connectionCount * 2);
    connectionLines.geometry.attributes.position.needsUpdate = true;
    connectionLines.geometry.attributes.color.needsUpdate = true;
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(plane, mouseWorld);
}

function onExplosionClick(event) {
    const now = Date.now();
    if (now - lastExplosionTime < EXPLOSION_COOLDOWN) return;
    lastExplosionTime = now;
    isExploding = true;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = positions[i3] - (mouseWorld.x || 0);
        const dy = positions[i3 + 1] - (mouseWorld.y || 0);
        const dz = positions[i3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
        const force = EXPLOSION_VELOCITY / dist;

        velocities[i3] = (dx / dist) * force * (0.5 + Math.random());
        velocities[i3 + 1] = (dy / dist) * force * (0.5 + Math.random());
        velocities[i3 + 2] = (dz / dist) * force * (0.3 + Math.random() * 0.5);
    }

    setTimeout(() => { isExploding = false; }, 200);
}

function updateParticles(time) {
    const damping = 0.96;
    const springStrength = 0.02;
    const noiseStrength = 0.002;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        if (!isExploding) {
            const dx = mouseWorld.x - positions[i3];
            const dy = mouseWorld.y - positions[i3 + 1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
                const force = (1 - dist / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_STRENGTH;
                velocities[i3] -= (dx / dist) * force;
                velocities[i3 + 1] -= (dy / dist) * force;
            }
        }

        const homeX = homePositions[i3];
        const homeY = homePositions[i3 + 1];
        const homeZ = homePositions[i3 + 2];

        velocities[i3] += (homeX - positions[i3]) * springStrength;
        velocities[i3 + 1] += (homeY - positions[i3 + 1]) * springStrength;
        velocities[i3 + 2] += (homeZ - positions[i3 + 2]) * springStrength;

        const noiseX = Math.sin(time * 0.5 + i * 0.1) * noiseStrength;
        const noiseY = Math.cos(time * 0.3 + i * 0.15) * noiseStrength;
        velocities[i3] += noiseX;
        velocities[i3 + 1] += noiseY;

        velocities[i3] *= damping;
        velocities[i3 + 1] *= damping;
        velocities[i3 + 2] *= damping;

        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
}

function animate() {
    if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }

    const time = clock.getElapsedTime();

    particleSystem.rotation.y += 0.0003;

    updateParticles(time);
    if (!isMobile) updateConnections();

    const targetZ = 25 + scrollProgress * 20;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.y += (scrollProgress * -2 - camera.position.y) * 0.03;

    render();
    animationFrameId = requestAnimationFrame(animate);
}

function render() {
    if (composer && !isMobile) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !prefersReduced) {
        clock.start();
    }
});

window.updateSceneProgress = function(progress) {
    scrollProgress = progress;
};

init();
