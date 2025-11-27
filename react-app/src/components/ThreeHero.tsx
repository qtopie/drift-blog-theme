import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Button, Title1 } from '@fluentui/react-components';

export const ThreeHero = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 简单的 Three.js 初始化
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(mountRef.current.clientWidth, 400);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    camera.position.z = 30;

    const animate = () => {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      // 清理逻辑
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <Title1>Welcome to My Blog</Title1>
        <div style={{ marginTop: '20px' }}>
          <Button appearance="primary">Get Started</Button>
        </div>
      </div>
    </div>
  );
};