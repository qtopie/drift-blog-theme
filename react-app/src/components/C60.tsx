import * as THREE from 'three';
import { useEffect, useRef } from "react";
import { OrbitControls } from 'three-stdlib';

type C60Props = {
  containerSelector?: string;
};

export const C60 = ({ containerSelector }: C60Props) => {
  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Constants
    const phi = (1 + Math.sqrt(5)) / 2;

    // Initial Vertices
    const initialVertices = [
      phi, 0, 1,
      phi, 0, -1,
      -phi, 0, -1,
      -phi, 0, 1,

      1, phi, 0,
      1, -phi, 0,
      -1, -phi, 0,
      -1, phi, 0,

      0, 1, phi,
      0, 1, -phi,
      0, -1, -phi,
      0, -1, phi,
    ];

    // Function to calculate new vertex
    const calcVertex = (v0: number[], vi: number[]) => {
      return [(2 * v0[0] + vi[0]) / 3, (2 * v0[1] + vi[1]) / 3, (2 * v0[2] + vi[2]) / 3];
    };

    // Generate vertices
    let vertices: number[][] = [];
    for (let i = 0; i < initialVertices.length; i += 3) {
      vertices.push(initialVertices.slice(i, i + 3) as number[]);
    }

    const newVertices: number[][] = [];

    const addCalculatedVertex = (v0Index: number, viIndex: number) => {
      const v = calcVertex(vertices[v0Index], vertices[viIndex]);
      newVertices.push(v);
    };

    addCalculatedVertex(0, 8);
    addCalculatedVertex(0, 4);
    addCalculatedVertex(0, 1);
    addCalculatedVertex(0, 5);
    addCalculatedVertex(0, 11);

    addCalculatedVertex(1, 0);
    addCalculatedVertex(1, 4);
    addCalculatedVertex(1, 9);
    addCalculatedVertex(1, 10);
    addCalculatedVertex(1, 5);

    addCalculatedVertex(2, 3);
    addCalculatedVertex(2, 6);
    addCalculatedVertex(2, 10);
    addCalculatedVertex(2, 9);
    addCalculatedVertex(2, 7);

    addCalculatedVertex(3, 6);
    addCalculatedVertex(3, 2);
    addCalculatedVertex(3, 7);
    addCalculatedVertex(3, 8);
    addCalculatedVertex(3, 11);

    addCalculatedVertex(4, 8);
    addCalculatedVertex(4, 7);
    addCalculatedVertex(4, 9);
    addCalculatedVertex(4, 1);
    addCalculatedVertex(4, 0);

    addCalculatedVertex(5, 0);
    addCalculatedVertex(5, 1);
    addCalculatedVertex(5, 10);
    addCalculatedVertex(5, 6);
    addCalculatedVertex(5, 11);

    addCalculatedVertex(6, 11);
    addCalculatedVertex(6, 5);
    addCalculatedVertex(6, 10);
    addCalculatedVertex(6, 2);
    addCalculatedVertex(6, 3);

    addCalculatedVertex(7, 3);
    addCalculatedVertex(7, 2);
    addCalculatedVertex(7, 9);
    addCalculatedVertex(7, 4);
    addCalculatedVertex(7, 8);

    addCalculatedVertex(8, 4);
    addCalculatedVertex(8, 0);
    addCalculatedVertex(8, 11);
    addCalculatedVertex(8, 3);
    addCalculatedVertex(8, 7);

    addCalculatedVertex(9, 4);
    addCalculatedVertex(9, 7);
    addCalculatedVertex(9, 2);
    addCalculatedVertex(9, 10);
    addCalculatedVertex(9, 1);

    addCalculatedVertex(10, 1);
    addCalculatedVertex(10, 9);
    addCalculatedVertex(10, 2);
    addCalculatedVertex(10, 6);
    addCalculatedVertex(10, 5);

    addCalculatedVertex(11, 0);
    addCalculatedVertex(11, 5);
    addCalculatedVertex(11, 6);
    addCalculatedVertex(11, 3);
    addCalculatedVertex(11, 8);

    vertices = vertices.concat(newVertices);

    const flatVertices = vertices.reduce((acc, v) => acc.concat(v), []);

    // Faces - Pentagon
    const pentagonIndices = [
      // # point 0: 12, 13, 14, 15, 16
      12, 13, 14,
      12, 14, 15,
      12, 15, 16,

      // # point 1: 17, 18, 19, 20, 21
      17, 18, 19,
      17, 19, 20,
      17, 20, 21,

      // # point 2: 22, 23, 24, 25, 26
      22, 23, 24,
      22, 24, 25,
      22, 25, 26,

      // # point 3: 27, 28, 29, 30, 31
      27, 28, 29,
      27, 29, 30,
      27, 30, 31,

      // # point 4: 32, 33, 34, 35, 36
      32, 33, 34,
      32, 34, 35,
      32, 35, 36,

      // # point 5: 37, 38, 39, 40, 41
      37, 38, 39,
      37, 39, 40,
      37, 40, 41,

      // # point 6: 42, 43, 44, 45, 46
      42, 43, 44,
      42, 44, 45,
      42, 45, 46,

      // # point 7: 47, 48, 49, 50, 51
      47, 48, 49,
      47, 49, 50,
      47, 50, 51,

      // # point 8: 52, 53, 54, 55, 56
      52, 53, 54,
      52, 54, 55,
      52, 55, 56,

      // # point 9: 57, 58, 59, 60, 61
      57, 58, 59,
      57, 59, 60,
      57, 60, 61,

      // # point 10: 62, 63, 64, 65, 66
      62, 63, 64,
      62, 64, 65,
      62, 65, 66,

      // # point 11: 67, 68, 69, 70, 71
      67, 68, 69,
      67, 69, 70,
      67, 70, 71,
    ];

    // Faces - Hexagon
    const hexagonIndices = [
      // # point 0, 8, 4
      12, 53, 52,
      12, 52, 32,
      12, 32, 36,
      12, 36, 13,

      // # point 0, 4, 1
      14, 13, 36,
      14, 36, 35,
      14, 35, 18,
      14, 18, 17,

      // # point 0, 1, 5
      15, 14, 17,
      15, 17, 21,
      15, 21, 38,
      15, 38, 37,

      // # point 0, 5, 11
      16, 15, 37,
      16, 37, 41,
      16, 41, 68,
      16, 68, 67,

      // # point 0, 11, 8
      12, 16, 67,
      12, 67, 71,
      12, 71, 54,
      12, 54, 53,

      // # point 2, 3, 6
      23, 22, 28,
      23, 28, 27,
      23, 27, 46,
      23, 46, 45,

      // # point 2, 6, 10
      24, 23, 45,
      24, 45, 44,
      24, 44, 65,
      24, 65, 64,

      // # point 2, 9, 10
      25, 24, 64,
      25, 64, 63,
      25, 63, 60,
      25, 60, 59,

      // # point 2, 9, 7
      26, 25, 59,
      26, 59, 58,
      26, 58, 49,
      26, 49, 48,

      // # point 2, 7, 3
      22, 26, 48,
      22, 48, 47,
      22, 47, 29,
      22, 29, 28,

      // # point 3, 8, 11
      31, 30, 55,
      31, 55, 54,
      31, 54, 71,
      31, 71, 70,

      // # point 6, 3, 11
      42, 46, 27,
      42, 27, 31,
      42, 31, 70,
      42, 70, 69,

      // # point 5, 6, 11
      41, 40, 43,
      41, 43, 42,
      41, 42, 69,
      41, 69, 68,

      // # point 5, 10, 6
      40, 39, 66,
      40, 66, 65,
      40, 65, 44,
      40, 44, 43,

      // # point 1, 10, 5
      21, 20, 62,
      21, 62, 66,
      21, 66, 39,
      21, 39, 38,

      // # point 1, 9, 10
      20, 19, 61,
      20, 61, 60,
      20, 60, 63,
      20, 63, 62,

      // # point 4, 9, 1
      35, 34, 57,
      35, 57, 61,
      35, 61, 19,
      35, 19, 18,

      // # point 4, 7, 9
      34, 33, 50,
      34, 50, 49,
      34, 49, 58,
      34, 58, 57,

      // # point 8, 7, 4
      52, 56, 51,
      52, 51, 50,
      52, 50, 33,
      52, 33, 32,

      // # point 8, 3, 7
      56, 55, 30,
      56, 30, 29,
      56, 29, 47,
      56, 47, 51,
    ];


    const indices = pentagonIndices.concat(hexagonIndices);

    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0e293); // 浅绿色
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Prefer external Hugo container when selector provided; else use local ref
    const externalContainer = containerSelector ? document.querySelector(containerSelector) as HTMLElement | null : null;
    const container = externalContainer ?? refContainer.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);

    // Use flatVertices and indices
    const geometry = new THREE.PolyhedronGeometry(flatVertices, indices, 2, 0);

    // Create color attribute
    const colors = [];
    for (let i = 0; i < indices.length; i += 3) {
      const face = indices.slice(i, i + 3);
      let isPentagon = false;
      for (let j = 0; j < pentagonIndices.length; j += 3) {
        const pentagonFace = pentagonIndices.slice(j, j + 3);
        if (face[0] === pentagonFace[0] && face[1] === pentagonFace[1] && face[2] === pentagonFace[2]) {
          isPentagon = true;
          break;
        }
      }
      if (isPentagon) {
        // Black for pentagon
        colors.push(0, 0, 0);
        colors.push(0, 0, 0);
        colors.push(0, 0, 0);
      } else {
        // White for hexagon
        colors.push(1, 1, 1);
        colors.push(1, 1, 1);
        colors.push(1, 1, 1);
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
      transparent: false, // 启用透明度
      opacity: 1,      // 设置透明度为
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x333333 })
    );
    mesh.add(wireframe);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0; // 调整旋转速度

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      // labelRenderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // 清理
    return () => {
      renderer.dispose();
      window.removeEventListener('resize', onResize);
      refContainer.current && refContainer.current.removeChild(renderer.domElement);
      // refContainer.current && refContainer.current.removeChild(labelRenderer.domElement);
    };
  }, []);

  return (
    <div ref={refContainer} className="three-container"></div>
  );
}

export default C60;