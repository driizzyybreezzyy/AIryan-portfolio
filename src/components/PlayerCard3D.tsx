import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { site } from "../data/site";
import CardFallback from "./CardFallback";

/* ─────────────────────────────────────────────────────────────────────────────
   The interactive 3D player card.

   - The card FACE is painted on a 2D canvas (gold frame, green inner panel, OVR,
     position, nation, avatar, name, six dev-themed stats, club) and applied to a
     rounded plane as a CanvasTexture.
   - A second plane in front carries a holographic-foil shader whose rainbow sheen
     shifts with the card's tilt angle.
   - The whole card lerps its tilt toward the pointer (r3f `state.pointer`).
   - On reduced-motion or no-WebGL we fall back to a fully styled, static DOM card.
   - The card's text also exists as real HTML (CardSemantics / the DOM fallback)
     for screen readers and SEO.
   ──────────────────────────────────────────────────────────────────────────── */

const CARD_W = 620;
const CARD_H = 868;
const ASPECT = CARD_W / CARD_H;
const PLANE_H = 3.5;
const PLANE_W = PLANE_H * ASPECT;

/* ── Paint the card face onto a 2D canvas ─────────────────────────────────── */
function drawCardFace(
  ctx: CanvasRenderingContext2D,
  avatar: HTMLImageElement | null
) {
  const W = CARD_W;
  const H = CARD_H;
  ctx.clearRect(0, 0, W, H);

  // Rounded-rect clip so corners are transparent (rounded card).
  const radius = 46;
  const path = new Path2D();
  path.roundRect(0, 0, W, H, radius);
  ctx.save();
  ctx.clip(path);

  // Inner background: pitch-green sheen fading to near-black.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1c3328");
  bg.addColorStop(0.45, "#121a16");
  bg.addColorStop(1, "#0a0f0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Player photo — the large, high-contrast centerpiece ──
  // Fills the upper ~62% of the card, full width within the frame.
  const pX = 34;
  const pY = 34;
  const pW = W - 68;
  const pH = 540;
  if (avatar) {
    ctx.save();
    const clip = new Path2D();
    clip.roundRect(pX, pY, pW, pH, [radius - 12, radius - 12, 18, 18]);
    ctx.clip(clip);
    // object-fit: cover — center-crop, biased slightly to the top (faces).
    const boxAr = pW / pH;
    let sw = avatar.width;
    let sh = avatar.height;
    let sx = 0;
    let sy = 0;
    if (avatar.width / avatar.height > boxAr) {
      sw = avatar.height * boxAr;
      sx = (avatar.width - sw) / 2;
    } else {
      sh = avatar.width / boxAr;
      sy = (avatar.height - sh) * 0.32;
    }
    ctx.filter = "contrast(1.14) saturate(1.14) brightness(1.03)";
    ctx.drawImage(avatar, sx, sy, sw, sh, pX, pY, pW, pH);
    ctx.filter = "none";

    // Bottom fade so the photo melts into the card.
    const fade = ctx.createLinearGradient(0, pY + pH - 220, 0, pY + pH);
    fade.addColorStop(0, "rgba(10,15,12,0)");
    fade.addColorStop(1, "#0a0f0c");
    ctx.fillStyle = fade;
    ctx.fillRect(pX, pY + pH - 220, pW, 220);

    // Left fade for OVR legibility.
    const lfade = ctx.createLinearGradient(pX, 0, pX + 230, 0);
    lfade.addColorStop(0, "rgba(8,12,10,0.78)");
    lfade.addColorStop(1, "rgba(8,12,10,0)");
    ctx.fillStyle = lfade;
    ctx.fillRect(pX, pY, 230, 320);
    ctx.restore();
  }

  // ── OVR / position / flag overlaid top-left (FUT style) ──
  ctx.textBaseline = "alphabetic";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#e9c46a";
  ctx.font = "150px 'Bebas Neue', sans-serif";
  ctx.fillText(String(site.card.ovr), 56, 176);

  ctx.fillStyle = "#eaf6ee";
  ctx.font = "42px 'Bebas Neue', sans-serif";
  ctx.fillText(site.card.position, 62, 222);
  ctx.restore();

  // thin gold rule
  ctx.strokeStyle = "rgba(233,196,106,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(62, 244);
  ctx.lineTo(188, 244);
  ctx.stroke();

  // Mini India tricolour flag (generic national flag — original drawing).
  const fx = 62;
  const fy = 260;
  const fw = 56;
  const fh = 38;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#FF9933";
  ctx.fillRect(fx, fy, fw, fh / 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(fx, fy + fh / 3, fw, fh / 3);
  ctx.fillStyle = "#138808";
  ctx.fillRect(fx, fy + (2 * fh) / 3, fw, fh / 3);
  ctx.strokeStyle = "#0b3d91";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx + fw / 2, fy + fh / 2, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── Name ──
  ctx.fillStyle = "#f3f7f3";
  ctx.textAlign = "center";
  ctx.font = "70px 'Bebas Neue', sans-serif";
  ctx.fillText(site.identity.name.toUpperCase(), W / 2, 620);

  ctx.strokeStyle = "rgba(233,196,106,0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 642);
  ctx.lineTo(W - 120, 642);
  ctx.stroke();

  // ── FUT attributes: 2 columns × 3 rows ──
  const stats = site.card.stats;
  const rowY = [702, 758, 814];
  const colValX = [70, 330];
  const colLabelX = [128, 388];
  for (let i = 0; i < stats.length; i++) {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const vx = colValX[col];
    const lx = colLabelX[col];
    const y = rowY[row];

    ctx.textAlign = "left";
    ctx.fillStyle = "#e9c46a";
    ctx.font = "46px 'Bebas Neue', sans-serif";
    ctx.fillText(String(stats[i].value), vx, y);

    ctx.fillStyle = "#eaf6ee";
    ctx.font = "600 24px 'Space Grotesk', sans-serif";
    ctx.fillText(stats[i].key, lx, y - 4);
  }

  // centre divider between the two stat columns
  ctx.strokeStyle = "rgba(243,247,243,0.14)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2, 678);
  ctx.lineTo(W / 2, 832);
  ctx.stroke();

  // ── Club footer ──
  ctx.fillStyle = "#93a29a";
  ctx.font = "600 21px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(site.card.club.toUpperCase(), W / 2, H - 42);
  ctx.textAlign = "left";

  ctx.restore();

  // ── Gold frame border ──
  ctx.strokeStyle = "#e9c46a";
  ctx.lineWidth = 8;
  const frame = new Path2D();
  frame.roundRect(6, 6, W - 12, H - 12, radius - 4);
  ctx.stroke(frame);
  ctx.strokeStyle = "rgba(233,196,106,0.35)";
  ctx.lineWidth = 2;
  const frame2 = new Path2D();
  frame2.roundRect(20, 20, W - 40, H - 40, radius - 14);
  ctx.stroke(frame2);
}

/* ── Holographic foil shader ──────────────────────────────────────────────── */
const foilVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const foilFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uTilt;
  varying vec2 vUv;

  void main() {
    // Rounded-rect mask so the foil never spills past the card corners.
    vec2 q = abs(vUv - 0.5) - (0.5 - 0.055);
    float dist = length(max(q, 0.0)) - 0.055;
    if (dist > 0.0) discard;

    float diag = vUv.x * 0.65 + vUv.y * 0.35;
    float phase = diag * 3.0 + uTilt.x * 1.3 + uTilt.y * 0.7 + uTime * 0.06;
    vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));

    // Moving highlight band that tracks tilt — the "shine".
    float bandPos = fract(diag * 1.5 - uTilt.x * 0.6 - uTilt.y * 0.35 + uTime * 0.02);
    float band = smoothstep(0.34, 0.5, bandPos) * smoothstep(0.66, 0.5, bandPos);

    float tiltMag = clamp(length(uTilt), 0.0, 1.0);
    float intensity = (0.10 + band * 0.55) * (0.35 + 0.65 * tiltMag);

    gl_FragColor = vec4(rainbow * intensity, 1.0);
  }
