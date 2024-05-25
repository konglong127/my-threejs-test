import { useRef, useEffect } from "preact/hooks";
import *  as THREE from "three";
import { OrbitControls, RGBELoader, VertexNormalsHelper } from "three/examples/jsm/Addons.js";
// import *  as TWEEN from "three/examples/jsm/libs/tween.module.js";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function Test7() {
  const test7 = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

  // 创建一个平面，贴了一张图
  const geometry = new THREE.PlaneGeometry(2, 2);
  const texture = new THREE.TextureLoader().load('../../public/uv_grid_opengl.jpg');
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // 创建几何体
  const buffer_geometry = new THREE.BufferGeometry();
  // 创建顶点数据,顶点是有序的,每三个为一个顶点，逆时针为正面
  // const vertices = new Float32Array([
  //   -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,

  //   1.0, 1.0, 0, -1.0, 1.0, 0, -1.0, -1.0, 0,
  // ]);
  // // 创建顶点属性
  // geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  // 使用索引绘制，根据这4个点绘制成一个面
  const vertices = new Float32Array([
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0,
  ]);
  // 创建顶点属性
  buffer_geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  // 创建索引
  const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
  // 创建索引属性
  buffer_geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  /* 
    假如模型跑偏，可以在设置geometry上设置坐标移动到原点
    再移动组合好的模型
  */
  // 设置平移
  buffer_geometry.translate(-2, 0, 0);
  buffer_geometry.rotateX(Math.PI / 2);
  buffer_geometry.scale(3, 3, 3);

  // buffer_geometry.attributes.position.setX(0, 0);

  // 设置uv坐标
  const uv = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1, // 正面,4个点
  ]);
  // 创建uv属性
  buffer_geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  // 计算反射
  // buffer_geometry.computeVertexNormals();
  // 
  buffer_geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));

  console.log(buffer_geometry);
  // 创建材质
  const buffer_material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const plane2 = new THREE.Mesh(buffer_geometry, buffer_material);
  scene.add(plane2);
  plane2.position.x = 3;

  // 法向量
  scene.add(new VertexNormalsHelper(plane, 0.2, 0xff0000));
  scene.add(new VertexNormalsHelper(plane2, 0.2, 0xff0000));

  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
    // 设置球形贴图
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    // 设置环境贴图
    scene.background = envMap;
    // 设置环境贴图
    scene.environment = envMap;
    // 设置plane的环境贴图
    plane.material.envMap = envMap;
    // 设置plane的环境贴图
    buffer_material.envMap = envMap;
  });

  scene.add(new THREE.AxesHelper(10));
  scene.add(new THREE.GridHelper(10, 10));

  const animate = () => {
    controls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  const windowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test7.current) {
      test7.current.appendChild(renderer.domElement);
    }
    animate();
    window.addEventListener('resize', windowResize);
    return () => {
      window.removeEventListener('resize', windowResize);
    }
  });

  return (<>
    <div className='test7' ref={test7}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}