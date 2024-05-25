import { useEffect, useRef } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


export default function Test5() {
  const test5 = useRef<HTMLDivElement>(null);
  const gui = new GUI();
  const { scene, camera, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

  // 平面
  // const geometry = new THREE.PlaneGeometry(100, 100);
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0x00ff00,
  //   side: THREE.DoubleSide
  // });
  // let plane = new THREE.Mesh(geometry, material);
  // plane.rotation.x = Math.PI / 2;

  // scene.add(plane);


  // 实例化加载器gltf
  const gltfLoader = new GLTFLoader();
  // 加载模型
  gltfLoader.load(
    // 模型路径
    "../../public/model/Duck.glb",
    // 加载完成回调
    (gltf) => {
      console.log(gltf);
      scene.add(gltf.scene);
    }
  );
  // 创建 DRACOLoader 的实例
  const dracoLoader = new DRACOLoader();
  // 设置draco路径
  dracoLoader.setDecoderPath("../../public/draco/");
  // 设置gltf加载器draco解码器
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    // 模型路径
    "../../public/model/city.glb",
    // 加载完成回调
    (gltf) => {
      // console.log(gltf);
      scene.add(gltf.scene);
    }
  );

  // 设置环形贴图会带环境光
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load('../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping; // 设置贴图映射方式
    scene.environment = envMap; //设置环形贴图
  });

  scene.add(new THREE.AxesHelper(150));
  scene.add(new THREE.GridHelper(100, 100));
  // scene.fog = new THREE.Fog(0xcccccc, 0.1, 90);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.02);
  scene.background = new THREE.Color(0xcccccc);

  const Animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(Animate);
  }

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test5.current) {
      (test5.current as HTMLDivElement).appendChild(renderer.domElement);
    }
    Animate();
    window.addEventListener('resize', ResizeWindow);
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  }, []);

  return (<>
    <div className="test5" ref={test5}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(50, 50, 50);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}