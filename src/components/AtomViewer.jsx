import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Proton/Neutron component for a more accurate nucleus
const NucleusParticle = ({ position, color, isProton }) => {
  const ref = useRef();
  
  // Create a subtle wobble effect for the particle
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime() * 0.5;
      const wobble = Math.sin(time + position[0] * 5) * 0.05;
      ref.current.position.x = position[0] + wobble;
      ref.current.position.y = position[1] + Math.sin(time + position[1] * 5) * 0.05;
      ref.current.position.z = position[2] + Math.cos(time + position[2] * 5) * 0.05;
    }
  });
  
  return (
    <Sphere ref={ref} args={[0.8, 24, 24]} position={position}>
      <meshStandardMaterial 
        color={isProton ? color : '#3388ff'} 
        emissive={isProton ? color : '#3388ff'} 
        emissiveIntensity={0.3}
        roughness={0.3} 
        metalness={0.7}
      />
    </Sphere>
  );
};

// Improved nucleus component with protons and neutrons
const Nucleus = ({ element, color }) => {
  const groupRef = useRef();
  
  // Create a rotation effect for the nucleus group
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.001;
    }
  });
  
  // Generate positions for protons and neutrons in a clustered arrangement
  const particlePositions = useMemo(() => {
    const positions = [];
    const protonCount = element.number;
    const neutronCount = Math.round(element.atomic_mass) - protonCount;
    const totalParticles = protonCount + neutronCount;
    
    // Simple algorithm to distribute particles in a clustered sphere
    // For very large atoms, we'll reduce the actual count for performance
    const maxVisibleParticles = Math.min(totalParticles, 50);
    const particleRatio = totalParticles / maxVisibleParticles;
    
    const visibleProtons = Math.ceil(protonCount / particleRatio);
    const visibleNeutrons = Math.ceil(neutronCount / particleRatio);
    
    // Create a spherical distribution of particles
    for (let i = 0; i < visibleProtons + visibleNeutrons; i++) {
      // Use golden ratio spiral for even distribution
      const phi = Math.acos(1 - 2 * (i / (visibleProtons + visibleNeutrons)));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      // Calculate radius with some randomness for a more natural look
      const radius = 2.5 * Math.cbrt(Math.random() * 0.5 + 0.5);
      
      positions.push({
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ],
        isProton: i < visibleProtons
      });
    }
    return positions;
  }, [element.number, element.atomic_mass]);

  return (
    <group ref={groupRef}>
      {/* Create individual protons and neutrons */}
      {particlePositions.map((particle, index) => (
        <NucleusParticle 
          key={index}
          position={particle.position}
          color={color}
          isProton={particle.isProton}
        />
      ))}
    </group>
  );
};

// Enhanced electron orbital path
const ElectronOrbit = ({ distance, color, rotation = [0, 0, 0], shellNumber, subshell }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      // Create different shapes for s, p, d, f orbitals
      let curve;
      
      // Different orbital types based on scientific models
      switch(subshell) {
        case 'p':
          // p orbital has a dumbbell shape
          const pPoints = [];
          for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = 2 * Math.PI * t;
            const scale = Math.sin(angle) * 0.5 + 0.5; // Makes it dumbbell shaped
            pPoints.push(
              new THREE.Vector3(
                Math.cos(angle) * distance * (0.7 + scale * 0.3),
                0,
                Math.sin(angle) * distance * (0.7 + scale * 0.3)
              )
            );
          }
          const pCurve = new THREE.CatmullRomCurve3(pPoints);
          curve = pCurve;
          break;
          
        case 'd':
          // d orbital has a more complex shape
          const dPoints = [];
          for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = 2 * Math.PI * t;
            const wavePattern = Math.sin(4 * angle) * 0.2 + 0.8;
            dPoints.push(
              new THREE.Vector3(
                Math.cos(angle) * distance * wavePattern,
                0,
                Math.sin(angle) * distance * wavePattern
              )
            );
          }
          const dCurve = new THREE.CatmullRomCurve3(dPoints);
          curve = dCurve;
          break;
          
        case 'f':
          // f orbital has an even more complex shape
          const fPoints = [];
          for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = 2 * Math.PI * t;
            const wavePattern = Math.sin(6 * angle) * 0.15 + Math.cos(3 * angle) * 0.15 + 0.7;
            fPoints.push(
              new THREE.Vector3(
                Math.cos(angle) * distance * wavePattern,
                0,
                Math.sin(angle) * distance * wavePattern
              )
            );
          }
          const fCurve = new THREE.CatmullRomCurve3(fPoints);
          curve = fCurve;
          break;
          
        case 's':
        default:
          // s orbital is spherical (circular in 2D view)
          const ellipse = new THREE.EllipseCurve(
            0, 0,            // Center x, y
            distance, distance, // xRadius, yRadius
            0, 2 * Math.PI,  // startAngle, endAngle
            false,           // clockwise
            0                // rotation
          );
          const points = ellipse.getPoints(100);
          const positions = points.map(p => new THREE.Vector3(p.x, 0, p.y));
          curve = new THREE.CatmullRomCurve3(positions);
      }
      
      // Create orbital path
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.3
      });
      const ellipse = new THREE.Line(geometry, material);
      ref.current.add(ellipse);
    }
  }, [distance, color, subshell]);
  
  return <group ref={ref} rotation={rotation} />;
};

