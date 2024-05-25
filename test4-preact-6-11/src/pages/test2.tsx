import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { CSM } from "three/addons/csm/CSM.js";

const params = {
  orthographic: false,
  fade: false,
  shadows: true,
  far: 1000,
  mode: 'practical',
  lightX: - 1,
  lightY: - 1,
  lightZ: - 1,
  margin: 100,
  lightFar: 5000,
  lightNear: 1,
  autoUpdateHelper: true,
  updateHelper: function () {
    // csmHelper.update();
  }
};

// 1,renderer开启阴影
// 2,directionalLight castShadow平行光能投射阴影
// 3,物体能投射处阴影castShadow
// 4,要有图形接收阴影receiveShadow
export default function Test2() {
  const test2 = useRef<HTMLDivElement | null>(null);
  const { camera, scene, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);
  const gui = new GUI();

  // 添加平行光,默认照向的目标是原点
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight
    .position
    .set(params.lightX, params.lightY, params.lightZ)
    .normalize()
    .multiplyScalar(- 200);
  // 修改照射目标位置
  directionalLight.target.position.set(0, 2, 1);
  // 平行光可以投射阴影
  // directionalLight.castShadow = true;
  scene.add(directionalLight);
  // 平行光辅助器
  let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(directionalLightHelper);
  // 平行光阴影范围
  directionalLight.shadow.camera.left = -20;//默认-5
  directionalLight.shadow.camera.right = 20;//默认-5
  directionalLight.shadow.camera.top = 20;//默认-5,远处
  directionalLight.shadow.camera.bottom = -20;//默认-5
  directionalLight.shadow.camera.near = 0.1;//默认0.5
  directionalLight.shadow.camera.far = 200;//默认50,多远
  directionalLight.shadow.mapSize.width = 1024;//默认512
  directionalLight.shadow.mapSize.height = 1024;//默认512
  const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  scene.add(cameraHelper);

  let csm = new CSM({
    maxFar: params.far,
    cascades: 4, // 级联等级,越多阴影越清晰,但性能消耗越大
    mode: params.mode as any,
    parent: scene,
    shadowMapSize: 10240, // 阴影清晰度
    lightDirection: new THREE.Vector3(
      params.lightX,
      params.lightY,
      params.lightZ
    ).normalize(),
    camera: camera
  });
  csm.fade=true;// 阴影渐变更明显

  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, 0, 0);
  plane.receiveShadow = true; // 接收阴影
  plane.rotation.x = -Math.PI / 2;
  csm.setupMaterial(planeMaterial); // 设置级联阴影

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true; // 投射阴影
  cube.receiveShadow = true; // 接收阴影
  cube.position.set(-3, 1, 0);
  csm.setupMaterial(cubeMaterial); // 设置级联阴影

  const cubeGeometry2 = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial2 = new THREE.MeshPhysicalMaterial({ color: 0x00ff00 });
  const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);
  cube2.castShadow = true;  // 投射阴影
  cube2.receiveShadow = true; // 接收阴影
  cube2.position.set(-3, 1, 3);
  csm.setupMaterial(cubeMaterial2); // 设置级联阴影

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true; // 投射阴影
  sphere.receiveShadow = true; // 接收阴影
  sphere.position.set(0, 1, 0);
  csm.setupMaterial(sphereMaterial); // 设置级联阴影

  const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.2, 100, 16);
  const torusKnotMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffff00 });
  const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
  torusKnot.castShadow = true; // 投射阴影
  torusKnot.receiveShadow = true; // 接收阴影
  torusKnot.position.set(3, 1, 0);
  csm.setupMaterial(torusKnotMaterial); // 设置级联阴影

  // 添加环境光,增亮整个场景
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

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
    camera.updateMatrixWorld();
    csm.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function ResizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test2.current) {
      test2.current.appendChild(renderer.domElement);
      animate();
    }
    window.addEventListener('resize', ResizeWindow);
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test2}></div>
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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 阴影类型,软阴影,更圆滑
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { camera, scene, renderer };
}