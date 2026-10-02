import * as THREE from "three";
import type { Fragrance } from "@/lib/catalog/types";
export function createBoutique(
  host: HTMLElement,
  items: Fragrance[],
  onSelect: (id: string) => void,
  reducedMotion: boolean,
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor("#1e2923");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#1e2923", 12, 35);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 70);
  camera.position.set(0, 2.4, 7.7);
  scene.add(new THREE.HemisphereLight("#fce9cf", "#283c30", 3));
  const sun = new THREE.DirectionalLight("#ffe5b8", 5);
  sun.position.set(-3, 6, 5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight("#aec9b6", 3);
  rim.position.set(6, 3, -2);
  scene.add(rim);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const pickables: THREE.Object3D[] = [];
  const sculptures: THREE.Group[] = [];
  const add = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) => {
    geometries.push(g);
    materials.push(m);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };
  add(
    new THREE.BoxGeometry(100, 0.12, 18),
    new THREE.MeshStandardMaterial({ color: "#29372e", roughness: 0.85 }),
    15,
    -0.15,
    0,
  );
  add(
    new THREE.BoxGeometry(100, 10, 0.2),
    new THREE.MeshStandardMaterial({ color: "#24392d", roughness: 1 }),
    15,
    3,
    -3.1,
  );
  for (let i = 0; i < items.length; i++) {
    const x = i * 2.6;
    const f = items[i];
    add(
      new THREE.BoxGeometry(1.75, 0.85, 1.6),
      new THREE.MeshStandardMaterial({ color: "#4c3e2e", roughness: 0.6 }),
      x,
      0.28,
      0,
    );
    add(
      new THREE.BoxGeometry(1.78, 0.055, 1.63),
      new THREE.MeshStandardMaterial({
        color: "#bead89",
        metalness: 0.45,
        roughness: 0.48,
      }),
      x,
      0.73,
      0,
    );
    const frame = add(
      new THREE.TorusGeometry(1.09, 0.026, 8, 80, Math.PI),
      new THREE.MeshStandardMaterial({
        color: "#a58a53",
        metalness: 0.65,
        roughness: 0.5,
      }),
      x,
      1.6,
      -1.25,
    );
    frame.rotation.z = 0;
    const sculpture = new THREE.Group();
    sculpture.position.set(x, 1.47, 0);
    scene.add(sculpture);
    sculptures.push(sculpture);
    const g = new THREE.IcosahedronGeometry(0.62, 2);
    geometries.push(g);
    const material = new THREE.MeshPhysicalMaterial({
      color: f.profile.color,
      metalness: 0.22,
      roughness: 0.21,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    materials.push(material);
    const crystal = new THREE.Mesh(g, material);
    crystal.scale.set(0.85, 1.12, 0.85);
    crystal.rotation.set(0.3, 0.3, 0.2);
    crystal.userData.id = f.id;
    sculpture.add(crystal);
    pickables.push(crystal);
    const ringGeo = new THREE.TorusGeometry(0.81, 0.025, 8, 80);
    geometries.push(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: "#d8b779",
      metalness: 0.8,
      roughness: 0.25,
    });
    materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.set(0.8, 0.35, 0.15);
    sculpture.add(ring);
    const smallGeo = new THREE.SphereGeometry(0.13, 20, 20);
    geometries.push(smallGeo);
    const small = new THREE.Mesh(smallGeo, material);
    small.position.set(0.7, -0.4, 0.12);
    sculpture.add(small);
  }
  let targetX = 0,
    frame = 0,
    disposed = false,
    visible = true;
  const look = new THREE.Vector3();
  const render = () => {
    if (disposed) return;
    if (visible) {
      camera.position.x = reducedMotion
        ? targetX
        : THREE.MathUtils.lerp(camera.position.x, targetX, 0.09);
      look.set(camera.position.x, 1.25, 0);
      camera.lookAt(look);
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, Math.max(height, 1));
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const ray = new THREE.Raycaster();
  const point = new THREE.Vector2();
  const pointer = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    point.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(point, camera);
    const hit = ray.intersectObjects(pickables)[0];
    if (hit) onSelect(hit.object.userData.id);
  };
  renderer.domElement.addEventListener("pointerup", pointer);
  const visibility = () => {
    visible = !document.hidden;
  };
  document.addEventListener("visibilitychange", visibility);
  render();
  return {
    focus: (id: string) => {
      const idx = items.findIndex((f) => f.id === id);
      targetX = Math.max(idx, 0) * 2.6;
      sculptures.forEach((s, i) => s.scale.setScalar(i === idx ? 1.08 : 0.85));
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("pointerup", pointer);
      geometries.forEach((g) => g.dispose());
      new Set(materials).forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
