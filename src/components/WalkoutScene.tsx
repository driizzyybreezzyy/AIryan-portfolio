import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { gsap } from "gsap";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { site } from "../data/site";
import CardFallback from "./CardFallback";
import CanvasBoundary from "./CanvasBoundary";
import { cue } from "../lib/sound";

/* ─────────────────────────────────────────────────────────────────────────────
   AIryan FC — cinematic 3D walkout.

   A real three.js scene: a foggy tunnel with a wet, reflective floor, sweeping
   gold spotlights, volumetric god-rays, drifting particles and bloom. A backlit
   3D figure walks toward camera (forward motion + arm/leg swing + body bob),
   his traits tease in, then the holographic card flips in and the scene clears
   into the hero.

   Everything is driven by ONE GSAP timeline via a shared `progress` proxy so the
   3D motion and the DOM overlays stay in sync. Calls `onDone()` when finished.
   ──────────────────────────────────────────────────────────────────────────── */

type Progress = { p: number; walk: number; shake: number; push: number };

/* The backlit player figure (stylized, original — no likeness). */
function Figure({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const group = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b1014",
        roughness: 0.45,
        metalness: 0.3,
      }),
    []
  );
  useMemo(() => bodyMat, [bodyMat]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current.p;
    const t = state.clock.elapsedTime;

    // Forward approach: far → near as p goes 0 → ~0.6, then settle close to camera.
    const approach = THREE.MathUtils.smoothstep(Math.min(p / 0.6, 1), 0, 1);
    g.position.z = THREE.MathUtils.lerp(-10, 0.4, approach);
    // Walk cadence eases out as he arrives.
    const cadence = (1 - approach) * progress.current.walk;
    const swing = Math.sin(t * 7) * 0.5 * cadence;
    const bob = Math.abs(Math.sin(t * 7)) * 0.05 * cadence;
    g.position.y = bob;
    g.rotation.y = THREE.MathUtils.lerp(0.25, 0.0, approach);

    if (lArm.current) lArm.current.rotation.x = swing;
    if (rArm.current) rArm.current.rotation.x = -swing;
    if (lLeg.current) lLeg.current.rotation.x = -swing * 0.9;
    if (rLeg.current) rLeg.current.rotation.x = swing * 0.9;

    // Fade the figure out as the card takes over (p → 1).
    const fade = 1 - THREE.MathUtils.smoothstep(Math.max((p - 0.72) / 0.2, 0), 0, 1);
    bodyMat.opacity = fade;
    bodyMat.transparent = fade < 1;
    g.visible = fade > 0.02;
  });

  return (
    <group ref={group} position={[0, 0, -9]}>
      {/* head */}
      <mesh material={bodyMat} position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
      </mesh>
      {/* neck */}
      <mesh material={bodyMat} position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.12, 16]} />
      </mesh>
      {/* torso */}
      <mesh material={bodyMat} position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.24, 0.5, 8, 16]} />
      </mesh>
      {/* hips */}
      <mesh material={bodyMat} position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.2, 0.12, 8, 16]} />
      </mesh>

      {/* arms (pivot at shoulder) */}
      <group ref={lArm} position={[-0.3, 1.35, 0]}>
        <mesh material={bodyMat} position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 8, 12]} />
        </mesh>
      </group>
      <group ref={rArm} position={[0.3, 1.35, 0]}>
        <mesh material={bodyMat} position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 8, 12]} />
        </mesh>
      </group>

      {/* legs (pivot at hip) */}
      <group ref={lLeg} position={[-0.13, 0.72, 0]}>
        <mesh material={bodyMat} position={[0, -0.38, 0]}>
          <capsuleGeometry args={[0.1, 0.62, 8, 12]} />
        </mesh>
        <mesh material={bodyMat} position={[0.02, -0.74, 0.07]}>
          <boxGeometry args={[0.16, 0.1, 0.34]} />
        </mesh>
      </group>
      <group ref={rLeg} position={[0.13, 0.72, 0]}>
        <mesh material={bodyMat} position={[0, -0.38, 0]}>
          <capsuleGeometry args={[0.1, 0.62, 8, 12]} />
        </mesh>
        <mesh material={bodyMat} position={[-0.02, -0.74, 0.07]}>
          <boxGeometry args={[0.16, 0.1, 0.34]} />
        </mesh>
      </group>
    </group>
  );
}

/* Optional realistic figure: a rigged .glb that plays its walk animation while
   approaching the camera. Used only when `site.card.model` is set. */