// Scientifically determine subshell based on electron configuration
const getSubshellType = (shellNumber, electronIndex) => {
  // In each shell, electrons fill in this order: s, p, d, f
  // s: 2 electrons, p: 6 electrons, d: 10 electrons, f: 14 electrons
  if (electronIndex < 2) return 's';
  if (electronIndex < 8) return 'p';
  if (electronIndex < 18) return 'd';
  return 'f';
};

// Enhanced electron with trail effect
const Electron = ({ distance, speed, offset, color, shellNumber, electronIndex, subshell }) => {
  const ref = useRef();
  const trailRef = useRef();
  const initialAngle = offset * Math.PI * 2;
  
  // Create electron orbits with proper rotation based on quantum mechanics
  const orbitRotation = useMemo(() => {
    // Different rotation patterns based on orbital type
    switch(subshell) {
      case 'p':
        return [
          (Math.PI / 2) + ((offset * 2) * Math.PI / 4),
          ((shellNumber + offset) * Math.PI / 3),
          ((offset * 1.5) * Math.PI / 4)
        ];
      case 'd':
        return [
          (Math.PI / 3) + ((offset * 3) * Math.PI / 5),
          ((shellNumber + offset * 0.7) * Math.PI / 4),
          ((offset * 2) * Math.PI / 5)
        ];
      case 'f':
        return [
          (Math.PI / 4) + ((offset * 3.5) * Math.PI / 6),
          ((shellNumber + offset * 0.5) * Math.PI / 5),
          ((offset * 2.5) * Math.PI / 6)
        ];
      case 's':
      default:
        return [
          (Math.PI / 2) + ((shellNumber % 3) * Math.PI / 4), 
          ((shellNumber + offset) * Math.PI / 3),
          ((offset) * Math.PI / 4)
        ];
    }
  }, [shellNumber, offset, subshell]);
  
  // Electron trail effect
  useEffect(() => {
    if (trailRef.current) {
      for (let i = 0; i < 8; i++) {
        const trailOpacity = 0.6 - (i * 0.07);
        const trailSize = 0.25 - (i * 0.02);
        if (trailOpacity > 0) {
          const trailSphere = new THREE.Mesh(
            new THREE.SphereGeometry(trailSize, 16, 16),
            new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: trailOpacity
            })
          );
          trailRef.current.add(trailSphere);
        }
      }
    }
  }, [color]);
  
  // Animate electron with trails along orbital path
  useFrame(({ clock }) => {
    if (ref.current && trailRef.current) {
      const time = clock.getElapsedTime();
      const angle = initialAngle + time * speed;
      
      // Calculate position based on orbital type
      let x, z;
      switch(subshell) {
        case 'p':
          // Dumbbell-shaped motion for p orbitals
          const pScale = Math.sin(angle) * 0.5 + 0.5;
          x = Math.cos(angle) * distance * (0.7 + pScale * 0.3);
          z = Math.sin(angle) * distance * (0.7 + pScale * 0.3);
          break;
        case 'd':
          // Complex motion for d orbitals
          const dWave = Math.sin(4 * angle) * 0.2 + 0.8;
          x = Math.cos(angle) * distance * dWave;
          z = Math.sin(angle) * distance * dWave;
          break;
        case 'f':
          // Even more complex motion for f orbitals
          const fWave = Math.sin(6 * angle) * 0.15 + Math.cos(3 * angle) * 0.15 + 0.7;
          x = Math.cos(angle) * distance * fWave;
          z = Math.sin(angle) * distance * fWave;
          break;
        case 's':
        default:
          // Simple circular motion for s orbitals
          x = Math.cos(angle) * distance;
          z = Math.sin(angle) * distance;
      }
      
      // Apply orbital rotation to the position
      const rotatedPosition = new THREE.Vector3(x, 0, z);
      rotatedPosition.applyEuler(new THREE.Euler(...orbitRotation));
      
      ref.current.position.copy(rotatedPosition);
      
      // Update trail positions with delay effect
      for (let i = 0; i < trailRef.current.children.length; i++) {
        const trailDelay = (i + 1) * 0.07;
        const trailAngle = angle - trailDelay;
        
        // Calculate trail position based on orbital type
        let trailX, trailZ;
        switch(subshell) {
          case 'p':
            const pTrailScale = Math.sin(trailAngle) * 0.5 + 0.5;
            trailX = Math.cos(trailAngle) * distance * (0.7 + pTrailScale * 0.3);
            trailZ = Math.sin(trailAngle) * distance * (0.7 + pTrailScale * 0.3);
            break;
          case 'd':
            const dTrailWave = Math.sin(4 * trailAngle) * 0.2 + 0.8;
            trailX = Math.cos(trailAngle) * distance * dTrailWave;
            trailZ = Math.sin(trailAngle) * distance * dTrailWave;
            break;
          case 'f':
            const fTrailWave = Math.sin(6 * trailAngle) * 0.15 + Math.cos(3 * trailAngle) * 0.15 + 0.7;
            trailX = Math.cos(trailAngle) * distance * fTrailWave;
            trailZ = Math.sin(trailAngle) * distance * fTrailWave;
            break;
          case 's':
          default:
            trailX = Math.cos(trailAngle) * distance;
            trailZ = Math.sin(trailAngle) * distance;
        }
        
        const trailPosition = new THREE.Vector3(trailX, 0, trailZ);
        trailPosition.applyEuler(new THREE.Euler(...orbitRotation));
        
        trailRef.current.children[i].position.copy(trailPosition);
      }
    }
  });
  
  // Electron size and color based on orbital type
  const electronSize = 0.5 - (shellNumber * 0.05 > 0.2 ? 0.2 : shellNumber * 0.05);
  
  // Adjust color slightly based on subshell
  const electronColor = {
    's': color,
    'p': new THREE.Color(color).offsetHSL(0.1, 0, 0).getStyle(),
    'd': new THREE.Color(color).offsetHSL(0.2, 0, 0).getStyle(),
    'f': new THREE.Color(color).offsetHSL(0.3, 0, 0).getStyle()
  }[subshell];
  
  return (
    <group>
      <ElectronOrbit 
        distance={distance} 
        color={electronColor} 
        rotation={orbitRotation}
        shellNumber={shellNumber}
        subshell={subshell}
      />
      <group ref={trailRef} />
      <Sphere ref={ref} args={[electronSize, 24, 24]} position={[distance, 0, 0]}>
        <meshStandardMaterial 
          color={electronColor} 
          emissive={electronColor} 
          emissiveIntensity={1} 
        />
      </Sphere>
    </group>
  );
};

