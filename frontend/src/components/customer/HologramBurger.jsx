import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Sparkles, Float, Environment } from "@react-three/drei";

function OrbitingLight() {
  const lightRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(t * 0.6) * 3;
      lightRef.current.position.z = Math.cos(t * 0.6) * 3;
    }
  });
  return <pointLight ref={lightRef} position={[3, 2, 3]} intensity={3} color="#fff4e0" />;
}

function BurgerModel() {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/burger/scene.gltf");

  // Gentle continuous rotation, since we can't separate layers on a single-mesh model
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} scale={1.5}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

function HologramBurger() {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 45 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} />
      <OrbitingLight />
      <Suspense fallback={null}>
        <BurgerModel />
        <Environment preset="studio" />
      </Suspense>
      <Sparkles count={80} scale={4} size={2} speed={0.4} color="#f2c14e" />
    </Canvas>
  );
}

useGLTF.preload("/models/burger/scene.gltf");

export default HologramBurger;