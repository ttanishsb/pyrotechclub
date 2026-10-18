'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, useGLTF } from '@react-three/drei';
import { Component, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ScrollMotion = { progress: number; velocity: number };

useGLTF.preload('/models/danda.glb');

function TeamModel({ motion }: { motion: React.MutableRefObject<ScrollMotion> }) {
  const { scene } = useGLTF('/models/danda.glb');
  const group = useRef<THREE.Group>(null);
  const baseRotation = useRef(new THREE.Euler());

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((material) => {
            const mat = material as THREE.MeshStandardMaterial;
            if ('roughness' in mat) mat.roughness = Math.min(mat.roughness ?? 0.7, 0.72);
            if ('metalness' in mat) mat.metalness = Math.max(mat.metalness ?? 0, 0.22);
          });
        }
      }
    });
    // Scale first, THEN centre: centring before scaling leaves the model far off-screen.
    scene.position.set(0, 0, 0);
    scene.scale.setScalar(1);
    scene.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z) || 1;
    scene.scale.setScalar(3.1 / largest);
    scene.updateMatrixWorld(true);
    const center = new THREE.Box3().setFromObject(scene).getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = THREE.MathUtils.clamp(motion.current.progress, 0, 1);
    const velocityKick = THREE.MathUtils.clamp(motion.current.velocity * 0.000035, -0.12, 0.12);
    const targetY = THREE.MathUtils.lerp(-0.08, 0.18, p) + Math.sin(p * Math.PI * 5) * 0.08;
    const targetX = THREE.MathUtils.lerp(0.12, -0.16, p) + velocityKick;
    // Slower damping = heavier, more deliberate motion. Pointer adds a small parallax tilt.
    const px = state.pointer.x * 0.16;
    const py = state.pointer.y * 0.1;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX - py, 1.7, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, baseRotation.current.y + p * Math.PI * 1.25 + velocityKick + px, 1.5, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, Math.sin(p * Math.PI * 2) * 0.08, 1.5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 1.5, delta);
    const scale = 1 + Math.sin(p * Math.PI) * 0.08;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, scale, 1.6, delta));
  });

  return <group ref={group}><group rotation={[0, 0, 0.5]}><primitive object={scene} /></group></group>;
}

function PlaceholderModel({ motion }: { motion: React.MutableRefObject<ScrollMotion> }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const p = motion.current.progress;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.clock.elapsedTime * 0.1 + p * 1.8 + state.pointer.x * 0.25, 1.2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.18 + Math.sin(p * Math.PI * 2) * 0.12 - state.pointer.y * 0.15, 1.2, delta);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.06 + p * 0.12;
  });
  return <group ref={group}>
    <mesh castShadow><icosahedronGeometry args={[1.05, 1]} /><meshStandardMaterial color="#10151c" metalness={0.85} roughness={0.24} wireframe /></mesh>
    <mesh rotation={[0.5, 0.3, 0.2]}><torusGeometry args={[1.35, 0.012, 8, 100]} /><meshBasicMaterial color="#168bff" /></mesh>
    <mesh rotation={[1.2, 0.2, 0.8]}><torusGeometry args={[1.52, 0.008, 8, 100]} /><meshBasicMaterial color="#eaf4ff" /></mesh>
    <mesh position={[0, 0, 0.1]}><sphereGeometry args={[0.22, 24, 24]} /><meshStandardMaterial color="#168bff" emissive="#0753b9" emissiveIntensity={1.2} metalness={0.8} roughness={0.2} /></mesh>
  </group>;
}

class ModelErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* A missing local GLB should not take down the landing page. */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function ModelScene({ motion }: { motion: React.MutableRefObject<ScrollMotion> }) {
  return <div className="model-canvas" aria-hidden="true">
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.1], fov: 38 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} color="#dcecff" />
      <pointLight position={[-3, 1, 2]} intensity={40} color="#168bff" distance={9} />
      <pointLight position={[3, 2, -2]} intensity={30} color="#ffffff" distance={9} />
      <pointLight position={[2, -2, -3]} intensity={8} color="#ffffff" distance={7} />
      <pointLight position={[0, 3, -3]} intensity={30} color="#6fb8ff" distance={10} />
      <Suspense fallback={null}>
        <Sparkles count={46} scale={[6, 4, 3]} size={2.4} speed={0.35} opacity={0.7} color="#8fcbff" />
        <ModelErrorBoundary fallback={<PlaceholderModel motion={motion} />}><TeamModel motion={motion} /></ModelErrorBoundary>
        <Sparkles count={36} scale={[7, 4, 3]} size={2.2} speed={0.25} color="#8FCBFF" opacity={0.7} />
      </Suspense>
    </Canvas>
  </div>;
}
