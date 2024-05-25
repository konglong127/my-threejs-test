import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

// 1,renderer开启阴影
// 2,directionalLight castShadow平行光能投射阴影
// 3,物体能投射处阴影castShadow
// 4,要有图形接收阴影receiveShadow
export default function Test3() {
  const test3 = useRef<HTMLDivElement | null>(null);
  const { camera, scene, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);
  const gui = new GUI();

  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -1, 0);
  plane.receiveShadow = true; // 接收阴影
  plane.rotation.x = -Math.PI / 2;

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const alphaTexture = new THREE.TextureLoader().load('../../public/alph.jpg');
  const cubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
    alphaMap: alphaTexture,
    alphaTest: 0.5, // 透明部分镂空,可以被灯光穿过
    transparent: true,
    side: THREE.DoubleSide,
    shadowSide: THREE.BackSide, // 设置背面投射阴影
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true; // 投射阴影
  cube.receiveShadow = true; // 接收阴影
  cube.position.set(-3, 1, 0);

  const cubeGeometry2 = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial2 = new THREE.MeshPhysicalMaterial({ color: 0x00ff00 });
  const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);
  cube2.castShadow = true;  // 投射阴影
  cube2.receiveShadow = true; // 接收阴影
  cube2.position.set(-3, 1, 3);

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true; // 投射阴影
  sphere.receiveShadow = true; // 接收阴影
  sphere.position.set(0, 1, 0);

  const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.2, 100, 16);
  const torusKnotMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffff00 });
  const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
  torusKnot.castShadow = true; // 投射阴影
  torusKnot.receiveShadow = true; // 接收阴影
  torusKnot.position.set(3, 1, 0);

  // 添加环境光,增亮整个场景
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // 添加一个点光源
  let pointLight = new THREE.PointLight(0xffffff, 100, 10);
  pointLight.position.set(0, 5, 0);
  pointLight.castShadow = true; // 投射阴影
  // pointLight.distance = 5;
  pointLight.decay = 2;
  pointLight.shadow.mapSize.width = 1024; // default
  pointLight.shadow.mapSize.height = 1024; // default
  pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  scene.add(pointLight);

  scene.add(
    plane,
    cube,
    cube2,
    sphere,
    torusKnot,
    new THREE.AxesHelper(15),
    new THREE.GridHelper(10, 10)
  );

  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("../../public/Video_Copilot-Back Light_0007_4k.hdr", (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envMap;
    // scene.environment = envMap;
  });

  let cubeFolder = gui.addFolder('cube图形位置');
  cubeFolder.add(cube.position, 'x', -100, 100).name('图形位置x');
  cubeFolder.add(cube.position, 'y', -100, 100).name('图形位置y');
  cubeFolder.add(cube.position, 'z', -100, 100).name('图形位置z');

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function ResizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test3.current) {
      test3.current.appendChild(renderer.domElement);
      animate();
    }
    window.addEventListener('resize', ResizeWindow);
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test3}></div>
  </>);
}

function init() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 5);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启抗锯齿
  });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { camera, scene, renderer };
}