function GlbFigure({
  progress,
  url,
  clip,
  scale = 1,
  yOffset = 0,
}: {
  progress: React.MutableRefObject<Progress>;
  url: string;
  clip?: string;
  scale?: number;
  yOffset?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);

  // Clone scene + materials so opacity tweaks don't leak into the cached asset.
  const model = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      if (Array.isArray(m.material)) m.material = m.material.map((mm) => mm.clone());
      else if (m.material) m.material = (m.material as THREE.Material).clone();
    });
    return s;
  }, [gltf.scene]);

  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    const name = clip && actions[clip] ? clip : names[0];
    const action = name ? actions[name] : null;
    action?.reset().fadeIn(0.3).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [actions, names, clip]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current.p;
    const approach = THREE.MathUtils.smoothstep(Math.min(p / 0.6, 1), 0, 1);
    g.position.z = THREE.MathUtils.lerp(-10, 0.4, approach);
    g.rotation.y = THREE.MathUtils.lerp(0.25, 0, approach);

    const fade = 1 - THREE.MathUtils.smoothstep(Math.max((p - 0.72) / 0.2, 0), 0, 1);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.material) return;
      const mat = m.material as THREE.Material;
      mat.transparent = fade < 1;
      mat.opacity = fade;
    });
    g.visible = fade > 0.02;
  });

  return (
    <group ref={group} position={[0, yOffset, -10]}>
      <primitive object={model} scale={scale} />
    </group>
  );
}

/* Realistic rigged FBX character (e.g. a Mixamo export). Auto-fits to a sensible
   height, plays its first animation clip, walks in and fades out like the others. */
function FbxFigure({
  progress,
  url,
  yOffset = 0,
}: {
  progress: React.MutableRefObject<Progress>;
  url: string;
  yOffset?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX(url);

  // Clone (skeleton-aware) so the cached asset isn't mutated, then normalize
  // scale/position: ~2 units tall, centered, feet on the floor.
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx) as THREE.Object3D;
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = size.y > 0 ? 2.0 / size.y : 1;
    clone.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box2.min.y;
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.material) return;
      m.frustumCulled = false;
      m.castShadow = true;
      m.material = Array.isArray(m.material)
        ? m.material.map((mm) => mm.clone())
        : (m.material as THREE.Material).clone();
    });
    return clone;
  }, [fbx]);

  const { actions, names } = useAnimations(fbx.animations, group);

  useEffect(() => {
    const n = names[0];
    const a = n ? actions[n] : null;
    a?.reset().fadeIn(0.3).play();
    return () => {
      a?.fadeOut(0.2);
    };
  }, [actions, names]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current.p;
    const approach = THREE.MathUtils.smoothstep(Math.min(p / 0.6, 1), 0, 1);
    g.position.z = THREE.MathUtils.lerp(-9, 0.2, approach);

    const fade = 1 - THREE.MathUtils.smoothstep(Math.max((p - 0.72) / 0.2, 0), 0, 1);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.material) return;
      const apply = (mat: THREE.Material) => {
        mat.transparent = fade < 1;
        mat.opacity = fade;
      };
      if (Array.isArray(m.material)) m.material.forEach(apply);
      else apply(m.material as THREE.Material);
    });
    g.visible = fade > 0.02;
  });

  return (
    <group ref={group} position={[0, yOffset, -9]}>
      <primitive object={model} />
    </group>
  );
}

/* Picks the realistic FBX / glb model when configured, else the stylized figure.
   While a heavy model streams in, the built-in figure stands in (Suspense). */
