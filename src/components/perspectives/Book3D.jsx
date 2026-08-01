import React, { Suspense, useRef, useEffect, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls, Center, Bounds, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

function Model({ url, onClick }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  
  useEffect(() => {
    // Some GLTF models come with a baked-in black background or environment.
    scene.background = null;
    scene.environment = null;
    
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      // Original rotation that worked well for the first book
      rotation={[0.2, -Math.PI / 4, 0]} 
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerEnter={() => document.body.style.cursor = 'pointer'}
      onPointerLeave={() => document.body.style.cursor = 'auto'}
    />
  );
}

export default function Book3D({ onBookClick }) {
  const bookGroupRef = useRef();

  useLayoutEffect(() => {
    if (bookGroupRef.current) {
      // Instantly snap scale to 0 before the first frame
      bookGroupRef.current.scale.set(0, 0, 0);
      
      // Animate up to full size (1) after 2 seconds
      gsap.to(bookGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.5,
        delay: 2,
        ease: 'elastic.out(1, 0.7)'
      });
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* We use transparent background by default in Canvas */}
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 40 }} gl={{ alpha: true }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 7]} intensity={2} castShadow />
        <spotLight position={[-5, 5, 5]} intensity={1.5} angle={0.5} penumbra={1} castShadow />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
            {/* The animated group is now OUTSIDE of Bounds. This lets Bounds calculate the 100% size perfectly! */}
            <group ref={bookGroupRef}>
              <Bounds fit clip margin={1.2}>
                <Center>
                  <Model url="/models/book.glb" onClick={onBookClick} />
                </Center>
              </Bounds>
            </group>
          </Float>
          <Environment preset="city" />
          {/* Shadows on the table */}
          <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          makeDefault
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}

// Preload the original model
useGLTF.preload('/models/book.glb');
