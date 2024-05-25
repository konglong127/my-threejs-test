import { useRef, useEffect } from "preact/hooks";
import *  as THREE from "three";
import { OrbitControls, RGBELoader, VertexNormalsHelper } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
// import *  as TWEEN from "three/examples/jsm/libs/tween.module.js";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function Test8() {
  const test8 = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

  // 加载gltf模型
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("../../public/model/Duck.glb", (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);
    // let duckMesh = gltf.scene.getObjectByName("LOD3spShape");
    let duckMesh=gltf.scene.getObjectById(17);
    if (duckMesh) {
      let duckGeometry = (duckMesh as any).geometry;
      // 计算包围盒
      duckGeometry.computeBoundingBox();
      // 获取duck包围盒
      let duckBox = duckGeometry.boundingBox;

      // 设置几何体居中
      // duckGeometry.center();

      /* --------------------- 设置包围盒大小与模型一致 ------------------ */
      // 更新世界矩阵
      duckMesh.updateWorldMatrix(true, true);
      // 更新围盒辅助器
      duckBox.applyMatrix4(duckMesh.matrixWorld);

      // 获取包围盒中心点
      let center = duckBox.getCenter(new THREE.Vector3());
      console.log(center);
      // 创建包围盒辅助器
      let boxHelper = new THREE.Box3Helper(duckBox, 0xffff00);
      scene.add(boxHelper);

      // 创建包围球
      let duckSphere = duckGeometry.boundingSphere;
      console.log(duckSphere);
      duckSphere.applyMatrix4(duckMesh.matrixWorld);
      // 创建包围球辅助器
      let sphereGeometry = new THREE.SphereGeometry(duckSphere.radius, 16, 16);
      let sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      });
      let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereMesh.position.copy(duckSphere.center);
      scene.add(sphereMesh);
    }
  });

  scene.add(new THREE.AxesHelper(30));
  scene.add(new THREE.GridHelper(20, 20));
  scene.background = new THREE.Color(0xdddddd);

  // 设置环形贴图会带环境光
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load('../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping; // 设置贴图映射方式
    scene.environment = envMap; //设置环形贴图
    // 设置环境贴图
    // scene.background = envMap;
  });

  const animate = () => {
    controls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  const ResizeWindows = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test8.current) {
      test8.current.appendChild(renderer.domElement);
      animate();
    }
    window.addEventListener("resize", ResizeWindows);
    return () => {
      window.removeEventListener("resize", ResizeWindows);
    }
  }, []);

  return (<>
    <div ref={test8}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}