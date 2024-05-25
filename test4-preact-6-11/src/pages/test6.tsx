import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test6() {
  const test6 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath("../../public/draco");
  // const gltfLoader = new GLTFLoader();
  // gltfLoader.setDRACOLoader(dracoLoader);
  // gltfLoader.load("../../public/model/mobile/iphone.glb", (gltf) => {
  //   gltf.scene.scale.set(3, 3, 3);
  //   scene.add(gltf.scene);
  //   console.log(gltf);
  // });

  let modelAction: THREE.AnimationMixer | null = null;
  const fbxLoader = new FBXLoader();
  fbxLoader.load("../../public/model/man/man.fbx", (fbx) => {
    fbx.scale.set(0.02, 0.02, 0.02);
    scene.add(fbx);
    console.log(fbx);
    modelAction = new THREE.AnimationMixer(fbx);
    const action = modelAction.clipAction(fbx.animations[0]);
    action.play();
  });

  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    },
  };

  gui.add(eventObj, 'Fullscreen');
  gui.add(eventObj, 'ExitFullscreen');

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    let delta = clock.getDelta();
    if (modelAction) {
      modelAction.update(delta);
    }
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test6.current) {
      test6.current.appendChild(stats.dom);
      test6.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test6}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(15, 8, 0);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 可以开启关闭灯光
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  let pointLight = new THREE.PointLight(0xffffff, 1000, 20);
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  pointLight.castShadow = true;
  pointLight.decay = 2;
  pointLight.shadow.mapSize.width = 1024; // default
  pointLight.shadow.mapSize.height = 1024; // default
  pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  scene.add(pointLight);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ResizeWindow };
}