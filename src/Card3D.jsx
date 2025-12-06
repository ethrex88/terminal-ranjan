import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import photoUrl from './assets/photo.jpg';

function CardModel({ mousePosition, isDragging, dragVelocity }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const hasInitialized = useRef(false);
  const entranceRef = useRef({ active: true, time: 0 });
  const scanRef = useRef(null);
  const scanSpotGroupRef = useRef(null);
  const [scanSpotTexture, setScanSpotTexture] = useState(null);
  
  // Physics state for pendulum motion
  const velocityRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef({ x: 0, y: 0 });
  const cycleTimerRef = useRef(null);
  const animRef = useRef({ active: false, type: 'sway', t: 0, duration: 0, amp: 0 });
  const animIndexRef = useRef(0);

  // Load texture
  const profileTexture = useTexture(photoUrl);
  profileTexture.colorSpace = THREE.SRGBColorSpace;

  // Clone photo texture for scan spot so we can pan/zoom its UVs
  useEffect(() => {
    if (profileTexture) {
      const t = profileTexture.clone();
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      setScanSpotTexture(t);
    }
  }, [profileTexture]);
  // Cycle three distinct animations every 5 seconds: sway, twist, bounce
  useEffect(() => {
    function startNext() {
      if (isDragging || !groupRef.current) return;
      const types = ['sway', 'twist', 'bounce'];
      const type = types[animIndexRef.current % types.length];
      animIndexRef.current += 1;
      switch (type) {
        case 'sway':
          animRef.current = { active: true, type, t: 0, duration: 2.2, amp: 5.1 };
          break;
        case 'twist':
          animRef.current = { active: true, type, t: 0, duration: 1.8, amp: 5.1 };
          break;
        case 'bounce':
          animRef.current = { active: true, type, t: 0, duration: 2.0, amp: 5.1 };
          break;
        default:
          break;
      }
    }
    cycleTimerRef.current = setInterval(startNext, 5000);
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [isDragging]);

  // Elastic/rubber band physics - card hangs from fixed point and bounces back
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Face scan band animation across the photo
      if (scanRef.current) {
        const scanHeight = 3.3; // matches photo height
        const topY = -0.15 + scanHeight / 2;
        const bottomY = -0.15 - scanHeight / 2;
        const period = 2.6; // seconds per sweep
        const t = (state.clock.elapsedTime % period) / period; // 0..1
        const y = topY - t * (topY - bottomY);
        scanRef.current.position.y = y;
        const baseOpacity = 0.12;
        const pulse = 0.10 * Math.abs(Math.sin(t * Math.PI * 2));
        if (scanRef.current.material) {
          scanRef.current.material.opacity = baseOpacity + pulse;
        }
      }

      // Circular scan spot with magnified area
      if (scanSpotGroupRef.current && scanSpotTexture) {
        const W = 2.7; // photo width
        const H = 3.3; // photo height
        const cx = 0;  // photo center x
        const cy = -0.15; // photo center y
        const radiusX = W/2 - 0.4; // keep inside bounds
        const radiusY = H/2 - 0.4;
        const t = state.clock.elapsedTime * 0.4; // speed
        const x = cx + Math.sin(t) * radiusX;
        const y = cy + Math.cos(t * 0.9) * radiusY;
        scanSpotGroupRef.current.position.x = x;
        scanSpotGroupRef.current.position.y = y;

        // UV mapping for magnified region
        const u = (x - (cx - W/2)) / W; // normalize into [0,1]
        const v = (y - (cy - H/2)) / H;
        const zoom = 2.0; // magnification factor
        const rep = 1 / zoom;
        scanSpotTexture.repeat.set(rep, rep);
        scanSpotTexture.offset.set(u - rep / 2, v - rep / 2);
      }

      // (magnifying glass removed)
      // Entrance: drop from top with hanging sway, then hand over to physics
      if (entranceRef.current.active) {
        entranceRef.current.time += delta;
        const t = entranceRef.current.time;
        const restY = 0.2;
        const initialY = 6.0;
        const damping = 1.6; // decay rate
        const omega = 6.0;   // oscillation frequency

        const decay = Math.exp(-damping * t);
        const offsetY = (initialY - restY) * decay * Math.cos(omega * t);
        const swayX = 0.6 * decay * Math.sin(omega * 0.8 * t);

        groupRef.current.position.x = swayX;
        groupRef.current.position.y = restY + offsetY;
        groupRef.current.position.z = 0;
        groupRef.current.rotation.z = swayX * 0.18;
        groupRef.current.rotation.x = -Math.abs(swayX) * 0.08;

        if (t > 3.2) {
          entranceRef.current.active = false;
          // settle near rest and mark initialized
          groupRef.current.position.set(0, restY, 0);
          groupRef.current.rotation.set(0, 0, 0);
          hasInitialized.current = true;
        }
        return; // skip normal physics during entrance
      }
      // Give initial gentle bounce on load (fallback, if entrance skipped)
      if (!hasInitialized.current && state.clock.elapsedTime > 0.5) {
        velocityRef.current.x = 1.5;
        velocityRef.current.y = -0.5;
        hasInitialized.current = true;
      }
      
              // Lanyard/rubber band properties
        const restPosition = { x: 0, y: 0.2, z: 0 }; // Center position where card naturally hangs
        const springStiffness = 3.5; // How strong the "rubber band" pulls back
        const damping = 0.96; // Air resistance - lower = settles faster
      
      if (isDragging) {
        // When dragging, move card to mouse position
        const targetX = mousePosition.x * 1.5;
        const targetY = mousePosition.y * 1.2;
        const targetZ = mousePosition.x * 0.5; // Slight depth based on horizontal movement
        
        // Set position directly while dragging
        groupRef.current.position.x = targetX;
        groupRef.current.position.y = targetY;
        groupRef.current.position.z = targetZ;
        
        // Calculate rotation based on position (card tilts in direction of pull)
        groupRef.current.rotation.y = targetX * 0.4;
        groupRef.current.rotation.x = -targetY * 0.3;
        groupRef.current.rotation.z = targetX * 0.15;
        
        // Store current angles
        angleRef.current.x = -targetY * 0.3;
        angleRef.current.y = targetX * 0.4;
        
        // Capture velocity for motion after release
        velocityRef.current.x = dragVelocity.x * 4;
        velocityRef.current.y = dragVelocity.y * 4;
      } else {
        // Elastic spring physics when released
        const currentPos = groupRef.current.position;
        
        // Calculate spring force (Hooke's Law: F = -kx)
        // Force pulls card back toward rest position
        const springForceX = -(currentPos.x - restPosition.x) * springStiffness;
        const springForceY = -(currentPos.y - restPosition.y) * springStiffness;
        const springForceZ = -(currentPos.z - restPosition.z) * springStiffness;
        
        // Add some gravity
        const gravity = 1.5;

        // Active animation overlay
        if (animRef.current.active) {
          const a = animRef.current;
          a.t += delta;
          const decay = Math.exp(-1.2 * a.t);
          if (a.type === 'sway') {
            const s = Math.sin(a.t * 4.2) * a.amp * decay;
            velocityRef.current.x += s * 0.9 * delta * 10;
            groupRef.current.rotation.z += s * 0.05 * delta * 10;
          } else if (a.type === 'twist') {
            const s = Math.sin(a.t * 5.0) * a.amp * decay;
            groupRef.current.rotation.y += s * 0.09 * delta * 10;
            groupRef.current.rotation.x += -Math.abs(s) * 0.035 * delta * 10;
            velocityRef.current.z += s * 0.35 * delta * 10;
          } else if (a.type === 'bounce') {
            const s = Math.sin(a.t * 5.0) * a.amp * decay;
            velocityRef.current.y += Math.abs(s) * 1.2 * delta * 16;
          }
          if (a.t > a.duration) {
            a.active = false;
          }
        }
        
        // Update velocity with spring forces
        velocityRef.current.x += springForceX * delta * 10;
        velocityRef.current.y += (springForceY - gravity) * delta * 10;
        velocityRef.current.x += springForceZ * delta * 5;
        
        // Apply damping (air resistance)
        velocityRef.current.x *= damping;
        velocityRef.current.y *= damping;
        
        // Update position based on velocity
        groupRef.current.position.x += velocityRef.current.x * delta;
        groupRef.current.position.y += velocityRef.current.y * delta;
        groupRef.current.position.z += velocityRef.current.x * delta * 0.3;
        
        // Calculate rotation based on current position and velocity
        const tiltX = -groupRef.current.position.y * 0.3 - velocityRef.current.y * 0.1;
        const tiltY = groupRef.current.position.x * 0.4 + velocityRef.current.x * 0.1;
        const tiltZ = groupRef.current.position.x * 0.15;
        
        // Smooth rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tiltY, 0.1);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, 0.1);
        
        // Store angles
        angleRef.current.x = groupRef.current.rotation.x;
        angleRef.current.y = groupRef.current.rotation.y;
      }
    }
  });

  // Calculate lanyard position and rotation to connect pivot point to card
  const pivotPoint = { x: 0, y: 3.0, z: 0 }; // Fixed point at top where lanyard is hooked
  const cardPos = groupRef.current ? {
    x: groupRef.current.position.x,
    y: groupRef.current.position.y - 0.4, // Connect to hole at top of card
    z: groupRef.current.position.z
  } : { x: 0, y: -0.4, z: 0 };
  
  // Calculate lanyard vector
  const lanyardVector = {
    x: cardPos.x - pivotPoint.x,
    y: cardPos.y - pivotPoint.y,
    z: cardPos.z - pivotPoint.z
  };
  
  const lanyardLength = Math.sqrt(
    lanyardVector.x ** 2 + 
    lanyardVector.y ** 2 + 
    lanyardVector.z ** 2
  ) || 2;
  
  // Lanyard midpoint
  const lanyardMidpoint = {
    x: (pivotPoint.x + cardPos.x) / 2,
    y: (pivotPoint.y + cardPos.y) / 2,
    z: (pivotPoint.z + cardPos.z) / 2
  };

  return (
    <>
      {/* Chain links going up - segmented realistic chain */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i}>
          {/* Vertical link */}
          <mesh position={[0, 4.3 - i * 0.25, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.07, 0.018, 8, 16]} />
            <meshStandardMaterial 
              color="#555555"
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>
          {/* Horizontal link */}
          {i < 6 && (
            <mesh position={[0, 4.175 - i * 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.07, 0.018, 8, 16]} />
              <meshStandardMaterial 
                color="#555555"
                roughness={0.3}
                metalness={0.9}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Main hook/ring where card hangs from */}
      <mesh position={[pivotPoint.x, pivotPoint.y, pivotPoint.z]}>
        <torusGeometry args={[0.18, 0.04, 16, 32]} />
        <meshStandardMaterial 
          color="#4a4a4a"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Small metal connector/clasp */}
      <mesh position={[pivotPoint.x, pivotPoint.y - 0.25, pivotPoint.z]}>
        <cylinderGeometry args={[0.035, 0.035, 0.25, 16]} />
        <meshStandardMaterial 
          color="#3a3a3a"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Lanyard/Ribbon connecting to card - black strap */}
      <mesh 
        position={[lanyardMidpoint.x, lanyardMidpoint.y, lanyardMidpoint.z]}
        rotation={[
          Math.atan2(lanyardVector.z, lanyardVector.y) - Math.PI / 2,
          0,
          Math.atan2(lanyardVector.x, lanyardVector.y)
        ]}
        castShadow
      >
        <cylinderGeometry args={[0.03, 0.03, lanyardLength, 16]} />
        <meshStandardMaterial 
          color="#0d0d0d" 
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>

      {/* Card group that swings */}
      <group 
        ref={groupRef} 
        position={[0, 0, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >

      {/* Card base with wood texture effect and rounded corners */}
      <RoundedBox args={[3.2, 4.5, 0.08]} radius={0.15} smoothness={8} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#0f0f0f"
          roughness={0.85}
          metalness={0.05}
        >
          <primitive attach="map" object={createWoodTexture()} />
        </meshStandardMaterial>
      </RoundedBox>

      {/* Card border/frame effect - gray outline */}
      <RoundedBox args={[3.15, 4.45, 0.001]} radius={0.145} smoothness={8} position={[0, 0, 0.041]}>
        <meshStandardMaterial 
          color="#888888"
          roughness={0.5}
          metalness={0.3}
        />
      </RoundedBox>

      {/* Profile photo plane - bright black and white */}
      <mesh position={[0, -0.15, 0.045]}>
        <planeGeometry args={[2.7, 3.3]} />
        <meshBasicMaterial 
          map={profileTexture}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>

      {/* Light green filter overlay on photo */}
      <mesh position={[0, -0.15, 0.051]}>
        <planeGeometry args={[2.7, 3.3]} />
        <meshBasicMaterial 
          color="#00ff66"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Face scan line overlay (animated in useFrame) */}
      <mesh ref={scanRef} position={[0, 0, 0.052]}>
        <planeGeometry args={[2.7, 0.12]} />
        <meshBasicMaterial 
          color="#00ff66"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Circular scan spot with magnified texture */}
      {scanSpotTexture && (
        <group ref={scanSpotGroupRef} position={[0, -0.15, 0.053]}>
          {/* main lens area using photo texture (zoomed via UVs) */}
          <mesh>
            <circleGeometry args={[0.5, 48]} />
            <meshBasicMaterial map={scanSpotTexture} color="#b6ffd6" transparent opacity={0.95} />
          </mesh>
          {/* edge glow */}
          <mesh position={[0, 0, -0.001]}>
            <ringGeometry args={[0.5, 0.62, 48]} />
            <meshBasicMaterial color="#00ff66" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* crosshair */}
          <mesh position={[0, 0, 0.001]}>
            <ringGeometry args={[0.06, 0.07, 32]} />
            <meshBasicMaterial color="#00ff66" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[0.02, 0.6]} />
            <meshBasicMaterial color="#00ff66" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0, 0.001]} rotation={[0,0,Math.PI/2]}>
            <planeGeometry args={[0.02, 0.6]} />
            <meshBasicMaterial color="#00ff66" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      )}

      {/* (magnifying glass removed) */}

      {/* Hole at top of card where lanyard connects - positioned higher */}
      <mesh position={[0, 2.15, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.03, 16, 32]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.6}
        />
      </mesh>
      
      {/* Inner dark circle of hole */}
      <mesh position={[0, 2.15, 0.05]}>
        <circleGeometry args={[0.095, 32]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Logo background square in corner */}
      <RoundedBox args={[0.55, 0.55, 0.02]} radius={0.06} smoothness={4} position={[-1.25, 1.8, 0.05]}>
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Logo text */}
      <Text
        position={[-1.25, 1.8, 0.07]}
        fontSize={0.32}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        RK
      </Text>

      {/* Text label - "ranjankumar" */}
      <Text
        position={[0.65, 1.8, 0.055]}
        fontSize={0.2}
        color="#cccccc"
        anchorX="left"
        anchorY="middle"
        italic
      >
        ranjankumar
      </Text>

      {/* Name on card - below photo */}
      <Text
        position={[0, -1.8, 0.055]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.08}
      >
        RANJAN KUMAR
      </Text>

      {/* Title/Role below name */}
      <Text
        position={[0, -2.1, 0.055]}
        fontSize={0.18}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Software Engineer
      </Text>

      {/* Subtle shine/reflection plane */}
      {hovered && (
        <mesh position={[0, 0, 0.046]} rotation={[0, 0, 0]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial 
            color="#00ff66"
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      </group>
    </>
  );
}

// Helper function to create a procedural wood-like texture (black and white)
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Very dark base (pure black)
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, 512, 512);
  
  // Add subtle vertical wood grain lines (grayscale)
  for (let i = 0; i < 512; i += 3) {
    const brightness = Math.random() * 5 + 1;
    const alpha = brightness / 255;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
    ctx.fillRect(i, 0, 1, 512);
  }
  
  // Add some horizontal variations for realism (grayscale)
  for (let j = 0; j < 512; j += 25) {
    const opacity = Math.random() * 0.015;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(0, j, 512, 1);
  }
  
  // Add some random noise for texture depth
  for (let n = 0; n < 200; n++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 2 + 1;
    const opacity = Math.random() * 0.01;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(x, y, size, size);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function Card3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragVelocity, setDragVelocity] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(Date.now());
  const containerRef = useRef(null);

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Calculate velocity
    const now = Date.now();
    const dt = (now - lastMoveTime.current) / 1000;
    if (dt > 0) {
      const vx = (x - lastMousePos.current.x) / dt;
      const vy = (y - lastMousePos.current.y) / dt;
      setDragVelocity({ x: vx, y: vy });
    }
    
    lastMousePos.current = { x, y };
    lastMoveTime.current = now;
    setMousePosition({ x, y });
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Calculate responsive card scale
  const cardScale = containerSize.width < 768 ? 0.7 : containerSize.width < 1200 ? 0.85 : 1;

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas 
        camera={{ position: [0, 0.2, 10 / cardScale], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Transparent background - parent handles black */}
        
        {/* Bright ambient lighting for photo visibility */}
        <ambientLight intensity={0.6} />
        
        {/* Main spotlight highlighting the card */}
        <spotLight 
          position={[0, 5, 6]} 
          intensity={3.5}
          angle={0.5}
          penumbra={0.8}
          distance={15}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          target-position={[0, 0, 0]}
        />
        
        {/* Additional front light for photo brightness */}
        <pointLight 
          position={[0, 0, 8]} 
          intensity={1.5}
          color="#ffffff"
        />
        
        {/* Secondary spotlight from side */}
        <spotLight 
          position={[5, 4, 5]} 
          intensity={0.6}
          angle={0.4}
          penumbra={1}
          color="#ffffff"
        />
        
        {/* Directional fill light */}
        <directionalLight 
          position={[-4, 3, 6]} 
          intensity={0.3}
          castShadow
        />
        
        {/* Rim light for depth */}
        <pointLight position={[0, -2, -2]} intensity={0.25} color="#cccccc" />
        
        {/* Subtle accent light from bottom */}
        <pointLight position={[0, -5, 3]} intensity={0.15} color="#aaaaaa" />

        {/* 3D Card */}
        <Suspense fallback={null}>
          <CardModel 
            mousePosition={mousePosition} 
            isDragging={isDragging}
            dragVelocity={dragVelocity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 
