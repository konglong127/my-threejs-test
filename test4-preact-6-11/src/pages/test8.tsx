import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test8() {
  const test8 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  let mixer: THREE.AnimationMixer | null = null;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("../../public/draco");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  let actions: { [key: string]: THREE.AnimationAction | null } = { current: null };
  gltfLoader.load("../../public/model/man/Xbot.glb", (gltf) => {
    gltf.scene.scale.set(3, 3, 3);
    scene.add(gltf.scene);
    console.log(gltf);
    mixer = new THREE.AnimationMixer(gltf.scene);
    actions.agress = mixer.clipAction(gltf.animations[0]);
    actions.handShake = mixer.clipAction(gltf.animations[1]);
    actions.idle = mixer.clipAction(gltf.animations[2]);
    actions.run = mixer.clipAction(gltf.animations[3]);
    actions.sadPose = mixer.clipAction(gltf.animations[4]);
    actions.sneakPose = mixer.clipAction(gltf.animations[5]);
    actions.walk = mixer.clipAction(gltf.animations[6]);
    actions.current = mixer.clipAction(gltf.animations[2]);

    actions.current.play();
    gui.add(mixer, 'timeScale');
  });

  // let modelAction: THREE.AnimationMixer | null = null;
  // const fbxLoader = new FBXLoader();
  // fbxLoader.load("../../public/model/man/walk.fbx", (fbx) => {
  //   fbx.scale.set(0.02, 0.02, 0.02);
  //   scene.add(fbx);
  //   console.log(fbx);
  //   modelAction = new THREE.AnimationMixer(fbx);
  //   const action = modelAction.clipAction(fbx.animations[0]);
  //   action.play();
  // });

  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    },
    stopAll() {
      if (mixer) mixer.stopAllAction();
    },
    playAll() {
      if (mixer) {
        console.log(mixer);
        //同时播放多个动画
        (mixer as any)._actions.forEach((action: any) => {
          action.play();
        });
      }
    },
    playRun() {
      if (mixer && actions.run && actions.current) {
        actions.run.enabled = true;
        actions.run.setEffectiveTimeScale(1);
        actions.run.setEffectiveWeight(1);
        // 动画过度
        actions.current.crossFadeTo(actions.run, 0.5, true);
        actions.current = actions.run;
        actions.current.play();
      }
    },
    playAgress() {
      if (mixer && actions.agress && actions.current) {
        actions.agress.enabled = true;
        actions.agress.setEffectiveTimeScale(1);
        actions.agress.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.agress, 0.5, true);
        actions.current = actions.agress;
        actions.current.play();
      }
    },
    playHandShake() {
      if (mixer && actions.handShake && actions.current) {
        actions.handShake.enabled = true;
        actions.handShake.setEffectiveTimeScale(1);
        actions.handShake.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.handShake, 0.5, true);
        actions.current = actions.handShake;
        actions.current.play();
      }
    },
    playIdle() {
      if (mixer && actions.idle && actions.current) {
        actions.idle.enabled = true;
        actions.idle.setEffectiveTimeScale(1);
        actions.idle.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.idle, 0.5, true);
        actions.current = actions.idle;
        actions.current.play();
      }
    },
    playSadPose(){
      if (mixer && actions.sadPose && actions.current) {
        actions.sadPose.enabled = true;
        actions.sadPose.setEffectiveTimeScale(1);
        actions.sadPose.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.sadPose, 0.5, true);
        actions.current = actions.sadPose;
        actions.current.play();
      }
    },
    playSneakPose(){
      if (mixer && actions.sneakPose && actions.current) {
        actions.sneakPose.enabled = true;
        actions.sneakPose.setEffectiveTimeScale(1);
        actions.sneakPose.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.sneakPose, 0.5, true);
        actions.current = actions.sneakPose;
        actions.current.play();
      }
    },
    playWalk() {
      if (mixer && actions.walk && actions.current) {
        actions.walk.enabled = true;
        actions.walk.setEffectiveTimeScale(1);
        actions.walk.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.walk, 0.5, true);
        actions.current = actions.walk;
        actions.current.play();
      }
    }
  };

  gui.add(eventObj, 'Fullscreen');
  gui.add(eventObj, 'ExitFullscreen');
  gui.add(eventObj, 'stopAll').name('stop all');
  gui.add(eventObj, 'playAll').name('play all');
  gui.add(eventObj, 'playRun').name('run');
  gui.add(eventObj, 'playWalk').name('walk');
  gui.add(eventObj, 'playAgress').name('agress');
  gui.add(eventObj, 'playIdle').name('idle');
  gui.add(eventObj, 'playSadPose').name('sad pose');
  gui.add(eventObj, 'playSneakPose').name('sneak pose');

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
    if (test8.current) {
      test8.current.appendChild(stats.dom);
      test8.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test8}></div>
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
