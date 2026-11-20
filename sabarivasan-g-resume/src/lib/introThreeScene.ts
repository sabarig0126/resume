import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export interface IntroSceneOptions {
  container: HTMLDivElement;
  durationMs: number;
  initialElapsedMs?: number;
  onProgress?: (progress: number) => void;
}

const _camTarget = new THREE.Vector3(0, 0, 0);
const _camPos = new THREE.Vector3(0, 0, 7.5);
const _lookTarget = new THREE.Vector3(0, 0, 0);

function getAspectScale(aspect: number): number {
  const safeAspect = Math.max(aspect, 0.42);
  return Math.max(1, 0.82 / safeAspect);
}

interface DeviceProfile {
  isTouchDevice: boolean;
  isLowPowerDevice: boolean;
}

function getDeviceProfile(): DeviceProfile {
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isTouchDevice =
    isCoarsePointer || isMobileUA || (navigator.maxTouchPoints ?? 0) > 1;
  const cores = navigator.hardwareConcurrency ?? 4;
  const deviceMemory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const minViewportDim = Math.min(window.innerWidth, window.innerHeight);

  const isLowPowerDevice =
    cores <= 4 ||
    deviceMemory <= 3 ||
    (isTouchDevice && minViewportDim < 768 && cores <= 6);

  return { isTouchDevice, isLowPowerDevice };
}

function detectSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function mountIntroThreeScene({
  container,
  durationMs,
  initialElapsedMs = 0,
  onProgress,
}: IntroSceneOptions): () => void {
  const safeDurationMs = Math.max(durationMs, 1);
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const { isTouchDevice, isLowPowerDevice } = getDeviceProfile();

  const width = Math.max(container.clientWidth || window.innerWidth, 1);
  const height = Math.max(container.clientHeight || window.innerHeight, 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isTouchDevice && !isLowPowerDevice,
    powerPreference: isLowPowerDevice ? 'low-power' : 'high-performance',
    alpha: false,
  });

  const glContext = renderer.getContext();
  const isSoftwareGl = detectSoftwareRenderer(glContext);
  const useLowTier = isSoftwareGl || isLowPowerDevice;

  const computePixelRatio = () => {
    const dpr = window.devicePixelRatio || 1;
    if (useLowTier) return 1;
    if (isTouchDevice) return Math.min(dpr, 1.5);
    return Math.min(dpr, 2);
  };

  let currentPixelRatio = computePixelRatio();

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = useLowTier ? 1.22 : 1.15;
  renderer.setPixelRatio(currentPixelRatio);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x030714, 1);

  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030714);
  scene.fog = new THREE.FogExp2(0x030714, 0.042);

  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 80);
  const initialAspectScale = getAspectScale(camera.aspect);
  camera.position.set(1.5, 0.85, 9.0 * initialAspectScale);
  camera.lookAt(0, 0, 0);

  // Procedural Studio Environment Reflections for Metallic Elements
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  roomEnv.dispose();
  pmremGenerator.dispose();
  scene.environment = envRenderTarget.texture;

  // Realistic 3-Point + Core Lighting Rig
  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050a18, 0.85);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xe0f2fe, 2.4);
  keyLight.position.set(4.5, 5.5, 5.0);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x2563eb, 3.0);
  rimLight.position.set(-5.0, -2.5, -4.5);
  scene.add(rimLight);

  const baseAccentIntensity = useLowTier ? 3.1 : 2.6;
  const cyanAccentLight = new THREE.PointLight(
    0x22d3ee,
    baseAccentIntensity,
    16,
    1.5
  );
  cyanAccentLight.position.set(0, 0, 0);
  scene.add(cyanAccentLight);

  const warmRimLight = new THREE.DirectionalLight(0xf59e0b, 0.9);
  warmRimLight.position.set(3.5, -3.0, -3.5);
  scene.add(warmRimLight);

  // Track resources for clean disposal
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Shared Metallic & Physical Materials
  const brushedPlatinumMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    metalness: 0.96,
    roughness: 0.14,
    anisotropy: useLowTier ? 0 : 0.85,
    anisotropyRotation: Math.PI / 4,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.5,
  });
  materials.push(brushedPlatinumMat);

  const darkGunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.88,
    roughness: 0.4,
    envMapIntensity: 1.15,
  });
  materials.push(darkGunmetalMat);

  const anodizedCobaltMat = new THREE.MeshPhysicalMaterial({
    color: 0x1d4ed8,
    metalness: 0.92,
    roughness: 0.22,
    iridescence: useLowTier ? 0 : 0.55,
    iridescenceIOR: 1.4,
    clearcoat: 0.8,
    envMapIntensity: 1.35,
  });
  materials.push(anodizedCobaltMat);

  const plasmaCoreMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    emissive: 0x06b6d4,
    emissiveIntensity: useLowTier ? 2.5 : 2.2,
    metalness: 0.15,
    roughness: 0.08,
    iridescence: useLowTier ? 0 : 1.0,
    clearcoat: 1.0,
  });
  materials.push(plasmaCoreMat);

  const wireframeCageMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.push(wireframeCageMat);

  // Composite Gyroscopic Metallic Assembly
  const assemblyGroup = new THREE.Group();
  assemblyGroup.scale.setScalar(0.56);
  scene.add(assemblyGroup);

  // 1. Inner Plasma Core + Transforming Geodesic Cage
  const coreGeo = new THREE.IcosahedronGeometry(0.42, 1);
  geometries.push(coreGeo);
  const coreMesh = new THREE.Mesh(coreGeo, plasmaCoreMat);
  assemblyGroup.add(coreMesh);

  const cageGeo = new THREE.IcosahedronGeometry(0.92, 1);
  geometries.push(cageGeo);
  const cageMesh = new THREE.Mesh(cageGeo, wireframeCageMat);
  assemblyGroup.add(cageMesh);

  // 2. Smooth Transforming Radial Metallic Fins (8 Beveled Extruded Blades)
  const finShape = new THREE.Shape();
  finShape.moveTo(-0.08, 0);
  finShape.lineTo(0.08, 0);
  finShape.lineTo(0.14, 0.34);
  finShape.lineTo(0, 0.48);
  finShape.lineTo(-0.14, 0.34);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    steps: 1,
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: useLowTier ? 1 : 2,
  });
  finGeo.center();
  geometries.push(finGeo);

  const bladePivots: THREE.Group[] = [];
  const bladeMeshes: THREE.Mesh[] = [];
  const BLADE_COUNT = 8;
  for (let i = 0; i < BLADE_COUNT; i++) {
    const pivot = new THREE.Group();
    const angle = (i / BLADE_COUNT) * Math.PI * 2;
    pivot.rotation.z = angle;

    const blade = new THREE.Mesh(
      finGeo,
      i % 2 === 0 ? brushedPlatinumMat : anodizedCobaltMat
    );
    blade.position.y = 0.65;
    pivot.add(blade);
    assemblyGroup.add(pivot);
    bladePivots.push(pivot);
    bladeMeshes.push(blade);
  }

  // 3. Concentric Counter-Rotating Metallic Gimbal Rings + Instanced Collar Bolts
  const ring1Group = new THREE.Group();
  const ring2Group = new THREE.Group();
  const ring3Group = new THREE.Group();
  assemblyGroup.add(ring1Group, ring2Group, ring3Group);

  const radialSegs = useLowTier ? 12 : 20;
  const tubularSegs = useLowTier ? 64 : 96;
  const ring1Geo = new THREE.TorusGeometry(1.58, 0.055, radialSegs, tubularSegs);
  const ring2Geo = new THREE.TorusGeometry(
    1.96,
    0.042,
    Math.max(10, radialSegs - 2),
    tubularSegs
  );
  const ring3Geo = new THREE.TorusGeometry(
    2.38,
    0.032,
    Math.max(10, radialSegs - 4),
    useLowTier ? 72 : 110
  );
  geometries.push(ring1Geo, ring2Geo, ring3Geo);

  const ring1Mesh = new THREE.Mesh(ring1Geo, brushedPlatinumMat);
  const ring2Mesh = new THREE.Mesh(ring2Geo, darkGunmetalMat);
  const ring3Mesh = new THREE.Mesh(ring3Geo, anodizedCobaltMat);
  ring1Group.add(ring1Mesh);
  ring2Group.add(ring2Mesh);
  ring3Group.add(ring3Mesh);

  // Instanced metallic collar nodes mounted onto Ring 1
  const nodeGeo = new THREE.BoxGeometry(0.11, 0.16, 0.14);
  geometries.push(nodeGeo);
  const nodeInstances = new THREE.InstancedMesh(nodeGeo, darkGunmetalMat, 12);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.58, Math.sin(a) * 1.58, 0);
    dummy.rotation.set(0, 0, a);
    dummy.updateMatrix();
    nodeInstances.setMatrixAt(i, dummy.matrix);
  }
  nodeInstances.instanceMatrix.needsUpdate = true;
  nodeInstances.computeBoundingSphere();
  ring1Group.add(nodeInstances);

  // 4. Holographic Calibration Shader Rings
  const holoShaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColorA: { value: new THREE.Color(0x0ea5e9) },
      uColorB: { value: new THREE.Color(0x22d3ee) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      void main() {
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
        float scan = sin(vUv.y * 90.0 - uTime * 8.0) * 0.5 + 0.5;
        float arcMask = step(0.18, fract(vUv.x * 6.0 + uTime * 0.25));
        float sweep = smoothstep(0.0, 0.35, sin(vUv.x * 6.2831 - uTime * 3.0) * 0.5 + 0.5);
        vec3 col = mix(uColorA, uColorB, sweep);
        float alpha = (0.2 + fresnel * 0.65) * (0.45 + 0.55 * scan) * arcMask * uIntensity;
        gl_FragColor = vec4(col * 1.45, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.push(holoShaderMat);

  const holoCylGeo = new THREE.CylinderGeometry(
    2.75,
    2.75,
    0.42,
    useLowTier ? 48 : 72,
    1,
    true
  );
  geometries.push(holoCylGeo);
  const holoShroud = new THREE.Mesh(holoCylGeo, holoShaderMat);
  holoShroud.rotation.x = Math.PI * 0.42;
  assemblyGroup.add(holoShroud);

  // 5. Glowing Blue & Cyan Light Trails (Animated Shader Tubes)
  const trailMaterials: THREE.ShaderMaterial[] = [];
  const trailConfigs = [
    { radius: 2.15, tiltX: 0.45, tiltY: 0.2, speed: 1.5, color: 0x22d3ee },
    { radius: 2.55, tiltX: -0.55, tiltY: 0.6, speed: -1.8, color: 0x3b82f6 },
    { radius: 2.9, tiltX: 0.22, tiltY: -0.7, speed: 1.25, color: 0x38bdf8 },
  ];

  const trailGroup = new THREE.Group();
  trailGroup.scale.setScalar(0.56);
  scene.add(trailGroup);

  const tubeSegments = useLowTier ? 72 : 128;
  trailConfigs.forEach((cfg, idx) => {
    const pts: THREE.Vector3[] = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const wobble = Math.sin(a * 3 + idx) * 0.22;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * (cfg.radius + wobble),
          Math.sin(a * 2 + idx) * 0.35,
          Math.sin(a) * (cfg.radius + wobble)
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.022, 8, true);
    geometries.push(tubeGeo);

    const trailMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: cfg.speed },
        uColor: { value: new THREE.Color(cfg.color) },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          float head = fract(vUv.x * 2.0 - uTime * uSpeed * 0.45);
          float comet = pow(head, 5.0);
          float baseGlow = 0.08;
          float alpha = (baseGlow + comet * 0.92) * uOpacity;
          gl_FragColor = vec4(uColor * (1.2 + comet * 1.8), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materials.push(trailMat);
    trailMaterials.push(trailMat);

    const tubeMesh = new THREE.Mesh(tubeGeo, trailMat);
    tubeMesh.rotation.set(cfg.tiltX, cfg.tiltY, 0);
    trailGroup.add(tubeMesh);
  });

  // 6. Futuristic Energy Pulse Shockwave (Equatorial Wave Ring)
  const pulseRingGeo = new THREE.RingGeometry(0.95, 1.18, useLowTier ? 48 : 72);
  geometries.push(pulseRingGeo);
  const pulseRingMat = new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: 0.0 },
      uColor: { value: new THREE.Color(0x22d3ee) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uAlpha;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float dist = abs(vUv.y - 0.5) * 2.0;
        float glow = pow(1.0 - clamp(dist, 0.0, 1.0), 1.6);
        gl_FragColor = vec4(uColor * 2.2, glow * uAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.push(pulseRingMat);
  const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
  pulseRingMesh.scale.setScalar(0.1);
  scene.add(pulseRingMesh);

  // 7. Floating Volumetric Particles (Adaptive Count for Mobile / Low-End GPUs)
  const PARTICLE_COUNT = useLowTier ? 220 : isTouchDevice ? 340 : 520;
  const pPositions = new Float32Array(PARTICLE_COUNT * 3);
  const pColors = new Float32Array(PARTICLE_COUNT * 3);
  const pScales = new Float32Array(PARTICLE_COUNT);
  const pPhases = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color(0x22d3ee),
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x93c5fd),
    new THREE.Color(0xe0f2fe),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 1.8 + Math.random() * 11.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 9.0;
    pPositions[i * 3 + 2] = r * Math.cos(phi) - 1.5;

    const c = palette[i % palette.length];
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;

    pScales[i] = 0.6 + Math.random() * 2.2;
    pPhases[i] = Math.random() * Math.PI * 2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  particleGeo.setAttribute('aColor', new THREE.BufferAttribute(pColors, 3));
  particleGeo.setAttribute('aScale', new THREE.BufferAttribute(pScales, 1));
  particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPhases, 1));
  geometries.push(particleGeo);

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: currentPixelRatio },
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aScale;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        vec3 pos = position;
        pos.y += sin(uTime * 0.9 + aPhase) * 0.25;
        pos.x += cos(uTime * 0.7 + aPhase) * 0.18;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float dist = max(-mvPosition.z, 1.0);
        gl_PointSize = aScale * 28.0 * uPixelRatio * (1.0 / dist);
        vAlpha = smoothstep(18.0, 4.0, dist) * (0.45 + 0.55 * sin(uTime * 2.4 + aPhase));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float soft = pow(1.0 - d * 2.0, 1.8);
        gl_FragColor = vec4(vColor * 1.4, soft * vAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.push(particleMat);

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Post-Processing:
  // - Desktop/Laptop GPU: Half/three-quarter Bloom + Bokeh + OutputPass
  // - Capable Tablets / High-end Phones: Half-res Bloom + OutputPass (no heavy Bokeh depth pass)
  // - Low-end Mobile / Software WebGL: Direct render pass for smooth FPS
  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  let bokehPass: BokehPass | null = null;
  const bloomResolutionScale = isTouchDevice ? 0.5 : 0.75;

  if (!useLowTier) {
    try {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(currentPixelRatio);
      composer.setSize(width, height);
      composer.addPass(new RenderPass(scene, camera));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          Math.max(1, Math.floor(width * bloomResolutionScale)),
          Math.max(1, Math.floor(height * bloomResolutionScale))
        ),
        0.85,
        0.55,
        0.42
      );
      composer.addPass(bloomPass);

      if (!isTouchDevice) {
        bokehPass = new BokehPass(scene, camera, {
          focus: 7.5,
          aperture: 0.00018,
          maxblur: 0.006,
        });
        composer.addPass(bokehPass);
      }

      composer.addPass(new OutputPass());
      renderer.compile(scene, camera);
    } catch {
      composer?.dispose();
      composer = null;
      bloomPass = null;
      bokehPass = null;
    }
  }

  let rafId = 0;
  let timerId = 0;
  let orientationTimer = 0;
  let disposed = false;
  let contextLost = false;
  let isFirstFrame = true;

  const startTime = performance.now() - Math.max(0, initialElapsedMs);
  let lastTime = performance.now();

  const cancelScheduled = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = 0;
    }
  };

  const afterDraw = (cb: () => void) => {
    const gl = renderer.getContext();
    if (gl.isContextLost()) return;

    if (!('fenceSync' in gl) || typeof gl.fenceSync !== 'function') {
      timerId = window.setTimeout(cb, 50);
      return;
    }

    const gl2 = gl as WebGL2RenderingContext;
    const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      timerId = window.setTimeout(cb, 50);
      return;
    }
    gl2.flush();

    let pollCount = 0;
    const poll = () => {
      if (disposed || contextLost || document.hidden) {
        gl2.deleteSync(sync);
        return;
      }
      pollCount += 1;
      const state = gl2.getSyncParameter(sync, gl2.SYNC_STATUS);
      if (state === gl2.UNSIGNALED && pollCount < 25) {
        timerId = window.setTimeout(poll, 5);
      } else {
        gl2.deleteSync(sync);
        timerId = window.setTimeout(cb, 65);
      }
    };
    timerId = window.setTimeout(poll, 5);
  };

  const renderAtState = (elapsedMs: number, dt: number, snapImmediate: boolean) => {
    const tSec = elapsedMs / 1000;
    const progress = THREE.MathUtils.clamp(elapsedMs / safeDurationMs, 0, 1);
    onProgress?.(progress);

    const aspectScale = getAspectScale(camera.aspect);

    if (prefersReducedMotion) {
      _camPos.set(0, 0.1, 7.6 * aspectScale);
      _lookTarget.set(0, 0, 0);
      camera.position.copy(_camPos);
      _camTarget.copy(_lookTarget);
      camera.lookAt(_camTarget);
    } else {
      if (progress < 0.78) {
        const orbitPhase = progress / 0.78;
        const easeOrbit = 1 - Math.pow(1 - orbitPhase, 3);
        _camPos.set(
          Math.sin(tSec * 0.6) * (1.45 * (1 - easeOrbit * 0.7)),
          0.85 * (1 - easeOrbit) + Math.cos(tSec * 0.5) * 0.14,
          THREE.MathUtils.lerp(9.0 * aspectScale, 7.2 * aspectScale, easeOrbit)
        );
        _lookTarget.set(0, 0, 0);
      } else {
        // Forward glide through the metallic rings into Overview
        const exitPhase = (progress - 0.78) / 0.22;
        const easeExit = exitPhase * exitPhase * exitPhase;
        _camPos.set(
          Math.sin(tSec * 0.6) * 0.3 * (1 - easeExit),
          0.1 * (1 - easeExit),
          THREE.MathUtils.lerp(7.2 * aspectScale, 1.6, easeExit)
        );
        _lookTarget.set(0, 0, -2.2 * easeExit);
      }

      if (snapImmediate) {
        camera.position.copy(_camPos);
        _camTarget.copy(_lookTarget);
      } else {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          _camPos.x,
          5.5,
          dt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          _camPos.y,
          5.5,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          _camPos.z,
          5.5,
          dt
        );
        _camTarget.lerp(_lookTarget, 1 - Math.exp(-5.5 * dt));
      }
      camera.lookAt(_camTarget);
    }

    if (bokehPass) {
      const uniforms = bokehPass.uniforms as Record<
        string,
        THREE.IUniform<number>
      >;
      if (uniforms.focus) {
        uniforms.focus.value = camera.position.distanceTo(_camTarget);
      }
    }

    // Radial Blades Unfold + Core Morph
    const unfold = prefersReducedMotion
      ? 1
      : THREE.MathUtils.smoothstep(progress, 0.06, 0.42);
    for (let i = 0; i < BLADE_COUNT; i++) {
      const blade = bladeMeshes[i];
      const targetY = 0.62 + unfold * 0.48;
      const targetRotX = unfold * 0.42;
      const targetRotY = unfold * 0.35 + tSec * 0.3;
      if (snapImmediate) {
        blade.position.y = targetY;
        blade.rotation.x = targetRotX;
        blade.rotation.y = targetRotY;
      } else {
        blade.position.y = THREE.MathUtils.damp(blade.position.y, targetY, 6, dt);
        blade.rotation.x = THREE.MathUtils.damp(
          blade.rotation.x,
          targetRotX,
          6,
          dt
        );
        blade.rotation.y = THREE.MathUtils.damp(
          blade.rotation.y,
          targetRotY,
          6,
          dt
        );
      }
    }

    const corePulse = prefersReducedMotion ? 1.03 : 1 + Math.sin(tSec * 3.4) * 0.07;
    coreMesh.scale.setScalar(corePulse);
    coreMesh.rotation.y = tSec * 1.1;
    coreMesh.rotation.x = tSec * 0.55;

    cageMesh.scale.setScalar(0.85 + unfold * 0.38);
    cageMesh.rotation.y = -tSec * 0.65;
    cageMesh.rotation.z = tSec * 0.4;

    // Counter-Rotating Metallic Gimbal Rings
    ring1Group.rotation.x = Math.sin(tSec * 0.9) * 0.45 + tSec * 0.55;
    ring1Group.rotation.y = tSec * 0.95;

    ring2Group.rotation.x = -tSec * 0.72 + 0.5;
    ring2Group.rotation.z = tSec * 0.45;

    ring3Group.rotation.y = -tSec * 0.52;
    ring3Group.rotation.z = Math.cos(tSec * 0.7) * 0.4;

    holoShroud.rotation.y = tSec * 0.6;
    holoShaderMat.uniforms.uTime.value = tSec;

    // Light Trails & Particles Uniform Updates
    for (const tm of trailMaterials) {
      tm.uniforms.uTime.value = tSec;
    }
    trailGroup.rotation.y = tSec * 0.25;
    particleMat.uniforms.uTime.value = tSec;
    particles.rotation.y = tSec * 0.04;

    // Energy Pulse Shockwave (fires around 52% -> 88% when animating)
    if (!prefersReducedMotion && progress > 0.52) {
      const waveT = THREE.MathUtils.clamp((progress - 0.52) / 0.36, 0, 1);
      const waveRadius = 0.15 + waveT * 6.5;
      pulseRingMesh.scale.setScalar(waveRadius);
      pulseRingMat.uniforms.uAlpha.value = Math.sin(waveT * Math.PI) * 0.95;
      cyanAccentLight.intensity =
        baseAccentIntensity + Math.sin(waveT * Math.PI) * 5.2;
      if (bloomPass) {
        bloomPass.strength = 0.85 + Math.sin(waveT * Math.PI) * 0.85;
      }
    } else {
      pulseRingMat.uniforms.uAlpha.value = 0;
      cyanAccentLight.intensity = baseAccentIntensity;
      if (bloomPass) {
        bloomPass.strength = 0.85;
      }
    }

    try {
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    } catch {
      // If postprocessing fails mid-session, drop composer and render directly
      if (composer) {
        composer.dispose();
        composer = null;
        bloomPass = null;
        bokehPass = null;
        renderer.render(scene, camera);
      }
    }
  };

  const scheduleNextFrame = () => {
    if (disposed || contextLost || document.hidden || prefersReducedMotion) {
      return;
    }
    cancelScheduled();
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }
  };

  const tick = () => {
    rafId = 0;
    timerId = 0;
    if (disposed || contextLost || document.hidden) return;

    const now = performance.now();
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
    lastTime = now;

    const elapsedMs = now - startTime;
    renderAtState(elapsedMs, dt, isFirstFrame);
    isFirstFrame = false;

    if (!prefersReducedMotion) {
      scheduleNextFrame();
    }
  };

  const handleResize = () => {
    if (disposed || contextLost) return;
    const w = Math.max(container.clientWidth || window.innerWidth, 1);
    const h = Math.max(container.clientHeight || window.innerHeight, 1);

    currentPixelRatio = computePixelRatio();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(currentPixelRatio);
    renderer.setSize(w, h, false);
    particleMat.uniforms.uPixelRatio.value = currentPixelRatio;

    if (composer) {
      composer.setPixelRatio(currentPixelRatio);
      composer.setSize(w, h);
      bloomPass?.resolution.set(
        Math.max(1, Math.floor(w * bloomResolutionScale)),
        Math.max(1, Math.floor(h * bloomResolutionScale))
      );
    }

    if (prefersReducedMotion) {
      renderAtState(safeDurationMs * 0.42, 0, true);
    }
  };

  const handleOrientationChange = () => {
    handleResize();
    window.clearTimeout(orientationTimer);
    orientationTimer = window.setTimeout(handleResize, 120);
  };

  const handleVisibilityChange = () => {
    if (disposed) return;
    if (document.hidden) {
      cancelScheduled();
    } else if (!prefersReducedMotion && !contextLost) {
      lastTime = performance.now();
      scheduleNextFrame();
    }
  };

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    contextLost = true;
    cancelScheduled();
  };

  const handleContextRestored = () => {
    contextLost = false;
    lastTime = performance.now();
    handleResize();
    if (prefersReducedMotion) {
      renderAtState(safeDurationMs * 0.42, 0, true);
    } else {
      scheduleNextFrame();
    }
  };

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
  renderer.domElement.addEventListener(
    'webglcontextrestored',
    handleContextRestored
  );

  // Initial render
  if (prefersReducedMotion) {
    renderAtState(safeDurationMs * 0.42, 0, true);
    onProgress?.(1);
  } else {
    tick();
  }

  return () => {
    disposed = true;
    cancelScheduled();
    window.clearTimeout(orientationTimer);

    resizeObserver?.disconnect();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.removeEventListener(
      'webglcontextrestored',
      handleContextRestored
    );

    nodeInstances.dispose?.();
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    envRenderTarget.dispose();
    composer?.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
