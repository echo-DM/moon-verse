import {
  useLayoutEffect,
  useMemo,
  useRef,
  useEffect,
  useState,
  Component,
  type ComponentRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  OrbitControls,
  SoftShadows,
  Stars,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { chapters, overview, finaleCloseup } from "./chapters";

type Block = {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  r?: number;
};
const stone = ["#56696b", "#64797a", "#445c60", "#738687"];
const jade = ["#325a50", "#426c59", "#55836c", "#254b44", "#6c8b6b"];
const roof = ["#294d50", "#355e60", "#487376", "#5b8987"];
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function Blocks({
  blocks,
  luminous = false,
  mist = false,
  fog = true,
}: {
  blocks: Block[];
  luminous?: boolean;
  mist?: boolean;
  fog?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const o = new THREE.Object3D();
    blocks.forEach((b, i) => {
      o.position.set(...b.p);
      o.scale.set(...b.s);
      o.rotation.set(0, b.r || 0, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, new THREE.Color(b.c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [blocks]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, blocks.length]}
      castShadow={!luminous && !mist}
      receiveShadow={!luminous && !mist}
    >
      <boxGeometry />
      {luminous ? (
        <meshBasicMaterial toneMapped={false} fog={fog} />
      ) : (
        <meshStandardMaterial
          roughness={0.83}
          metalness={0.08}
          transparent={mist}
          opacity={mist ? 0.16 : 1}
          depthWrite={!mist}
        />
      )}
    </instancedMesh>
  );
}
function architecture(
  x: number,
  y: number,
  z: number,
  scale = 1,
  levels = 1,
  closed = false,
): Block[] {
  const b: Block[] = [];
  const add = (
    px: number,
    py: number,
    pz: number,
    sx: number,
    sy: number,
    sz: number,
    c: string,
  ) =>
    b.push({
      p: [x + px * scale, y + py * scale, z + pz * scale],
      s: [sx * scale, sy * scale, sz * scale],
      c,
    });
  for (let step = 0; step < 3; step++)
    add(0, step * 0.22, 0, 7 - step * 0.5, 0.22, 6 - step * 0.5, stone[step]);
  for (let l = 0; l < levels; l++) {
    const h = 0.7 + l * 4.5;
    add(0, h, 0, 6, 0.2, 5, "#969c8a");
    for (const px of [-2.55, 2.55])
      for (const pz of [-2.05, 2.05]) {
        add(px, h + 1.5, pz, 0.27, 3, 0.27, "#884e3c");
        add(px, h + 0.15, pz, 0.55, 0.25, 0.55, "#c0ab87");
        add(px, h + 2.9, pz, 0.55, 0.25, 0.55, "#c0ab87");
      }
    add(0, h + 2.95, -2.05, 5.5, 0.25, 0.28, "#a37552");
    add(0, h + 2.95, 2.05, 5.5, 0.25, 0.28, "#a37552");
    if (closed) {
      add(0, h + 1.4, -1.8, 5, 0.0 + 2.8, 0.18, "#6b3a31");
      for (const wx of [-1.55, 1.55]) {
        add(wx, h + 1.6, 1.88, 1.3, 2, 0.12, "#b88b57");
        for (let t = -0.5; t <= 0.5; t += 0.25)
          add(wx + t, h + 1.6, 2, 0.05, 2.05, 0.1, "#492f2a");
        for (let t = 0.7; t < 2.7; t += 0.32)
          add(wx, h + t, 2, 1.35, 0.055, 0.1, "#492f2a");
      }
    }
    for (let i = 0; i < 10; i++) {
      const half = 3.8 - i * 0.3,
        depth = 3.2 - i * 0.245;
      add(
        0,
        h + 3.1 + i * 0.13,
        0,
        half * 2,
        0.16,
        depth * 2,
        roof[i % roof.length],
      );
      // Individual glazed tiles retain fine cubic detail along the eaves.
      for (let tx = -half; tx < half; tx += 0.26) {
        add(
          tx,
          h + 3.21 + i * 0.13,
          depth,
          0.21,
          0.1,
          0.23,
          roof[(i + 1) % roof.length],
        );
        add(
          tx,
          h + 3.21 + i * 0.13,
          -depth,
          0.21,
          0.1,
          0.23,
          roof[(i + 1) % roof.length],
        );
      }
      if (i < 3)
        for (const sx of [-1, 1])
          for (const sz of [-1, 1])
            add(
              sx * (half - 0.1),
              h + 3.4 - i * 0.04,
              sz * depth,
              0.3,
              0.25,
              0.3,
              "#81a09a",
            );
    }
    add(0, h + 4.45, 0, 2.4, 0.18, 0.25, "#a0b2a3");
    for (const sx of [-1, 1]) {
      add(sx * 1.3, h + 4.6, 0, 0.24, 0.35, 0.3, "#a0b2a3");
    }
    for (let i = -2; i <= 2; i++) {
      add(i, h + 0.65, -2.15, 0.12, 1, 0.12, "#965f42");
      if (!closed) add(i, h + 0.65, 2.15, 0.12, 1, 0.12, "#965f42");
    }
    add(0, h + 1, -2.15, 5, 0.14, 0.14, "#ae8e62");
  }
  return b;
}
function tree(
  x: number,
  y: number,
  z: number,
  s: number,
  seed: number,
  autumn = false,
): Block[] {
  const b: Block[] = [];
  const rand = seeded(seed);
  b.push({
    p: [x, y + 2.1 * s, z],
    s: [0.38 * s, 4.2 * s, 0.4 * s],
    c: "#524a3b",
  });
  for (let k = 0; k < 4; k++) {
    const dx = (k % 2 === 0 ? -1 : 1) * (0.5 + k * 0.12) * s;
    b.push({
      p: [x + dx * 0.5, y + (2 + k * 0.55) * s, z],
      s: [Math.abs(dx) * 1.4, 0.24 * s, 0.26 * s],
      c: "#635741",
    });
    for (let n = 0; n < 145; n++) {
      const px = (rand() - 0.5) * 3.6 * s + dx,
        pz = (rand() - 0.5) * 2.6 * s,
        py = (rand() - 0.5) * 0.8 * s;
      const size = (0.16 + rand() * 0.32) * s;
      b.push({
        p: [x + px, y + (2.3 + k * 0.6) * s + py, z + pz],
        s: [size, 0.16 * s + rand() * 0.22 * s, size],
        c: autumn
          ? ["#bc985f", "#af884f", "#d5b478", "#837844"][Math.floor(rand() * 4)]
          : jade[Math.floor(rand() * jade.length)],
      });
    }
  }
  return b;
}
function person(
  x: number,
  y: number,
  z: number,
  pose: "still" | "raise" | "dance" | "sit" = "still",
): Block[] {
  const seated = pose === "sit",
    dance = pose === "dance",
    raised = pose === "raise";
  const top = seated ? 0.94 : 1.3;
  const b: Block[] = [];
  for (let i = 0; i < 7; i++) {
    const width = 0.68 - i * 0.038;
    b.push({
      p: [x, y + ((i + 0.5) * top) / 7, z],
      s: [width, top / 7 + 0.01, 0.42],
      c: i % 2 ? "#b7c1ad" : "#c8ceb8",
    });
  }
  b.push(
    { p: [x, y + top + 0.22, z], s: [0.31, 0.36, 0.3], c: "#c9a37b" },
    { p: [x, y + top + 0.44, z], s: [0.35, 0.14, 0.34], c: "#253b39" },
    { p: [x, y + top + 0.55, z - 0.07], s: [0.14, 0.12, 0.16], c: "#253b39" },
    {
      p: [x, y + top * 0.64, z + 0.23],
      s: [0.09, top * 0.6, 0.05],
      c: "#647f76",
    },
    {
      p: [x - 0.38, y + top * 0.76, z],
      s: [dance ? 0.6 : 0.25, dance ? 0.3 : 0.53, 0.33],
      c: "#d1d2b9",
    },
    { p: [x + 0.36, y + top * 0.85, z], s: [0.3, 0.38, 0.33], c: "#d1d2b9" },
    {
      p: [x + 0.54, y + top * (raised || dance ? 1.12 : 0.62), z],
      s: [0.28, 0.26, 0.3],
      c: "#d1d2b9",
    },
    {
      p: [x + 0.61, y + top * (raised || dance ? 1.3 : 0.54), z],
      s: [0.12, 0.15, 0.13],
      c: "#caa976",
    },
  );
  if (raised)
    b.push({
      p: [x + 0.61, y + top * 1.3 + 0.16, z],
      s: [0.17, 0.16, 0.17],
      c: "#d9c391",
    });
  if (seated)
    b.push(
      { p: [x, y + 0.28, z - 0.15], s: [0.8, 0.5, 0.7], c: "#75543c" },
      { p: [x, y + 0.48, z + 0.25], s: [0.63, 0.22, 0.65], c: "#c8ceb8" },
    );
  return b;
}
function bridge(x: number, z: number, length = 15): Block[] {
  const b: Block[] = [];
  for (let i = 0; i < length * 2; i++) {
    const u = i / (length * 2 - 1),
      px = x + (u - 0.5) * length,
      h = 0.8 + Math.sin(u * Math.PI) * 1.8;
    b.push({ p: [px, h, z], s: [0.49, 0.35, 2.2], c: stone[i % 4] });
    for (const s of [-1, 1]) {
      if (i % 2 === 0)
        b.push({
          p: [px, h + 0.65, z + s],
          s: [0.14, 1.2, 0.14],
          c: "#8c9e93",
        });
      b.push({ p: [px, h + 1, z + s], s: [0.52, 0.12, 0.15], c: "#99a99a" });
    }
  }
  return b;
}
function island(cx: number, cz: number, r: number, seed: number): Block[] {
  const rand = seeded(seed),
    b: Block[] = [];
  for (let ix = -r; ix <= r; ix += 0.48)
    for (let iz = -r; iz <= r; iz += 0.48) {
      const d = Math.sqrt(ix * ix + iz * iz);
      if (d > r - 0.3 + rand() * 0.8) continue;
      const top = 0.3 + Math.floor((1 - d / r) * 3) * 0.22;
      b.push({
        p: [cx + ix, top - 0.8, cz + iz],
        s: [0.49, 1.6, 0.49],
        c: stone[Math.floor(rand() * 4)],
      });
      if (d > r - 1.5 && rand() > 0.45)
        b.push({
          p: [cx + ix, top + 0.05, cz + iz],
          s: [0.42, 0.18, 0.42],
          c: jade[Math.floor(rand() * 5)],
        });
    }
  return b;
}
// Fixed world coordinates; poetry navigation never rebuilds or hides landmarks.
const locations: [number, number, number][] = [
  [-32, 0, 21], [-16, 26, -44], [-3, 0, 8], [22, 0, -7],
  [37, 0, 26], [0, 0, -42], [40, 0, -51],
];
function Landmark({ kind }: { kind: number }) {
  const blocks = useMemo(() => {
    const b: Block[] = [];
    if (kind === 1) {
      b.push(
        ...island(3, -1, 8, 22).map((v) => ({
          ...v,
          p: [v.p[0], v.p[1] + 7, v.p[2]] as [number, number, number],
        })),
      );
      b.push(...architecture(3, 8, -1, 1.2, 2));
      b.push(...architecture(-10, 5, -9, 0.65, 1));
      b.push(...architecture(14, 6, -13, 0.75, 2));
      b.push(
        ...bridge(-3, 3, 13).map((v) => ({
          ...v,
          p: [v.p[0], v.p[1] + 6, v.p[2]] as [number, number, number],
        })),
      );
    } else if (kind === 2) {
      b.push(...architecture(4, 1, -5, 1, 1));
      for (let x = -5; x < 5; x += 0.9)
        for (let z = -3; z < 5; z += 0.9)
          b.push({
            p: [x, 1, z],
            s: [0.87, 0.2, 0.87],
            c: Math.round(x * 10 + z * 10) % 3 === 0 ? "#8a9283" : "#6e8079",
          });
      b.push(...tree(-7, 1, -1, 1.5, 33), ...tree(9, 1, -4, 1.15, 44, true));
    } else if (kind === 3) {
      b.push(...architecture(3, 1, -1, 1.4, 2, true));
      b.push(...tree(-5, 1, -5, 1.45, 53), ...tree(10, 1, -6, 1.2, 45, true));
      b.push(...person(3, 1.9, 2, "sit"));
    } else if (kind === 6) {
      b.push(
        ...architecture(14, 1, -2, 0.9, 1, true),
        ...architecture(2, 1, -81, 1, 1, true),
      );
      b.push(...tree(19, 1, -4, 1.3, 98), ...tree(-4, 1, -83, 1.3, 100, true));
      b.push(...person(2, 1.8, -78.7));
      // A finely tiled terrace opens north toward the distant light.
      for (let x = 5; x <= 14; x += 0.45)
        for (let z = -15; z <= -6; z += 0.45)
          b.push({ p: [x, 1.05, z], s: [0.43, 0.3, 0.43], c: stone[Math.abs(Math.round(x + z)) % 4] });
      for (let x = 5; x <= 14; x += 0.75) {
        b.push({ p: [x, 1.65, -15], s: [0.12, 1.1, 0.12], c: "#93a69b" });
        b.push({ p: [x, 2.15, -15], s: [0.78, 0.12, 0.16], c: "#bec6ac" });
      }
      for (const x of [5, 14])
        for (const z of [-15, -6])
          b.push({ p: [x, 0.3, z], s: [0.35, 1.5, 0.35], c: "#526a69" });
      b.push({ p: [12, 1.85, -12], s: [1.45, 0.16, 0.85], c: "#80674c" });
      for (const x of [11.45, 12.55])
        b.push({ p: [x, 1.5, -12], s: [0.12, 0.65, 0.6], c: "#66543e" });
      b.push({ p: [11.7, 2, -12], s: [0.18, 0.2, 0.18], c: "#dfcba1" });
      b.push({ p: [12.3, 2.12, -12], s: [0.23, 0.42, 0.23], c: "#a9b9ab" });
    } else {
      b.push(...architecture(8, 1, -1, 1.1, kind === 0 ? 2 : 1));
      b.push(...bridge(-3, 3, 17));
      b.push(
        ...tree(15, 1, -1, 1.5, 3),
        ...tree(2, 1, -6, 1.35, 11),
        ...tree(-15, 1, -4, 1.6, 5, true),
      );
      b.push(
        ...person(
          kind === 5 ? -9 : 3,
          kind === 5 ? 2 : 1.3,
          4,
          kind === 0 ? "raise" : "still",
        ),
      );
      if (kind === 5) b.push(...person(3, 1.5, 4));
      if (kind === 0) {
        b.push(...architecture(-19, 2, -22, 0.65, 2));
        b.push(...tree(10, 1, 7, 0.85, 42, true));
      }
    }
    return b;
  }, [kind]);
  return <Blocks blocks={blocks} />;
}
function Landscape() {
  const blocks = useMemo(() => {
    const b: Block[] = [];
    const rand = seeded(300);
    // Distant stepped peaks, with a distinct readable voxel silhouette.
    for (let m = 0; m < 13; m++) {
      const cx = -85 + m * 14,
        cz = -88 - (m % 3) * 9,
        radius = 8 + rand() * 5,
        peak = (cx > 20 && cx < 67 ? 2 : 10) + rand() * (cx > 20 && cx < 67 ? 2 : 15);
      for (let x = -radius; x < radius; x += 0.7)
        for (let z = -radius; z < radius; z += 0.7) {
          const d = Math.sqrt(x * x + z * z) / radius;
          if (d > 1) continue;
          const h = Math.max(
            0.6,
            Math.floor((Math.pow(1 - d, 1.2) * peak) / 0.65) * 0.65,
          );
          b.push({
            p: [cx + x, h / 2 - 1, cz + z],
            s: [0.71, h, 0.71],
            c: ["#23464c", "#2b5055", "#355a5b", "#294c50"][
              Math.floor(rand() * 4)
            ],
          });
        }
    }
    // A continuous wooded shore joins the courtyard, red pavilion and north bank.
    const shore: [number, number][] = [[-34, 10], [-24, 5], [-14, 3],
      [6, 1], [15, -6], [20, -18], [15, -28], [6, -36],
      [21, -45], [31, -52], [44, -58], [51, -46]];
    const land: [number, number, number][] = [
      ...shore.map(([x, z]): [number, number, number] => [x, z, 6.8]),
      [-25, 21, 9], [-46, 18, 6], [-51, -1, 5], [-3, 8, 11],
      [25, -8, 8], [44, 26, 9], [23, 23, 6], [7, -42, 9],
      [-14, -45, 6], [28, -48, 7], [51, -58, 10], [42, -132, 9],
      [30, 3, 6.8], [37, 14, 6.8],
    ];
    // One height field for all ground-level land prevents overlapping island surfaces.
    for (let x = -58; x <= 62; x += 0.48) {
      for (let z = -144; z <= 38; z += 0.48) {
        let interior = 0;
        for (const [cx, cz, radius] of land)
          interior = Math.max(interior, 1 - Math.hypot(x - cx, z - cz) / radius);
        if (interior <= 0) continue;
        const top = 0.3 + Math.floor(interior * 3) * 0.22;
        b.push({ p: [x, top - 0.8, z], s: [0.48, 1.6, 0.48],
          c: stone[Math.floor(rand() * 4)] });
        if (interior < 0.15 && rand() > 0.55)
          b.push({ p: [x, top + 0.05, z], s: [0.42, 0.18, 0.42],
            c: jade[Math.floor(rand() * 5)] });
      }
    }
    shore.forEach(([x, z], i) => {
      b.push(...tree(x - 2, 1, z - 3, 0.8 + rand() * 0.4, 900 + i));
    });
    // Stone footpaths follow the shoreline rather than isolated stage platforms.
    for (let i = 1; i < shore.length; i++) {
      const [ax, az] = shore[i - 1], [bx, bz] = shore[i];
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5);
      for (let j = 0; j <= steps; j++) b.push({
        p: [ax + (bx - ax) * j / steps, 1, az + (bz - az) * j / steps],
        s: [0.55, 0.14, 1.3], c: stone[j % 4],
        r: -Math.atan2(bz - az, bx - ax),
      });
    }
    return b;
  }, []);
  return <Blocks blocks={blocks} />;
}
function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 0.1]} />
        <meshStandardMaterial color="#71694f" />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[0.45, 0.66, 0.45]} />
        <meshStandardMaterial
          color="#ffd697"
          emissive="#ffad52"
          emissiveIntensity={2.4}
        />
      </mesh>
      {[-1, 1].map((v) => (
        <mesh key={v} position={[0, 1.85 + v * 0.37, 0]}>
          <boxGeometry args={[0.54, 0.09, 0.54]} />
          <meshStandardMaterial color="#674e34" />
        </mesh>
      ))}
      <pointLight
        position={[0, 2.1, 0]}
        color="#ffbc72"
        intensity={12}
        distance={7}
        decay={2}
      />
    </group>
  );
}
function Water({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const r = seeded(83);
    const b: Block[] = [];
    for (let i = 0; i < 1800; i++) {
      const x = (r() - 0.5) * 210,
        z = (r() - 0.5) * 210;
      const path = Math.abs(x + z * 0.37 + 3) < 3 + Math.abs(z) * 0.07;
      b.push({
        p: [x, -0.02 + r() * 0.025, z],
        s: [0.3 + r() * (path ? 2.3 : 1.5), 0.012, 0.025 + r() * 0.045],
        c: path
          ? ["#91ada4", "#a8b6a3", "#587f7d"][i % 3]
          : ["#2b5059", "#345e65", "#23474f"][i % 3],
      });
    }
    return b;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current && !reduced)
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.22) * 0.22;
  });
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color="#183f49"
          metalness={0.42}
          roughness={0.35}
        />
      </mesh>
      <group ref={ref}>
        <Blocks blocks={lines} luminous />
      </group>
    </group>
  );
}
function Moon() {
  const craters = useMemo(() => {
    const r = seeded(4),
      b: Block[] = [];
    for (let i = 0; i < 100; i++) {
      const x = (r() - 0.5) * 5,
        y = (r() - 0.5) * 5;
      if (x * x + y * y > 6.3) continue;
      b.push({
        p: [x, y, Math.sqrt(9 - x * x - y * y) + 0.015],
        s: [0.15 + r() * 0.28, 0.12 + r() * 0.28, 0.06],
        c: i % 2 ? "#d9ddc2" : "#cbd4bf",
      });
    }
    return b;
  }, []);
  return (
    <group position={[0, 88, -170]} scale={4}>
      <Billboard>
        <mesh>
          <planeGeometry args={[19, 19]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={`varying vec2 vUv;
              void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
            fragmentShader={`varying vec2 vUv;
              void main() {
                float radius = length(vUv - 0.5) * 2.0;
                float glow = exp(-radius * radius * 7.0) * (1.0 - smoothstep(0.6, 1.0, radius));
                gl_FragColor = vec4(0.65, 0.76, 0.63, glow * 0.19);
              }`}
          />
        </mesh>
      </Billboard>
      <mesh>
        <sphereGeometry args={[3, 64, 48]} />
        <meshBasicMaterial color="#e5e6cb" toneMapped={false} fog={false} />
      </mesh>
      <Blocks blocks={craters} luminous fog={false} />
    </group>
  );
}
function Clouds({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const blocks = useMemo(() => {
    const r = seeded(67);
    return Array.from({ length: 95 }, (_, i) => ({
      p: [
        (r() - 0.5) * 145,
        24 + r() * 10,
        -25 - r() * 45,
      ] as [number, number, number],
      s: [2 + r() * 5, 0.15 + r() * 0.5, 1 + r() * 3] as [
        number,
        number,
        number,
      ],
      c: ["#afc9bf", "#b1c8bf", "#a4c2bb"][i % 3],
    }));
  }, []);
  useFrame(({ clock }) => {
    if (ref.current && !reduced)
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.04) * 3;
  });
  return (
    <group ref={ref}>
      <Blocks blocks={blocks} mist />
    </group>
  );
}
function Boat({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const blocks = useMemo(() => {
    const b: Block[] = [];
    for (let i = 0; i < 9; i++)
      b.push({
        p: [(i - 4) * 0.4, 0.15 + Math.abs(i - 4) * 0.05, 0],
        s: [0.39, 0.25, Math.max(0.3, 1 - Math.abs(i - 4) * 0.15)],
        c: "#8a7457",
      });
    b.push(...person(0, 0.3, 0));
    return b;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current && !reduced) {
      ref.current.position.x = -8 + Math.sin(clock.elapsedTime * 0.07) * 4;
      ref.current.position.y = Math.sin(clock.elapsedTime) * 0.04;
    }
  });
  return (
    <group ref={ref} position={[-8, 0, 10]} rotation={[0, -0.3, 0]}>
      <Blocks blocks={blocks} />
    </group>
  );
}
function FinaleDetails({ reduced }: { reduced: boolean }) {
  const sleeve = useRef<THREE.Group>(null);
  const shimmer = useRef<THREE.Group>(null);
  const time = useRef(0);
  const figure = useMemo(() => person(0, 0, 0), []);
  const reflections = useMemo(() => {
    const random = seeded(1076);
    return Array.from({ length: 240 }, (_, i): Block => {
      const z = -67 - random() * 59;
      const center = 49 + (z + 67) * 0.3;
      return { p: [center + (random() - 0.5) * 12, 0.015, z],
        s: [0.2 + random() * 1.4, 0.012, 0.035 + random() * 0.045],
        c: ["#8fa99d", "#647f7c", "#b0bca4"][i % 3] };
    });
  }, []);
  useFrame((_, delta) => {
    if (reduced) return;
    time.current += delta;
    if (sleeve.current) sleeve.current.rotation.z = Math.sin(time.current * 0.7) * 0.045;
    if (shimmer.current) shimmer.current.position.x = Math.sin(time.current * 0.19) * 0.18;
  });
  return <group name="finale-details">
    <group position={[49, 1.2, -64]} rotation={[0, Math.PI, 0]}>
      <Blocks blocks={figure} />
      <group ref={sleeve} position={[-0.38, 1, 0]}>
        <mesh position={[-0.1, -0.28, 0]} castShadow>
          <boxGeometry args={[0.3, 0.5, 0.35]} />
          <meshStandardMaterial color="#c8ceb8" roughness={0.9} />
        </mesh>
      </group>
    </group>
    <Lantern position={[53, 1.2, -62]} />
    <Lantern position={[44, 1.2, -129]} />
    <mesh position={[40.45, 3.3, -130.04]}>
      <boxGeometry args={[1.15, 1.8, 0.12]} />
      <meshStandardMaterial color="#e9c78b" emissive="#ffb967" emissiveIntensity={1.3} />
    </mesh>
    <group ref={shimmer}><Blocks blocks={reflections} luminous /></group>
    {[-78, -108].map((z) => (
      <Billboard key={z} position={[40, 2.3, z]}>
        <mesh>
          <planeGeometry args={[42, 4]} />
          <shaderMaterial transparent depthWrite={false}
            vertexShader={`varying vec2 vUv;
              void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
            fragmentShader={`varying vec2 vUv;
              void main(){vec2 p=(vUv-0.5)*2.0;
              float a=exp(-dot(p*vec2(1.3,2.0),p*vec2(1.3,2.0))*2.0);
              gl_FragColor=vec4(0.49,0.64,0.63,a*0.12);}`} />
        </mesh>
      </Billboard>
    ))}
  </group>;
}
function Dancer({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const blocks = useMemo(() => person(0, 0, 0, "dance"), []);
  useFrame(({ clock }) => {
    if (ref.current && !reduced)
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.65) * 0.75;
  });
  return (
    <group ref={ref} position={[0, 1.15, 2]}>
      <Blocks blocks={blocks} />
    </group>
  );
}
type WorldProps = {
  chapter: number;
  reset: number;
  overviewMode: boolean;
  reduced: boolean;
  paused: boolean;
  onReady: () => void;
  onTravel: (moving: boolean) => void;
  onSettle: (settled: boolean) => void;
};
function CameraRig({ chapter, reset, overviewMode, reduced, onTravel, onSettle }: WorldProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const flight = useRef<{
    start: THREE.Vector3; look: THREE.Vector3; end: THREE.Vector3;
    target: THREE.Vector3; elapsed: number; duration: number; altitude: number;
    finale: boolean;
  } | null>(null);
  useEffect(() => {
    if (!controls.current) return;
    onSettle(false);
    const finale = chapter === 6 && !overviewMode;
    const view = overviewMode ? overview : finale && !reduced ? finaleCloseup : chapters[chapter];
    const end = new THREE.Vector3(...view.camera);
    const target = new THREE.Vector3(...view.target);
    const distance = camera.position.distanceTo(end);
    if (reduced || (distance < 0.05 && !finale)) {
      camera.position.copy(end);
      controls.current.target.copy(target);
      controls.current.update();
      flight.current = null;
      onTravel(false);
      onSettle(finale);
      return;
    }
    // Lift above every roof before crossing the lake, then approach the viewpoint.
    flight.current = {
      start: camera.position.clone(), look: controls.current.target.clone(),
      end, target, elapsed: 0, duration: Math.min(6.5, 3 + distance / 35),
      altitude: Math.max(64, camera.position.y, end.y) + 6,
      finale,
    };
    onTravel(true);
  }, [chapter, reset, overviewMode, reduced, camera, onTravel, onSettle]);
  useFrame((_, delta) => {
    const f = flight.current, orbit = controls.current;
    if (!f || !orbit) return;
    f.elapsed += Math.min(delta, 0.05);
    const ease = (v: number) => v * v * v * (v * (v * 6 - 15) + 10);
    // After arriving at the person, hold briefly and reveal the lake in one slow pullback.
    if (f.finale && f.elapsed >= f.duration) {
      const reveal = ease(THREE.MathUtils.clamp((f.elapsed - f.duration - 1.6) / 9, 0, 1));
      camera.position.lerpVectors(f.end, new THREE.Vector3(...chapters[6].camera), reveal);
      orbit.target.lerpVectors(f.target, new THREE.Vector3(...chapters[6].target), reveal);
      orbit.update();
      if (reveal === 1) {
        flight.current = null;
        onTravel(false);
        onSettle(true);
      }
      return;
    }
    const t = Math.min(1, f.elapsed / f.duration);
    if (t < 0.25) {
      camera.position.copy(f.start);
      camera.position.y = THREE.MathUtils.lerp(f.start.y, f.altitude, ease(t / 0.25));
    } else if (t < 0.75) {
      camera.position.lerpVectors(f.start, f.end, ease((t - 0.25) / 0.5));
      camera.position.y = f.altitude;
    } else {
      camera.position.copy(f.end);
      camera.position.y = THREE.MathUtils.lerp(f.altitude, f.end.y, ease((t - 0.75) / 0.25));
    }
    orbit.target.lerpVectors(f.look, f.target, ease(t));
    orbit.update();
    if (t === 1) {
      flight.current = null;
      onTravel(false);
    }
  });
  return <OrbitControls ref={controls} makeDefault enablePan={false}
    enableDamping={false} minDistance={12} maxDistance={260}
    minPolarAngle={0.08} maxPolarAngle={1.48}
    onStart={() => { flight.current = null; onTravel(false); onSettle(false); }} />;
}
function Scene(props: WorldProps) {
  const { reduced, paused, onReady } = props;
  const still = reduced || paused;
  useEffect(() => { onReady(); }, [onReady]);
  return (
    <>
      <SoftShadows size={12} samples={8} />
      <fog attach="fog" args={["#15343d", 100, 330]} />
      <ambientLight intensity={0.7} color="#aac7d1" />
      <hemisphereLight args={["#d6e5d7", "#173c41", 1.35]} />
      <directionalLight position={[0, 100, -80]} intensity={3.3} color="#d5e4df"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100} shadow-camera-right={100}
        shadow-camera-top={100} shadow-camera-bottom={-100}
        shadow-camera-far={300} shadow-normalBias={0.06} />
      <directionalLight position={[15, 40, 70]} intensity={1.3} color="#7aa7b1" />
      <Stars radius={240} depth={60} count={850} factor={1.4}
        saturation={0} fade speed={still ? 0 : 0.12} />
      <Moon />
      <Water reduced={still} />
      <Landscape />
      <Clouds reduced={still} />
      {locations.map((position, kind) => (
        <group key={kind} position={position} name={`landmark-${kind}`}>
          <Landmark kind={kind} />
          {kind !== 6 && <Lantern position={kind === 1 ? [0, 8, 1] : [4, 1, 4]} />}
          {kind === 2 && <Dancer reduced={still} />}
          {(kind === 0 || kind === 4) && <Boat reduced={still} />}
        </group>
      ))}
      <FinaleDetails reduced={still} />
      <Sparkles count={100} scale={[120, 8, 110]} position={[0, 3, -15]}
        size={1.8} speed={still ? 0 : 0.2} color="#d7d6a0" />
      <CameraRig {...props} />
    </>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Fallback({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return (
    <div className="webgl-fallback">
      此设备暂不支持 3D 景观，你仍可打开全词阅读。
    </div>
  );
}
export default function World(props: WorldProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="world"
      aria-label={`${props.overviewMode ? "山河全境" : chapters[props.chapter].title}，同一片可游览的三维月夜山河`}
    >
      {!failed && (
        <SceneBoundary
          onError={() => {
            setFailed(true);
            props.onReady();
          }}
        >
          <Canvas
            shadows
            dpr={[1, 1.7]}
            camera={{
              position: chapters[0].camera,
              fov: 43,
              near: 0.1,
              far: 700,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.domElement.addEventListener(
                "webglcontextlost",
                () => {
                  setFailed(true);
                  props.onReady();
                },
                { once: true },
              );
            }}
            fallback={<Fallback onReady={props.onReady} />}
          >
            <Scene {...props} />
          </Canvas>
        </SceneBoundary>
      )}
      {failed && (
        <div className="webgl-fallback">
          月色暂未抵达
          <br />
          <small>3D 显示不可用，请尝试重新载入。你仍可打开全词阅读。</small>
        </div>
      )}
    </div>
  );
}
