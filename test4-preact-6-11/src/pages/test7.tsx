import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test7() {
  const test7 = useRef<HTMLDivElement | null>(null);
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

  // let modelAction: THREE.AnimationMixer | null = null;
  // const fbxLoader = new FBXLoader();
  // fbxLoader.load("../../public/model/man/man.fbx", (fbx) => {
  //   fbx.scale.set(0.02, 0.02, 0.02);
  //   scene.add(fbx);
  //   console.log(fbx);
  //   modelAction = new THREE.AnimationMixer(fbx);
  //   const action = modelAction.clipAction(fbx.animations[0]);
  //   action.play();
  // });

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.name = 'cube';
  cube.position.set(0, 1, 0);
  scene.add(cube);

  // 创建移动动画帧
  const positionKF = new THREE.VectorKeyframeTrack(
    "cube.position",
    [0, 1, 2, 3, 4],
    [0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0]
  );
  // x轴旋转 0, 90, 0
  const quaternion = new THREE.Quaternion();
  // quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
  quaternion.setFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
  const quaternion2 = new THREE.Quaternion();
  // quaternion2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  quaternion2.setFromEuler(new THREE.Euler(Math.PI, 0, 0, 'XYZ'));
  const quaternion3 = new THREE.Quaternion();
  // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
  quaternion3.setFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
  const finQ = quaternion
    .toArray()
    .concat(quaternion2.toArray())
    .concat(quaternion3.toArray());
  // 旋转动画帧
  const rotationKF = new THREE.QuaternionKeyframeTrack(
    "cube.quaternion",
    [0, 2, 4],
    finQ
  );
  // 闪烁动画
  const boolKF = new THREE.BooleanKeyframeTrack(
    "cube.visible",
    [0, 1, 2, 3, 4],
    [true, false, true, false, true]
  );
  // 变色动画
  const colorKF = new THREE.ColorKeyframeTrack(
    "cube.material.color",
    [0, 2, 4],
    [1, 0, 1, 1, 1, 0, 1, 0, 1]
  );
  // 变换透明度动画,可以来改属性的单个值
  const opacityKF = new THREE.NumberKeyframeTrack(
    "cube.material.opacity",
    [0, 1, 2, 3, 4],
    [1, 0.1, 1, 0.1, 1]
  );
  // mixer
  let mixer = new THREE.AnimationMixer(cube);
  // 创建动画剪辑,名称move,时间2s
  let clip = new THREE.AnimationClip(
    "move",
    4,
    [positionKF, rotationKF, colorKF, opacityKF]
  );
  // 创建动画动作
  const action = mixer.clipAction(clip);
  action.play();
  // action.stop();

  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    },
    stop() {
      // mixer.stopAllAction();
      action.stop();
    },
    play(){
      action.play();
      // 在2秒的动画位置开始播放
      mixer.setTime(2);
    }
  };

  gui.add(eventObj, 'Fullscreen');
  gui.add(eventObj, 'ExitFullscreen');
  gui.add(eventObj, 'stop').name('停止动画');
  gui.add(eventObj, 'play').name('播放动画');
  gui.add(mixer, 'timeScale').name('播放速度');

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    let delta = clock.getDelta();
    if (mixer) {
      mixer.update(delta);
    }
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test7.current) {
      test7.current.appendChild(stats.dom);
      test7.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test7}></div>
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