`;

/* ── The card mesh + tilt + foil animation ────────────────────────────────── */
function CardMesh({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const foilRef = useRef<THREE.ShaderMaterial>(null);
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);

  // Build the face canvas + texture once.
  const { texture, canvas, ctx } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = CARD_W;
    c.height = CARD_H;
    const context = c.getContext("2d")!;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { texture: tex, canvas: c, ctx: context };
  }, []);

  // Load the avatar and (re)draw when it or fonts become available.
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setAvatar(img);
    };
    img.src = "/avatar.jpeg";
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const redraw = () => {
      drawCardFace(ctx, avatar);
      texture.needsUpdate = true;
    };
    redraw();
    // Re-draw once webfonts are ready so the Bebas numerals render crisply.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(redraw).catch(() => {});
    }
    return () => {
      // nothing to clean per-draw
    };
  }, [avatar, ctx, texture, canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTilt: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (reducedMotion || document.hidden) {
      // Hold a gentle, static 3/4 angle; no continuous motion.
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.04, 0.1);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0.12, 0.1);
      return;
    }

    const px = state.pointer.x; // -1..1
    const py = state.pointer.y; // -1..1
    const targetY = px * 0.55;
    const targetX = -py * 0.4;

    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.07);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.07);

    if (foilRef.current) {
      foilRef.current.uniforms.uTime.value += delta;
      (foilRef.current.uniforms.uTilt.value as THREE.Vector2).set(
        g.rotation.y,
        g.rotation.x
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Card face */}
      <mesh>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      {/* Holographic foil overlay */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <shaderMaterial
          ref={foilRef}
          vertexShader={foilVertex}
          fragmentShader={foilFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Hidden semantic copy of the card (SEO + screen readers) ──────────────── */
function CardSemantics() {
  return (
    <div className="visually-hidden">
      <p>
        AIryan FC special card. {site.identity.name}, overall rating {site.card.ovr},
        position {site.card.position}, {site.card.club}, {site.card.nation}.
      </p>
      <ul>
        {site.card.stats.map((s) => (
          <li key={s.key}>
            {s.key} ({s.meaning}): {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function PlayerCard3D() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    setWebgl(hasWebGL());
  }, []);

  // Reduced-motion or no-WebGL → static, fully accessible DOM card.
  if (reducedMotion || !webgl) {
    return <CardFallback />;
  }

  return (
    <>
      <div className="card-canvas">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 38 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <CardMesh reducedMotion={reducedMotion} />
        </Canvas>
      </div>
      <CardSemantics />
    </>
  );
}