// Parse electron configuration to get more accurate orbital information
const parseElectronConfiguration = (config) => {
  if (!config) return null;
  
  try {
    const result = [];
    // More precise regex to capture complete electron configuration
    // Example: 1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p6
    const regex = /(\d)([spdf])(\d+)/g;
    let match;
    
    while ((match = regex.exec(config)) !== null) {
      const shellNumber = parseInt(match[1]);
      const subshell = match[2];
      const electronCount = parseInt(match[3]);
      
      result.push({
        shell: shellNumber,
        subshell,
        electrons: electronCount
      });
    }
    
    return result;
  } catch (e) {
    console.error('Error parsing electron configuration', e);
    return null;
  }
};

// ElectronShell component that distributes electrons in shells based on actual electron configuration
const ElectronShells = ({ element }) => {
  // Calculate electron shells based on actual electron configuration
  const orbitals = useMemo(() => {
    // Try to parse the detailed electron configuration for scientific accuracy
    let parsedConfig = element.electron_configuration_semantic ? 
      parseElectronConfiguration(element.electron_configuration_semantic) : null;
    
    // If no semantic configuration is available, try the regular one
    if (!parsedConfig && element.electron_configuration) {
      parsedConfig = parseElectronConfiguration(element.electron_configuration);
    }
    
    // If we successfully parsed the configuration
    if (parsedConfig && parsedConfig.length > 0) {
      // Sort orbitals by energy level (shell, then subshell s->p->d->f)
      return parsedConfig.sort((a, b) => {
        if (a.shell !== b.shell) return a.shell - b.shell;
        
        // Order subshells by energy level: s, p, d, f
        const subshellOrder = { s: 0, p: 1, d: 2, f: 3 };
        return subshellOrder[a.subshell] - subshellOrder[b.subshell];
      });
    }
    
    // Fallback to standard model if parsing fails
    const defaultOrbitals = [];
    let electronCount = element.number;
    
    // Standard orbital filling order following Aufbau principle
    const fillingOrder = [
      { shell: 1, subshell: 's', max: 2 },
      { shell: 2, subshell: 's', max: 2 },
      { shell: 2, subshell: 'p', max: 6 },
      { shell: 3, subshell: 's', max: 2 },
      { shell: 3, subshell: 'p', max: 6 },
      { shell: 4, subshell: 's', max: 2 },
      { shell: 3, subshell: 'd', max: 10 },
      { shell: 4, subshell: 'p', max: 6 },
      { shell: 5, subshell: 's', max: 2 },
      { shell: 4, subshell: 'd', max: 10 },
      { shell: 5, subshell: 'p', max: 6 },
      { shell: 6, subshell: 's', max: 2 },
      { shell: 4, subshell: 'f', max: 14 },
      { shell: 5, subshell: 'd', max: 10 },
      { shell: 6, subshell: 'p', max: 6 },
      { shell: 7, subshell: 's', max: 2 },
      { shell: 5, subshell: 'f', max: 14 },
      { shell: 6, subshell: 'd', max: 10 },
      { shell: 7, subshell: 'p', max: 6 }
    ];
    
    for (const orbital of fillingOrder) {
      if (electronCount <= 0) break;
      
      const electrons = Math.min(orbital.max, electronCount);
      if (electrons > 0) {
        defaultOrbitals.push({
          shell: orbital.shell,
          subshell: orbital.subshell,
          electrons
        });
        
        electronCount -= electrons;
      }
    }
    
    return defaultOrbitals;
  }, [element.number, element.electron_configuration_semantic, element.electron_configuration]);
  
  // Vibrant colors based on element category and electron energy levels
  const electronColors = {
    'alkali-metal': '#ff55ff',
    'alkaline-earth-metal': '#ffaa44',
    'transition-metal': '#ffee22',
    'post-transition-metal': '#55ff55',
    'metalloid': '#55ffff',
    'nonmetal': '#33ff99',
    'noble-gas': '#66ffff',
    'lanthanide': '#ff33ff',
    'actinide': '#ff5599',
    'unknown': '#aaddff',
  };
  
  const category = element.category.replace(/\s+/g, '-').toLowerCase();
  const baseElectronColor = electronColors[category] || '#aaddff';
  
  return (
    <>
      {/* Render electrons according to the exact orbital configuration */}
      {orbitals.map((orbital, orbitalIndex) => {
        // Calculate unique orbital distance based on shell and energy level
        const subshellOffset = { s: 0, p: 0.5, d: 1, f: 1.5 };
        const baseDistance = orbital.shell * 5;
        const orbitalDistance = baseDistance + subshellOffset[orbital.subshell];
        
        // Create distinct color for each orbital type
        const orbitalColor = new THREE.Color(baseElectronColor)
          .offsetHSL(orbitalIndex * 0.02, 0, 0)
          .getStyle();
        
        return (
          <React.Fragment key={`${orbital.shell}${orbital.subshell}`}>
            {Array.from({ length: orbital.electrons }).map((_, i) => (
              <Electron 
                key={`${orbital.shell}${orbital.subshell}-${i}`}
                distance={orbitalDistance}
                speed={0.5 / orbital.shell} // Slower for outer shells
                offset={i / orbital.electrons}
                color={orbitalColor}
                shellNumber={orbital.shell}
                electronIndex={i}
                subshell={orbital.subshell}
              />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

// Main AtomViewer component
const AtomViewer = ({ element }) => {
  if (!element) return null;
  
  // Enhanced color palette for nuclei based on element categories
  const nucleusColors = {
    'alkali-metal': '#ff4444',
    'alkaline-earth-metal': '#ff8800',
    'transition-metal': '#ffcc00',
    'post-transition-metal': '#55dd55',
    'metalloid': '#66dddd',
    'nonmetal': '#44aaff',
    'noble-gas': '#dd88ff',
    'lanthanide': '#ff44dd',
    'actinide': '#ff6688',
    'unknown': '#aaaaaa',
  };
  
  const category = element.category.replace(/\s+/g, '-').toLowerCase();
  const nucleusColor = nucleusColors[category] || '#ff6666';
  
  return (
    <div className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [0, 5, 40], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <pointLight position={[0, 30, 20]} intensity={0.7} color="#ffffff" />
        
        {/* Subtle ambient glow effect */}
        <fog attach="fog" args={['#050510', 40, 100]} />
        
        <Nucleus element={element} color={nucleusColor} />
        <ElectronShells element={element} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.2}
          minDistance={10}
          maxDistance={100}
          // Allow full 360-degree rotation on all axes
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          maxAzimuthAngle={Infinity}
          minAzimuthAngle={-Infinity}
        />
      </Canvas>
    </div>
  );
};

export default AtomViewer; 