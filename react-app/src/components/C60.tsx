import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OrbitControls } from 'three-stdlib';
import '../App.css';

type C60Props = {
  containerSelector?: string;
};

const fortuneCookieKey = "c60_fortune";

const getFortuneCookie = () => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${fortuneCookieKey}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
};

const setFortuneCookie = (value: string) => {
  if (typeof document === "undefined") return;
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  document.cookie = `${fortuneCookieKey}=${encodeURIComponent(value)}; expires=${nextMidnight.toUTCString()}; path=/`;
};

export const C60 = ({ containerSelector }: C60Props) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const [fortune, setFortune] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [showCurtain, setShowCurtain] = useState<boolean>(false); // Control big curtain visibility
  const [domContainer, setDomContainer] = useState<HTMLElement | null>(null);
  const spinSpeedRef = useRef<number>(2.0);
  const spinningRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Animation Refs
  const targetScaleRef = useRef(1.0);
  const showBubbleRef = useRef(false);

  useEffect(() => {
    // === 1. Geometry Construction (C60 Logic) ===
    const phi = (1 + Math.sqrt(5)) / 2;
    // Initial Vertices (Icosahedron based)
    const initialVertices = [
      phi, 0, 1, phi, 0, -1, -phi, 0, -1, -phi, 0, 1,
      1, phi, 0, 1, -phi, 0, -1, -phi, 0, -1, phi, 0,
      0, 1, phi, 0, 1, -phi, 0, -1, -phi, 0, -1, phi,
    ];
    // Function to calculate new vertex (truncating corners)
    const calcVertex = (v0: number[], vi: number[]) => {
      return [(2 * v0[0] + vi[0]) / 3, (2 * v0[1] + vi[1]) / 3, (2 * v0[2] + vi[2]) / 3];
    };

    let vertices: number[][] = [];
    for (let i = 0; i < initialVertices.length; i += 3) {
      vertices.push(initialVertices.slice(i, i + 3) as number[]);
    }
    const newVertices: number[][] = [];
    const addCalculatedVertex = (v0Index: number, viIndex: number) => {
      newVertices.push(calcVertex(vertices[v0Index], vertices[viIndex]));
    };
    // ... Truncation Logic (Simplified for brevity, assuming standard connections) ...
    // Note: Re-using the exact connectivity logic from previous version to ensure correct shape
    const connections = [
      [0,8],[0,4],[0,1],[0,5],[0,11],[1,0],[1,4],[1,9],[1,10],[1,5],
      [2,3],[2,6],[2,10],[2,9],[2,7],[3,6],[3,2],[3,7],[3,8],[3,11],
      [4,8],[4,7],[4,9],[4,1],[4,0],[5,0],[5,1],[5,10],[5,6],[5,11],
      [6,11],[6,5],[6,10],[6,2],[6,3],[7,3],[7,2],[7,9],[7,4],[7,8],
      [8,4],[8,0],[8,11],[8,3],[8,7],[9,4],[9,7],[9,2],[9,10],[9,1],
      [10,1],[10,9],[10,2],[10,6],[10,5],[11,0],[11,5],[11,6],[11,3],[11,8]
    ];
    connections.forEach(pair => addCalculatedVertex(pair[0], pair[1]));
    vertices = vertices.concat(newVertices);
    const flatVertices = vertices.reduce((acc, v) => acc.concat(v), []);

    // Indices construction (Standard C60 Faces)
    // Pentagon + Hexagon indices
    const pentagonIndices = [
      12, 13, 14, 12, 14, 15, 12, 15, 16, // Pentagon 0
      17, 18, 19, 17, 19, 20, 17, 20, 21, // Pentagon 1
      22, 23, 24, 22, 24, 25, 22, 25, 26, // Pentagon 2
      27, 28, 29, 27, 29, 30, 27, 30, 31, // Pentagon 3
      32, 33, 34, 32, 34, 35, 32, 35, 36, // Pentagon 4
      37, 38, 39, 37, 39, 40, 37, 40, 41, // Pentagon 5
      42, 43, 44, 42, 44, 45, 42, 45, 46, // Pentagon 6
      47, 48, 49, 47, 49, 50, 47, 50, 51, // Pentagon 7
      52, 53, 54, 52, 54, 55, 52, 55, 56, // Pentagon 8
      57, 58, 59, 57, 59, 60, 57, 60, 61, // Pentagon 9
      62, 63, 64, 62, 64, 65, 62, 65, 66, // Pentagon 10
      67, 68, 69, 67, 69, 70, 67, 70, 71, // Pentagon 11
    ];
    const hexagonIndices = [
      12, 53, 52, 12, 52, 32, 12, 32, 36, 12, 36, 13,
      14, 13, 36, 14, 36, 35, 14, 35, 18, 14, 18, 17,
      15, 14, 17, 15, 17, 21, 15, 21, 38, 15, 38, 37,
      16, 15, 37, 16, 37, 41, 16, 41, 68, 16, 68, 67,
      12, 16, 67, 12, 67, 71, 12, 71, 54, 12, 54, 53,
      23, 22, 28, 23, 28, 27, 23, 27, 46, 23, 46, 45,
      24, 23, 45, 24, 45, 44, 24, 44, 65, 24, 65, 64,
      25, 24, 64, 25, 64, 63, 25, 63, 60, 25, 60, 59,
      26, 25, 59, 26, 59, 58, 26, 58, 49, 26, 49, 48,
      22, 26, 48, 22, 48, 47, 22, 47, 29, 22, 29, 28,
      31, 30, 55, 31, 55, 54, 31, 54, 71, 31, 71, 70,
      42, 46, 27, 42, 27, 31, 42, 31, 70, 42, 70, 69,
      41, 40, 43, 41, 43, 42, 41, 42, 69, 41, 69, 68,
      40, 39, 66, 40, 66, 65, 40, 65, 44, 40, 44, 43,
      21, 20, 62, 21, 62, 66, 21, 66, 39, 21, 39, 38,
      20, 19, 61, 20, 61, 60, 20, 60, 63, 20, 63, 62,
      35, 34, 57, 35, 57, 61, 35, 61, 19, 35, 19, 18,
      34, 33, 50, 34, 50, 49, 34, 49, 58, 34, 58, 57,
      52, 56, 51, 52, 51, 50, 52, 50, 33, 52, 33, 32,
      56, 55, 30, 56, 30, 29, 56, 29, 47, 56, 47, 51,
    ];
    const indices = pentagonIndices.concat(hexagonIndices);

    // === 2. Scene Setup ===
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background for integration
    
    // Cameras & Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const externalContainer = containerSelector ? document.querySelector(containerSelector) as HTMLElement | null : null;
    const container = externalContainer ?? refContainer.current;
    if (!container) return;
if (externalContainer) {
      externalContainer.style.position = 'relative';
      externalContainer.style.overflow = 'hidden';
      // If external, we need to let React know where to render the overlay
      setDomContainer(externalContainer);
    }

    
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 12); // Slightly further back

    container.appendChild(renderer.domElement);

    // === TIME CHECK ===
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    
    // Animation targets
    // Removed local let variables to use Refs directly in animate loop
    // targetScaleRef, showBubbleRef

    let particlesMesh: THREE.Points | undefined;
    let coreMesh: THREE.Mesh | undefined;
    let mesh: THREE.Mesh | undefined; // Day/Main mesh
    let bubble: THREE.Mesh | undefined;

    if (isNight) {
      // === NIGHT MODE: Crystal Starry C60 ===
      
      // 1. Create a Starry Texture (Background for the glass) without text
      const createStarTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0,0,1024,512);

          // Deep Space Nebula Gradient
          const grad = ctx.createLinearGradient(0, 0, 0, 512);
          grad.addColorStop(0, 'rgba(0, 0, 20, 0.4)'); 
          grad.addColorStop(0.5, 'rgba(30, 0, 60, 0.4)'); 
          grad.addColorStop(1, 'rgba(0, 10, 40, 0.4)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 512);
          
          // Dense Star Field
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 500; i++) {
              const x = Math.random() * 1024;
              const y = Math.random() * 512;
              const r = Math.random() * 1.5;
              ctx.globalAlpha = Math.random() * 0.9 + 0.1;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
          }
          
          // Nebula Clouds (Soft brushes)
          for(let i=0; i<20; i++) {
             const x = Math.random() * 1024;
             const y = Math.random() * 512;
             const radius = 50 + Math.random() * 100;
             const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
             gradient.addColorStop(0, `rgba(${100+Math.random()*155}, ${50+Math.random()*100}, 255, 0.2)`);
             gradient.addColorStop(1, 'rgba(0,0,0,0)');
             ctx.fillStyle = gradient;
             ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
          }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
      };

      const starTexture = createStarTexture();

      // === 2. Mesh Construction ===
      const geometry = new THREE.PolyhedronGeometry(flatVertices, indices, 2.5, 2); // Increased detail for smoother crystal look
      
      const posAttribute = geometry.attributes.position;
      const uvs: number[] = [];
      for ( let i = 0; i < posAttribute.count; i ++ ) {
          const x = posAttribute.getX( i );
          const y = posAttribute.getY( i );
          const z = posAttribute.getZ( i );
          const vector = new THREE.Vector3(x, y, z);
          vector.normalize();
          const u = 1 - (0.5 + Math.atan2(vector.z, vector.x) / (2 * Math.PI));
          const v = 0.5 + Math.asin(vector.y) / Math.PI;
          uvs.push(u, v);
      }
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.computeVertexNormals();

      // -- Crystal Material --
      const crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: starTexture,        // Subtle starry background reflection
        roughness: 0.05,         // Very smooth
        metalness: 0.1,
        transmission: 0.9,       // Highly transparent (Crystal)
        thickness: 1.5,          // High refraction volume
        ior: 2.4,                // High Index of Refraction (like Diamond/Crystal)
        clearcoat: 1.0, 
        clearcoatRoughness: 0.0,
        side: THREE.FrontSide,
        envMapIntensity: 1.5,
      });

      const mesh = new THREE.Mesh(geometry, crystalMaterial);
      scene.add(mesh);

      // -- Internal "Starry Universe" Core --  
      // Instead of a single solid core, let's put a "Galaxy" inside
      const galaxyGeo = new THREE.IcosahedronGeometry(1.8, 1);
      const galaxyMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1
      });
      coreMesh = new THREE.Mesh(galaxyGeo, galaxyMat);
      scene.add(coreMesh);
      
      // Core Inner Light
      const pLight = new THREE.PointLight(0x88ccff, 2, 10);
      scene.add(pLight);

      // -- Sparkles (External Crystals/Stars) --
      const sparklesCount = 600;
      const sPos = new Float32Array(sparklesCount * 3);
      for(let i=0; i<sparklesCount; i++) {
        const r = 3 + Math.random() * 5; // Orbiting around
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        sPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        sPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        sPos[i*3+2] = r * Math.cos(phi);
      }
      const sparklesGeo = new THREE.BufferGeometry();
      sparklesGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      const sparklesMat = new THREE.PointsMaterial({
        color: 0xaaddff,
        size: 0.08,
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      particlesMesh = new THREE.Points(sparklesGeo, sparklesMat);
      scene.add(particlesMesh);

      // Lighting
      scene.add(new THREE.AmbientLight(0x222244, 1.0));
      const dirLight = new THREE.DirectionalLight(0xaaccff, 2);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);
      
      // Rim Light
      const rimLight = new THREE.SpotLight(0xff00ff, 4);
      rimLight.position.set(-10, 0, -5);
      rimLight.lookAt(0,0,0);
      scene.add(rimLight);

    } else {
      // === DAY MODE: Classic Soccer Ball on Lawn ===
      const geometry = new THREE.PolyhedronGeometry(flatVertices, indices, 2.5, 0);
      geometry.clearGroups();
      // Pentagon indices (first pentagonIndices.length vertices)
      // Note: Indices array is [pentagons..., hexagons...]
      // Pentagons = 12 * 3 (triangles) * 3 (vertices)? No, indices length.
      // pentagonIndices has 12 * 9 = 108 indices (12 faces, 3 triangles each)
      // hexagonIndices has 20 * 9 = 180 indices
      geometry.addGroup(0, pentagonIndices.length, 0);
      geometry.addGroup(pentagonIndices.length, hexagonIndices.length, 1);

      const materials = [
          new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.1 }), // Pentagons (Black)
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 })  // Hexagons (White)
      ];

      mesh = new THREE.Mesh(geometry, materials);      scene.add(mesh);
      
      // Wireframe for definition
      const wGeo = new THREE.WireframeGeometry(geometry);
      const wMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
      mesh.add(new THREE.LineSegments(wGeo, wMat));

      // Lawn
      const lawnGeo = new THREE.CircleGeometry(12, 64);
      const lawnMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
      const lawn = new THREE.Mesh(lawnGeo, lawnMat);
      lawn.rotation.x = -Math.PI / 2;
      lawn.position.y = -3.5;
      scene.add(lawn);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(10, 20, 10);
      sun.castShadow = true;
      scene.add(sun);
    }

    // === Bubble Mesh ===
    const bubbleGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const bubbleMat = new THREE.MeshPhongMaterial({ 
      color: 0xaaccff, 
      transparent: true, 
      opacity: 0.3, 
      shininess: 100,
      specular: 0xffffff,
      side: THREE.DoubleSide
    });
    bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.visible = false;
    scene.add(bubble);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    const baseSpeed = isNight ? 1.0 : 2.0;
    spinSpeedRef.current = baseSpeed;
    controls.autoRotateSpeed = baseSpeed;

    const animate = function () {
      rafRef.current = requestAnimationFrame(animate);
      controls.autoRotateSpeed = spinSpeedRef.current;
      controls.update();

      const scaleSpeed = 0.05;

      if (isNight) {
        if (particlesMesh) {
          particlesMesh.rotation.y -= 0.002;
          particlesMesh.rotation.x += 0.001;
          // Apply shrinking
          const curr = particlesMesh.scale.x;
          particlesMesh.scale.setScalar(curr + (targetScaleRef.current - curr) * scaleSpeed);

        }
        if (coreMesh) {
          const time = Date.now() * 0.002;
           // Integrate breathing with shrinking
          const breath = 1 + Math.sin(time) * 0.1;
          
          if (coreMesh.userData.currentScale === undefined) coreMesh.userData.currentScale = 1;
          coreMesh.userData.currentScale += (targetScaleRef.current - coreMesh.userData.currentScale) * scaleSpeed;
          coreMesh.scale.setScalar(coreMesh.userData.currentScale * breath);
        }
      } else {
         if (mesh) {
            const curr = mesh.scale.x;
            mesh.scale.setScalar(curr + (targetScaleRef.current - curr) * scaleSpeed);
         }
      }

      if (bubble) {
          if (showBubbleRef.current) {
              bubble.visible = true;
              const curr = bubble.scale.x;
              bubble.scale.setScalar(curr + (1 - curr) * 0.1);
          } else {
              if (bubble.scale.x < 0.01) {
                  bubble.visible = false;
              } else {
                  // Shrink out
                  bubble.scale.setScalar(bubble.scale.x * 0.9);
              }
          }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = container.clientWidth || 600;
      height = container.clientHeight || 400;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const startDraw = () => {
      const existing = getFortuneCookie();
      if (existing) {
        setFortune(existing);
        return;
      }
      if (spinningRef.current) return;
      spinningRef.current = true;
      setIsSpinning(true);
      setFortune("");

      // Phase 1: Accelerate
      const durationMs = 2000;
      const startSpeed = spinSpeedRef.current;
      const topSpeed = 25.0; 
      const startTime = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        // Exponential acceleration
        spinSpeedRef.current = startSpeed + (topSpeed - startSpeed) * (t * t);
        
        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }

        // Phase 2: Shrink
        targetScaleRef.current = 0.001;

        // Phase 3: Show Fortune (Wait for shrink)
        setTimeout(() => {
            const fortunes = ["大吉", "中吉", "吉", "末吉", "凶", "大凶"];
            const pick = fortunes[Math.floor(Math.random() * fortunes.length)];
            setFortuneCookie(pick);
            setFortune(pick);
            setShowCurtain(true); // Show Big Curtain
            spinSpeedRef.current = baseSpeed;

            // Phase 4: Wait 5s & Return
            setTimeout(() => {
                setShowCurtain(false); // Hide Big Curtain
                targetScaleRef.current = 1.0; // Grow Sphere
                showBubbleRef.current = true; // Show bubble attached
                
                // Allow re-spin logic reset?
                setTimeout(() => {
                    spinningRef.current = false;
                    setIsSpinning(false);
                }, 1000);
            }, 5000);

        }, 800);
      };

      requestAnimationFrame(tick);
    };

    container.addEventListener("click", startDraw);

    // Manual Spin Detection
    let lastAzimuth = controls.getAzimuthalAngle();
    let lastTime = performance.now();
    
    const onControlsChange = () => {
        if (spinningRef.current) return;
        const now = performance.now();
        // Throttle check
        if (now - lastTime > 50) { 
             const az = controls.getAzimuthalAngle();
             const delta = Math.abs(az - lastAzimuth);
             // Handle wrap around PI/-PI? OrbitControls usually limits or wraps. 
             // If difference is large, it might be wrap.
             // Simple speed check:
             const speed = delta / ((now - lastTime) / 1000);
             if (speed > 8.0) { // Fast spin
                 startDraw();
             }
             lastAzimuth = az;
             lastTime = now;
        }
    };
    controls.addEventListener('change', onControlsChange);

    const existing = getFortuneCookie();
    if (existing) {
      setFortune(existing);
      // Don't show curtain on reload, just bubble (default showCurtain is false)
      showBubbleRef.current = true;
    }

    // 清理
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      container.removeEventListener("click", startDraw);
      controls.removeEventListener('change', onControlsChange);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerSelector]);

  const overlay = (
    <>
      <div
        className={`c60-fortune ${showCurtain ? "c60-fortune--revealed" : ""} ${isSpinning ? "c60-fortune--spinning" : ""}`}
      >
        <div className="c60-curtain"></div>
        <div className="c60-stick">
          <div className="c60-stick-top" />
          <div className="c60-paper">
            <div className="c60-paper-title">唐风签</div>
            <div className="c60-paper-text">{fortune}</div>
            <div className="c60-paper-footer">今日一签</div>
            <div className="c60-paper-seal">印</div>
          </div>
          <div className="c60-stick-tassel" />
        </div>
      </div>
      
      {/* Bubble Portal UI when sphere is visible and no Big Curtain */}
      {fortune && !isSpinning && !showCurtain && (
         <div 
           className={`c60-bubble-tag ${["凶", "大凶"].includes(fortune) ? "bad" : "good"}`}
           style={{
               position: 'absolute',
               left: '50%',
               top: '50%',
               transform: 'translate(-50%, -50%)', // Centered on sphere
               zIndex: 2,
               pointerEvents: 'none',
               color: '#fff',
               fontWeight: 'bold',
               fontSize: '14px',
               textShadow: '0 1px 2px rgba(0,0,0,0.5)',
               background: ["凶", "大凶"].includes(fortune) ? 'rgba(0,0,0,0.6)' : 'rgba(200, 50, 50, 0.6)',
               padding: '4px 8px',
               borderRadius: '12px',
               border: '1px solid rgba(255,255,255,0.3)'
           }}
         >
           {fortune}
         </div>
      )} 
    </>
  );

  if (containerSelector && domContainer) {
    return (
      <>
        <div ref={refContainer} className="three-container c60-root" style={{ display: 'none' }} />
        {createPortal(overlay, domContainer)}
      </>
    );
  }

  return (
    <div
      ref={refContainer}
      className="three-container c60-root"
    >
      {overlay}
    </div>
  );
}

export default C60;