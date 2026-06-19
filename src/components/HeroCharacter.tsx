import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useAnimations, useFBX } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { site } from "../data/site";
import CanvasBoundary from "./CanvasBoundary";

/* ─────────────────────────────────────────────────────────────────────────────
   AIryan FC — the live player, kept on the landing hero.

   Reuses the same rigged character as the walkout (drei caches the FBX, so no
   second download), playing its animation on loop beside the card. Lightweight:
   no post-processing, capped dpr, and it pauses when scrolled out of view.
   Reduced-motion / no-WebGL → renders nothing (the card alone carries the hero).
   ──────────────────────────────────────────────────────────────────────────── */

function Model({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX(url);

  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx) as THREE.Object3D;
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = size.y > 0 ? 2.1 / size.y : 1;
    clone.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box2.min.y;
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.frustumCulled = false;
    });
    return clone;
  }, [fbx]);

  const { actions, names } = useAnimations(fbx.animations, group);
  useEffect(() => {
    const n = names[0];
    const a = n ? actions[n] : null;
    a?.reset().fadeIn(0.4).play();
    return () => {
      a?.fadeOut(0.2);
    };
  }, [actions, names]);

  // Gentle turntable sway so it feels alive even between animation beats.
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  // Offset the player left of centre so the card (lower-right) sits beside him
  // rather than slicing through his body.
  return (
    <group ref={group} position={[-0.75, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

/* Frame the full body once the camera is ready (no head cropping). */
function FrameCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.0, 5.0);
    camera.lookAt(0, 1.0, 0);
  }, [camera]);
  return null;
}

export default function HeroCharacter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [enabled] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Pause the render loop when the hero scrolls out of view (perf).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const modelUrl = site.card.model?.url;
  if (!enabled || !modelUrl) return null;

  return (
    <div className="hero-character" ref={wrapRef} aria-hidden="true">
      <CanvasBoundary fallback={null}>
        <Canvas
          camera={{ position: [0, 1.0, 5.0], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          frameloop={inView ? "always" : "demand"}
        >
          <FrameCamera />
          <ambientLight intensity={0.7} color="#cdd8e2" />
          <spotLight position={[3, 6, 5]} angle={0.6} penumbra={0.8} intensity={140} color="#fff3d6" />
          <pointLight position={[-3, 2, 3]} intensity={26} color="#1FB257" distance={14} />
          <pointLight position={[2, 2.5, -3]} intensity={30} color="#e9c46a" distance={14} />
          <Suspense fallback={null}>
            <Model url={modelUrl} />
          </Suspense>
          <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={7} blur={2.6} far={4.5} color="#000000" />
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