function WalkoutFigure({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const model = site.card.model;
  if (model?.url) {
    const isFbx = /\.fbx(\?|$)/i.test(model.url);
    return (
      <CanvasBoundary fallback={<Figure progress={progress} />}>
        <Suspense fallback={<Figure progress={progress} />}>
          {isFbx ? (
            <FbxFigure progress={progress} url={model.url} yOffset={model.yOffset} />
          ) : (
            <GlbFigure
              progress={progress}
              url={model.url}
              clip={model.walkClip}
              scale={model.scale}
              yOffset={model.yOffset}
            />
          )}
        </Suspense>
      </CanvasBoundary>
    );
  }
  return <Figure progress={progress} />;
}

// Start streaming the heavy character as soon as this scene module loads.
if (site.card.model?.url && /\.fbx(\?|$)/i.test(site.card.model.url)) {
  useFBX.preload(site.card.model.url);
}

/* Volumetric god-ray cones from above. */
function GodRays() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) a.current.rotation.y = Math.sin(t * 0.3) * 0.25;
    if (b.current) b.current.rotation.y = -0.4 + Math.sin(t * 0.25 + 1) * 0.25;
  });
  return (
    <>
      <mesh ref={a} position={[-1.4, 4, -3]} rotation={[0, 0, 0.16]}>
        <coneGeometry args={[1.6, 8, 24, 1, true]} />
        <meshBasicMaterial color="#f4e6bd" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={b} position={[1.6, 4, -3.5]} rotation={[0, 0, -0.18]}>
        <coneGeometry args={[1.8, 8, 24, 1, true]} />
        <meshBasicMaterial color="#e9c46a" transparent opacity={0.045} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

/* Drifting gold particles. */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 220;
  const { geometry, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12543.123;
      const c = Math.sin(i * 39.425) * 9123.77;
      pos[i * 3] = (a - Math.floor(a) - 0.5) * 12;
      pos[i * 3 + 1] = (b - Math.floor(b)) * 6;
      pos[i * 3 + 2] = (c - Math.floor(c) - 0.5) * 10 - 3;
      spd[i] = 0.1 + (a - Math.floor(a)) * 0.35;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, speeds: spd };
  }, []);
  useFrame((_, delta) => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      let y = pos.getY(i) + speeds[i] * delta;
      if (y > 6) y = -0.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#e9c46a" size={0.045} transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Rig({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    // Subtle camera dolly + sway for cinematic depth.
    const t = state.clock.elapsedTime;
    const dolly = THREE.MathUtils.smoothstep(Math.min(progress.current.p / 0.6, 1), 0, 1);
    let x = Math.sin(t * 0.25) * 0.22;
    let y = 1.25 + Math.sin(t * 0.2) * 0.05;
    // Final beat pushes the camera in toward the card.
    const push = progress.current.push;
    let z = THREE.MathUtils.lerp(6.4, 4.4, dolly) - push * 1.8;
    // Camera shake on major reveals.
    const sh = progress.current.shake;
    if (sh > 0) {
      x += (Math.random() - 0.5) * sh * 0.45;
      y += (Math.random() - 0.5) * sh * 0.45;
      z += (Math.random() - 0.5) * sh * 0.2;
    }
    state.camera.position.set(x, y, z);
    state.camera.lookAt(0, 1.0, -1);
    if (spot.current) spot.current.target = target;
  });
  return (
    <>
      <primitive object={target} position={[0, 1, -0.5]} />
      <ambientLight intensity={0.45} color="#aebfce" />
      {/* key spotlight from above-front */}
      <spotLight ref={spot} position={[0, 6, 3]} angle={0.55} penumbra={0.85} intensity={180} color="#fff2cf" distance={24} />
      {/* front fill so the character's textures read (not a black silhouette) */}
      <pointLight position={[0, 1.8, 4.5]} intensity={55} color="#fff4e0" distance={18} />
      {/* gold rim from behind the figure (backlight) */}
      <pointLight position={[0, 2.2, -3]} intensity={60} color="#e9c46a" distance={14} />
      {/* club-hint rim accents */}
      <pointLight position={[-4, 2.4, -3]} intensity={20} color="#e23b3b" distance={14} />
      <pointLight position={[4, 2.4, -3]} intensity={20} color="#3b5bdb" distance={14} />
    </>
  );
}

/* Small original India tricolour (generic national flag — no emblem trademarks). */
function IndiaFlag() {
  return (
    <span className="beatflag" aria-hidden="true">
      <i style={{ background: "#FF9933" }} />
      <i style={{ background: "#ffffff" }} />
      <i style={{ background: "#138808" }} />
      <span className="beatflag__chakra" />
    </span>
  );
}

