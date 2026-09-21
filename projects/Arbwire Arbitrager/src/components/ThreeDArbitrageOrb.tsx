import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Layers,
  Zap,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Compass,
} from 'lucide-react';
import type { ArbitrageScanResult } from '../analytics/ArbitrageEngine';
import type { ExchangeId } from '../engine/types';

interface ThreeDArbitrageOrbProps {
  scanResult: ArbitrageScanResult;
}

export type OrbSkinId = 'quantum' | 'cyber' | 'solar' | 'abyss';

interface SkinConfig {
  id: OrbSkinId;
  name: string;
  badge: string;
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  coreColor: number;
  laserColor: number;
  particleColor: number;
  primaryHex: string;
  secondaryHex: string;
  cssGradient: string;
}

const SKINS: Record<OrbSkinId, SkinConfig> = {
  quantum: {
    id: 'quantum',
    name: 'Quantum Emerald',
    badge: 'QUANTUM',
    primaryColor: 0x10b981,
    secondaryColor: 0x06b6d4,
    accentColor: 0x3b82f6,
    coreColor: 0x059669,
    laserColor: 0x10b981,
    particleColor: 0x34d399,
    primaryHex: '#10b981',
    secondaryHex: '#06b6d4',
    cssGradient: 'from-emerald-500 to-teal-400',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    badge: 'CYBERPUNK',
    primaryColor: 0xec4899,
    secondaryColor: 0x8b5cf6,
    accentColor: 0x06b6d4,
    coreColor: 0xdb2777,
    laserColor: 0xf43f5e,
    particleColor: 0xf472b6,
    primaryHex: '#ec4899',
    secondaryHex: '#8b5cf6',
    cssGradient: 'from-pink-500 to-purple-500',
  },
  solar: {
    id: 'solar',
    name: 'Solar Plasma',
    badge: 'SOLAR',
    primaryColor: 0xf59e0b,
    secondaryColor: 0xf97316,
    accentColor: 0xef4444,
    coreColor: 0xd97706,
    laserColor: 0xfbbf24,
    particleColor: 0xfcd34d,
    primaryHex: '#f59e0b',
    secondaryHex: '#f97316',
    cssGradient: 'from-amber-400 to-orange-500',
  },
  abyss: {
    id: 'abyss',
    name: 'Deep Space Matrix',
    badge: 'DEEP SPACE',
    primaryColor: 0x3b82f6,
    secondaryColor: 0x6366f1,
    accentColor: 0xa855f7,
    coreColor: 0x2563eb,
    laserColor: 0x60a5fa,
    particleColor: 0x93c5fd,
    primaryHex: '#3b82f6',
    secondaryHex: '#6366f1',
    cssGradient: 'from-blue-500 to-indigo-500',
  },
};

// High-definition procedural canvas textures
function createCircuitGlobeTexture(primaryHex: string, secondaryHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.5, '#040d1a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle coordinate grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  for (let y = 0; y <= 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  for (let x = 0; x <= 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Glowing Equator & Prime Meridian
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = primaryHex;
  ctx.shadowColor = primaryHex;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(1024, 256);
  ctx.stroke();

  ctx.strokeStyle = secondaryHex;
  ctx.shadowColor = secondaryHex;
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 512);
  ctx.stroke();

  // Cybernetic node points & pathways
  ctx.shadowBlur = 12;
  for (let i = 0; i < 36; i++) {
    const nx = (i * 79) % 1024;
    const ny = (i * 103) % 512;
    const isPrimary = i % 2 === 0;
    ctx.fillStyle = isPrimary ? primaryHex : secondaryHex;
    ctx.shadowColor = isPrimary ? primaryHex : secondaryHex;

    ctx.beginPath();
    ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isPrimary ? primaryHex : secondaryHex;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(nx, ny);
    ctx.lineTo(nx + ((i % 3) - 1) * 35, ny);
    ctx.lineTo(nx + ((i % 3) - 1) * 35, ny + ((i % 2) ? 25 : -25));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRadarGridTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 256;
  const cy = 256;
  ctx.clearRect(0, 0, 512, 512);

  ctx.strokeStyle = colorHex;
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.5;

  [45, 90, 140, 190, 240].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, cy);
  ctx.lineTo(496, cy);
  ctx.moveTo(cx, 16);
  ctx.lineTo(cx, 496);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

