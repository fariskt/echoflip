'use client';

import React, { useMemo } from 'react';

export const ForestBackground: React.FC = () => {
  // Generate low-poly mountain ring on horizon
  const mountains = useMemo(() => {
    const items = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 110 + (i % 3) * 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 18 + ((i * 7) % 22);
      const width = 25 + ((i * 11) % 20);
      items.push({ id: i, x, z, height, width, rotation: angle });
    }
    return items;
  }, []);

  // Generate outer rocks & boulders on grass field
  const rocks = useMemo(() => {
    const items = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.1;
      const radius = 34 + (i % 5) * 6;
      // Exclude driveway front
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (Math.abs(x) < 8 && z > 25) continue;
      const scale = 0.8 + (i % 4) * 0.4;
      const rotY = (i * 45) % 360;
      items.push({ id: i, x, z, scale, rotY });
    }
    return items;
  }, []);

  // Generate low hedge bushes along outer perimeter line
  const bushes = useMemo(() => {
    const items = [];
    const step = 4;
    // Fence perimeter at +/- 31m
    for (let x = -30; x <= 30; x += step) {
      items.push({ id: `bush_n_${x}`, x, z: -31.5, scale: 0.7 + (Math.abs(x) % 3) * 0.15 });
      if (Math.abs(x) > 6) {
        items.push({ id: `bush_s_${x}`, x, z: 31.5, scale: 0.7 + (Math.abs(x) % 3) * 0.15 });
      }
    }
    for (let z = -30; z <= 30; z += step) {
      items.push({ id: `bush_w_${z}`, x: -31.5, z, scale: 0.7 + (Math.abs(z) % 3) * 0.15 });
      items.push({ id: `bush_e_${z}`, x: 31.5, z, scale: 0.7 + (Math.abs(z) % 3) * 0.15 });
    }
    return items;
  }, []);

  // Perimeter solar street lamp lights
  const streetLamps = [
    { x: -31, z: -31 },
    { x: 31, z: -31 },
    { x: -31, z: 31 },
    { x: 31, z: 31 },
    { x: -15, z: 31 },
    { x: 15, z: 31 },
    { x: -31, z: 0 },
    { x: 31, z: 0 },
  ];

  // Procedural 3D clouds
  const clouds = useMemo(() => {
    const items = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 60 + (i % 4) * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 35 + (i % 3) * 8;
      const scale = 2.5 + (i % 3) * 1.2;
      items.push({ id: i, x, y, z, scale });
    }
    return items;
  }, []);

  return (
    <group>
      {/* 1. Surrounding Outdoor Grass Field */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[350, 350]} />
        <meshStandardMaterial color="#406b35" roughness={0.9} />
      </mesh>

      {/* 2. Access Driveway / Asphalt Road leading to base entrance */}
      <mesh position={[0, -0.02, 55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Driveway Yellow Center Dashed Lines */}
      {[-15, -5, 5, 15, 25].map((offsetZ, idx) => (
        <mesh key={idx} position={[0, -0.01, 45 + offsetZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 4]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      ))}

      {/* 3. Horizon Low-Poly Mountain Range */}
      {mountains.map((m) => (
        <mesh
          key={m.id}
          position={[m.x, m.height / 2 - 2, m.z]}
          rotation={[0, m.rotation, 0]}
        >
          <coneGeometry args={[m.width, m.height, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* 4. Natural Rocks & Boulders Outside Base */}
      {rocks.map((r) => (
        <mesh
          key={r.id}
          position={[r.x, r.scale * 0.4, r.z]}
          rotation={[0.2, (r.rotY * Math.PI) / 180, 0.1]}
          scale={[r.scale, r.scale * 0.7, r.scale * 1.1]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} flatShading />
        </mesh>
      ))}

      {/* 5. Perimeter Bushes / Low Hedges */}
      {bushes.map((b) => (
        <mesh
          key={b.id}
          position={[b.x, b.scale * 0.5, b.z]}
          scale={[b.scale, b.scale * 0.8, b.scale]}
          castShadow
        >
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.8} flatShading />
        </mesh>
      ))}

      {/* 6. Modern Outdoor Solar Street Lamps */}
      {streetLamps.map((lamp, idx) => (
        <group key={idx} position={[lamp.x, 0, lamp.z]}>
          {/* Post */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Lamp Head */}
          <mesh position={[0, 3.7, 0]} castShadow>
            <boxGeometry args={[0.4, 0.2, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Emissive Fixture Bulb */}
          <mesh position={[0, 3.55, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* 7. Floating Sky Clouds */}
      {clouds.map((c) => (
        <group key={c.id} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.5, c.scale]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3, 7, 7]} />
            <meshStandardMaterial color="#ffffff" roughness={1.0} transparent opacity={0.85} flatShading />
          </mesh>
          <mesh position={[2, 0.5, 1]}>
            <sphereGeometry args={[2.2, 6, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={1.0} transparent opacity={0.85} flatShading />
          </mesh>
          <mesh position={[-2, -0.2, -1]}>
            <sphereGeometry args={[2.5, 6, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={1.0} transparent opacity={0.85} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};