export default function WalkoutScene({ onDone }: { onDone: () => void }) {
  const progress = useRef<Progress>({ p: 0, walk: 1, shake: 0, push: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const ovrRef = useRef<HTMLDivElement>(null);
  const ovrNumRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useLayoutEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onDone });

      // A light burst + optional camera shake + audio cue for a reveal beat.
      const beat = (at: number, shake = 0, sound: "beat" | "rise" | "impact" = "beat") => {
        tl.fromTo(
          burstRef.current,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 0.7, scale: 1, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 },
          at
        );
        if (shake > 0) {
          tl.to(progress.current, { shake, duration: 0.06 }, at);
          tl.to(progress.current, { shake: 0, duration: 0.5, ease: "power2.out" }, at + 0.06);
        }
        tl.call(() => cue(sound), [], at);
      };

      // ── The figure walks out of the tunnel (anticipation) ──
      tl.to(progress.current, { p: 0.6, duration: 3.0, ease: "power1.inOut" }, 0);
      tl.call(() => cue("whoosh"), [], 0.2);

      // ── Stage A — India flag ──
      beat(2.7, 0.25);
      tl.fromTo(flagRef.current, { autoAlpha: 0, scale: 0.5, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, 2.7);
      tl.to(flagRef.current, { autoAlpha: 0, scale: 0.9, duration: 0.3 }, 3.6);

      // ── Stage B — role ──
      beat(3.7, 0.2);
      tl.fromTo(roleRef.current, { autoAlpha: 0, y: 24, letterSpacing: "0.5em" }, { autoAlpha: 1, y: 0, letterSpacing: "0.18em", duration: 0.55, ease: "power3.out" }, 3.7);
      tl.to(roleRef.current, { autoAlpha: 0, duration: 0.3 }, 4.7);

      // ── Stage C — overall rating counts 0 → 99 ──
      beat(4.8, 0.2);
      tl.fromTo(ovrRef.current, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, 4.8);
      const counter = { v: 0 };
      tl.to(
        counter,
        {
          v: site.card.ovr,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (ovrNumRef.current) ovrNumRef.current.textContent = String(Math.round(counter.v));
          },
        },
        4.9
      );
      tl.call(() => cue("rise"), [], 4.9);
      // Punch + shake the instant it hits 99.
      tl.to(progress.current, { shake: 0.6, duration: 0.06 }, 6.1);
      tl.to(progress.current, { shake: 0, duration: 0.5, ease: "power2.out" }, 6.16);
      tl.fromTo(ovrRef.current, { scale: 1 }, { scale: 1.18, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" }, 6.1);
      tl.to(ovrRef.current, { autoAlpha: 0, duration: 0.3 }, 6.5);

      // ── Stage D — name ──
      beat(6.6, 0.7, "impact");
      tl.fromTo(nameRef.current, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 6.6);
      tl.to(nameRef.current, { autoAlpha: 0, duration: 0.4 }, 7.5);

      // ── The card resolves — the hero of the reveal ──
      tl.to(progress.current, { p: 1, duration: 0.9, ease: "power2.in" }, 7.3);
      tl.fromTo(
        cardRef.current,
        { autoAlpha: 0, rotateY: 110, scale: 0.78 },
        { autoAlpha: 1, rotateY: 0, scale: 1, duration: 0.85, ease: "power3.out" },
        7.5
      );
      tl.to(canvasWrapRef.current, { opacity: 0.18, duration: 0.7 }, 7.5);
      tl.call(() => cue("impact"), [], 7.5);

      // ── Final transition — camera pushes in, card expands, morph to hero ──
      tl.to({}, { duration: 0.9 }, 8.4); // let the card breathe
      tl.to(progress.current, { push: 1, duration: 0.7, ease: "power2.in" }, 9.0);
      tl.to(cardRef.current, { scale: 1.55, duration: 0.7, ease: "power2.in" }, 9.0);
      tl.to(rootRef.current, { opacity: 0, duration: 0.55, ease: "power2.inOut" }, 9.2);
    }, rootRef);
    return () => ctx.revert();
  }, [reduced, onDone]);

  if (reduced) return null;

  return (
    <div className="walkscene" ref={rootRef}>
      <div className="walkscene__canvas" ref={canvasWrapRef}>
        <Canvas
          camera={{ position: [0, 1.35, 6.6], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#05080a"]} />
          <fog attach="fog" args={["#05080a", 4, 16]} />
          <Rig progress={progress} />
          <GodRays />
          <Particles />
          <WalkoutFigure progress={progress} />
          {/* wet reflective tunnel floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
            <planeGeometry args={[40, 40]} />
            <MeshReflectorMaterial
              mirror={0.6}
              resolution={512}
              blur={[300, 100]}
              mixBlur={1}
              mixStrength={6}
              roughness={0.9}
              depthScale={1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.2}
              color="#05080a"
              metalness={0.65}
            />
          </mesh>
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.95} mipmapBlur />
            <Vignette eskil={false} offset={0.25} darkness={0.85} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Reveal-beat light burst */}
      <div className="beatburst" ref={burstRef} aria-hidden="true" />

      {/* EA-FC-style reveal beats (one at a time) */}
      <div className="beat beat--flag" ref={flagRef} aria-hidden="true">
        <IndiaFlag />
        <span className="beat__caption">{site.card.nation}</span>
      </div>
      <div className="beat beat--role" ref={roleRef} aria-hidden="true">
        {site.card.roleBeat}
      </div>
      <div className="beat beat--ovr" ref={ovrRef} aria-hidden="true">
        <span className="beat__ovr" ref={ovrNumRef}>0</span>
        <span className="beat__ovrlabel">OVR</span>
      </div>
      <div className="beat beat--name" ref={nameRef} aria-hidden="true">
        {site.identity.name.toUpperCase()}
      </div>

      <div className="walkout__card walkscene__card" ref={cardRef} aria-hidden="true">
        <CardFallback />
      </div>
    </div>
  );
}