export const ThreeDArbitrageOrb: React.FC<ThreeDArbitrageOrbProps> = ({ scanResult }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeSkin, setActiveSkin] = useState<OrbSkinId>('quantum');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [targetDistance, setTargetDistance] = useState<number>(7.2);

  const bestOpp = scanResult.bestOpportunity;
  const oppRef = useRef(bestOpp);
  oppRef.current = bestOpp;

  const activeSkinRef = useRef(activeSkin);
  activeSkinRef.current = activeSkin;

  const wireframeModeRef = useRef(wireframeMode);
  wireframeModeRef.current = wireframeMode;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const targetDistanceRef = useRef(targetDistance);
  targetDistanceRef.current = targetDistance;

  const topBooks = scanResult.topOfBook;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || (isExpanded ? 460 : 280);

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, targetDistanceRef.current);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(SKINS[activeSkinRef.current].primaryColor, 4.0, 25);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(SKINS[activeSkinRef.current].secondaryColor, 3.5, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Radar Grid Floor Base Plate
    const radarTex = createRadarGridTexture('#10b981');
    const radarGeo = new THREE.PlaneGeometry(8, 8);
    const radarMat = new THREE.MeshBasicMaterial({
      map: radarTex,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const radarMesh = new THREE.Mesh(radarGeo, radarMat);
    radarMesh.rotation.x = -Math.PI / 2;
    radarMesh.position.y = -2.6;
    rootGroup.add(radarMesh);

    // 2. Multi-Axis Gimbal Gyroscope Rings
    const ringGeoA = new THREE.TorusGeometry(2.6, 0.028, 16, 80);
    const ringMatA = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
    });
    const gimbalRingA = new THREE.Mesh(ringGeoA, ringMatA);
    rootGroup.add(gimbalRingA);

    const ringGeoB = new THREE.TorusGeometry(2.4, 0.024, 16, 80);
    const ringMatB = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
    });
    const gimbalRingB = new THREE.Mesh(ringGeoB, ringMatB);
    gimbalRingB.rotation.x = Math.PI / 2;
    rootGroup.add(gimbalRingB);

    const ringGeoC = new THREE.TorusGeometry(2.2, 0.02, 16, 80);
    const ringMatC = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.5,
    });
    const gimbalRingC = new THREE.Mesh(ringGeoC, ringMatC);
    gimbalRingC.rotation.y = Math.PI / 3;
    rootGroup.add(gimbalRingC);

    // 3. High-Tech Textured Celestial Globe
    const globeTex = createCircuitGlobeTexture('#34d399', '#38bdf8');
    const globeGeo = new THREE.SphereGeometry(1.55, 40, 40);
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.88,
      emissive: 0x032b20,
      emissiveIntensity: 0.4,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    rootGroup.add(globeMesh);

    // Outer Holographic Atmosphere Shield
    const atmoGeo = new THREE.SphereGeometry(1.68, 28, 28);
    const atmoMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    rootGroup.add(atmoMesh);

    // 4. Central Quantum Core (Faceted Crystal)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    const prismGeo = new THREE.OctahedronGeometry(0.45, 0);
    const prismMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      wireframe: true,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    coreMesh.add(prismMesh);

    // 5. Orbiting Exchange Satellites
    interface VenueSatellite {
      mesh: THREE.Mesh;
      ring: THREE.Mesh;
      halo: THREE.Mesh;
      baseAngle: number;
      radius: number;
      color: number;
    }

    const exchangeNodes: Record<ExchangeId, VenueSatellite> = {
      binance: {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 20, 20),
          new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0xd97706,
            emissiveIntensity: 0.6,
          })
        ),
        ring: new THREE.Mesh(
          new THREE.TorusGeometry(0.46, 0.016, 16, 32),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 })
        ),
        halo: new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25, wireframe: true })
        ),
        baseAngle: 0,
        radius: 3.3,
        color: 0xf59e0b,
      },
      coinbase: {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 20, 20),
          new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.6,
          })
        ),
        ring: new THREE.Mesh(
          new THREE.TorusGeometry(0.46, 0.016, 16, 32),
          new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8 })
        ),
        halo: new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25, wireframe: true })
        ),
        baseAngle: (Math.PI * 2) / 3,
        radius: 3.3,
        color: 0x2563eb,
      },
      kraken: {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 20, 20),
          new THREE.MeshStandardMaterial({
            color: 0x9333ea,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x7e22ce,
            emissiveIntensity: 0.6,
          })
        ),
        ring: new THREE.Mesh(
          new THREE.TorusGeometry(0.46, 0.016, 16, 32),
          new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.8 })
        ),
        halo: new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.25, wireframe: true })
        ),
        baseAngle: (Math.PI * 4) / 3,
        radius: 3.3,
        color: 0x9333ea,
      },
    };

    const satGroup = new THREE.Group();
    rootGroup.add(satGroup);

    Object.values(exchangeNodes).forEach((node) => {
      node.mesh.add(node.ring);
      node.mesh.add(node.halo);
      satGroup.add(node.mesh);
    });

    // 6. Orbital Stardust Nebula (140 particles)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi);
      particlePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleTex = createParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      map: particleTex,
      color: SKINS[activeSkinRef.current].particleColor,
      size: 0.11,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    // 7. Dynamic Arbitrage Laser Vector & Energy Flow Pulses
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const laserGeo = new THREE.BufferGeometry();
    laserGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const laserLine = new THREE.Line(laserGeo, laserMat);
    laserLine.visible = false;
    rootGroup.add(laserLine);

    const pulseCount = 3;
    const pulseGroup = new THREE.Group();
    const pulseGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.95,
    });
    const pulseMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < pulseCount; i++) {
      const p = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMeshes.push(p);
      pulseGroup.add(p);
    }
    pulseGroup.visible = false;
    rootGroup.add(pulseGroup);

    // Smooth Butter-Inertia Controller
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      targetRotY += dx * 0.006;
      targetRotX += dy * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.max(4.5, Math.min(11.0, targetDistanceRef.current + e.deltaY * 0.005));
      setTargetDistance(next);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for smooth mobile/trackpad gestures
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 60FPS Smooth Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const currentSkin = SKINS[activeSkinRef.current];

      // Smooth camera zoom damp
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetDistanceRef.current, 8, delta);

      // Smooth material color transitions
      rimLight.color.lerp(new THREE.Color(currentSkin.primaryColor), delta * 5);
      coreLight.color.lerp(new THREE.Color(currentSkin.secondaryColor), delta * 5);
      particleMat.color.lerp(new THREE.Color(currentSkin.particleColor), delta * 5);

      globeMat.wireframe = wireframeModeRef.current;
      coreMat.wireframe = wireframeModeRef.current;

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        targetRotY += 0.45 * delta;
      }

      // Butter-smooth damping of rotation
      rootGroup.rotation.y = THREE.MathUtils.damp(rootGroup.rotation.y, targetRotY, 9, delta);
      rootGroup.rotation.x = THREE.MathUtils.damp(rootGroup.rotation.x, targetRotX, 9, delta);

      // Gimbal Rings Smooth Rotations
      gimbalRingA.rotation.z += 0.3 * delta;
      gimbalRingB.rotation.y -= 0.4 * delta;
      gimbalRingC.rotation.x += 0.5 * delta;

      // Globe & Atmosphere
      globeMesh.rotation.y += 0.25 * delta;
      atmoMesh.rotation.y -= 0.2 * delta;
      radarMesh.rotation.z += 0.1 * delta;

      // Core Crystals
      coreMesh.rotation.y -= 0.8 * delta;
      coreMesh.rotation.x += 0.6 * delta;
      prismMesh.rotation.y += 1.2 * delta;

      // Core Pulsing
      const opp = oppRef.current;
      const basePulse = 1.0 + Math.sin(elapsed * 3) * 0.05;
      const spreadBoost = opp ? Math.min(0.3, Math.max(0, opp.netSpreadPct)) : 0;
      const targetScale = basePulse + spreadBoost;
      coreMesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);

      // Stardust slow swirl
      particleSystem.rotation.y += 0.06 * delta;

      // Satellites orbital positions
      const orbitSpeed = 0.5;
      const posMap: Record<ExchangeId, THREE.Vector3> = {
        binance: new THREE.Vector3(),
        coinbase: new THREE.Vector3(),
        kraken: new THREE.Vector3(),
      };

      (Object.keys(exchangeNodes) as ExchangeId[]).forEach((key) => {
        const node = exchangeNodes[key];
        const angle = node.baseAngle + elapsed * orbitSpeed;
        const x = Math.cos(angle) * node.radius;
        const z = Math.sin(angle) * node.radius;
        const y = Math.sin(elapsed * 1.5 + node.baseAngle) * 0.35;

        node.mesh.position.set(x, y, z);
        node.ring.rotation.x += 1.8 * delta;
        node.ring.rotation.y += 1.2 * delta;
        node.halo.rotation.z -= 1.0 * delta;
        posMap[key].set(x, y, z);
      });

      // Update Arbitrage Laser Vector Beam
      if (opp && posMap[opp.buyExchange] && posMap[opp.sellExchange]) {
        const p1 = posMap[opp.buyExchange];
        const p2 = posMap[opp.sellExchange];

        const posAttr = laserGeo.attributes.position as THREE.BufferAttribute;
        posAttr.setXYZ(0, p1.x, p1.y, p1.z);
        posAttr.setXYZ(1, p2.x, p2.y, p2.z);
        posAttr.needsUpdate = true;
        laserLine.visible = true;

        if (opp.netSpreadPct >= 0.15) {
          laserMat.color.setHex(0x10b981);
          pulseMat.color.setHex(0x34d399);
        } else if (opp.netSpreadPct > 0) {
          laserMat.color.setHex(0x06b6d4);
          pulseMat.color.setHex(0x67e8f9);
        } else {
          laserMat.color.setHex(0xf43f5e);
          pulseMat.color.setHex(0xfb7185);
        }

        pulseGroup.visible = true;
        pulseMeshes.forEach((mesh, idx) => {
          const t = (elapsed * 1.4 + idx / pulseCount) % 1.0;
          mesh.position.lerpVectors(p1, p2, t);
          mesh.scale.setScalar(0.7 + Math.sin(t * Math.PI) * 0.4);
        });
      } else {
        laserLine.visible = false;
        pulseGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [isExpanded]);

  const handleZoom = (delta: number) => {
    setTargetDistance((prev) => Math.max(4.5, Math.min(11.0, prev + delta)));
  };

  const handleResetCamera = () => {
    setTargetDistance(7.2);
  };

  return (
    <div className="glass-tile rounded-2xl p-3.5 sm:p-4.5 border border-white/10 relative overflow-hidden flex flex-col group transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/30 text-emerald-400 shadow-md shrink-0">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-tech font-bold text-xs sm:text-sm text-white tracking-wider">
                3D QUANTUM SPATIAL GYROSCOPE
              </h3>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-gradient-to-r ${SKINS[activeSkin].cssGradient} text-black uppercase shadow-sm`}>
                {SKINS[activeSkin].badge}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              Interactive 3-Axis WebGL Engine &bull; Touch / Drag to rotate &bull; Pinch to zoom
            </p>
          </div>
        </div>

        {/* 3D Visual Controls & Skin Switcher */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/60 border border-white/15 touch-scroll-x no-scrollbar">
            {(Object.keys(SKINS) as OrbSkinId[]).map((skinKey) => {
              const s = SKINS[skinKey];
              const isSelected = activeSkin === skinKey;
              return (
                <button
                  key={skinKey}
                  onClick={() => setActiveSkin(skinKey)}
                  className={`px-1.5 sm:px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-black shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Apply ${s.name} visual theme skin`}
                >
                  {s.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-1.5 sm:px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer font-bold ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                : 'bg-black/60 border-white/15 text-slate-400 hover:text-white'
            }`}
            title="Toggle Holographic Wireframe Shader"
          >
            <Layers className="w-3 h-3" />
            <span>{wireframeMode ? 'WIRED' : 'SKIN'}</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-1.5 sm:px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer font-bold ${
              autoRotate
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                : 'bg-black/60 border-white/15 text-slate-400 hover:text-white'
            }`}
            title="Toggle Continuous Gyroscope Orbit"
          >
            <RotateCw className="w-3 h-3" />
            <span>{autoRotate ? 'ORBIT' : 'LOCK'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 sm:p-1.5 rounded-lg bg-black/60 border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            title={isExpanded ? 'Collapse View' : 'Expand View'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className={`relative w-full ${
          isExpanded ? 'h-80 sm:h-96' : 'h-56 sm:h-64'
        } flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-gradient-to-b from-[#040814] via-[#02050c] to-[#010206] rounded-xl border border-white/[0.08] overflow-hidden shadow-inner transition-all duration-300`}
      >
        {/* Top-Left Telemetry & HUD */}
        <div className="absolute top-2 left-2.5 sm:top-2.5 sm:left-3 flex flex-col gap-1 pointer-events-none z-10 text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 border border-white/15 text-slate-200 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">WEBGL 3D</span>
          </div>

          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-slate-400">
            <span>ZOOM: {(10 - targetDistance).toFixed(1)}x</span>
            <span>&bull;</span>
            <span>3 VENUES</span>
          </div>
        </div>

        {/* Top-Right Venue Live Price Pills */}
        <div className="absolute top-2.5 right-3 hidden md:flex items-center gap-1.5 pointer-events-none z-10 text-[10px] font-mono">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 border border-amber-500/40 text-amber-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>BN: ${topBooks.binance ? topBooks.binance.ask.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '---'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 border border-blue-500/40 text-blue-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>CB: ${topBooks.coinbase ? topBooks.coinbase.ask.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '---'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 border border-purple-500/40 text-purple-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>KR: ${topBooks.kraken ? topBooks.kraken.ask.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '---'}</span>
          </div>
        </div>

        {/* Bottom-Right Zoom & Reset Floating Overlay */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1 z-10">
          <button
            onClick={() => handleZoom(-1.0)}
            className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.0)}
            className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Arbitrage Laser Vector HUD Banner */}
        {bestOpp && (
          <div className="absolute bottom-2 left-2 max-w-[calc(100%-115px)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/90 border border-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-mono pointer-events-none z-10 shadow-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="text-slate-300 truncate">
                <strong className="text-cyan-300 capitalize">{bestOpp.buyExchange}</strong> &rarr; <strong className="text-emerald-300 capitalize">{bestOpp.sellExchange}</strong>
              </span>
            </div>
            <span
              className={`font-bold font-mono-nums shrink-0 ${
                bestOpp.netSpreadPct >= 0.15 ? 'text-emerald-400' : 'text-cyan-300'
              }`}
            >
              +{bestOpp.netSpreadPct.toFixed(3)}% (+${bestOpp.netProfitUSD.toFixed(2)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
