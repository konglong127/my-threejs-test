import { useRef, useEffect, useState } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass, DotScreenPass, CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
import gsap from "gsap";
import React from "preact/compat";
import RoomShapeMesh from "../threeMesh/RoomShapeMesh";
import WallShaderMaterial from "../threeMesh/WallShaderMaterial";
import Wall from "../threeMesh/Wall";
import obj from "./demo.json";

export default function Test5() {
  const test5 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, composer, unrealBloomPass, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  // const controls = new OrbitControls(camera, labelRenderer.domElement); // control
  // const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试
  const tagDiv = useRef<HTMLDivElement | null>(null);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  console.log(obj);

  let panoramaLocation: any;
  let idToPanorama = {};
  // 循环创建房间
  for (let i = 0; i < obj.objData.roomList.length; i++) {
    // 获取房间数据
    const room = obj.objData.roomList[i];
    let roomMesh = new RoomShapeMesh(room);
    let roomMesh2 = new RoomShapeMesh(room, true);
    scene.add(roomMesh, roomMesh2);
    panoramaLocation = obj.panoramaLocation;
    // 房间到全景图的映射
    for (let j = 0; j < obj.panoramaLocation.length; j++) {
      const panorama = obj.panoramaLocation[j];
      if (panorama.roomId === room.roomId) {
        let material = WallShaderMaterial(panorama as any);
        (panorama as any).material = material;
        (idToPanorama as any)[room.roomId] = panorama;
      }
    }

    //

    roomMesh.material = (idToPanorama as any)[room.roomId].material;
    (roomMesh.material as any).side = THREE.DoubleSide;
    roomMesh2.material = (idToPanorama as any)[room.roomId].material.clone();
    (roomMesh2.material as any).side = THREE.FrontSide;

    console.log(idToPanorama);
  }

  // 创建墙
  for (let i = 0; i < obj.wallRelation.length; i++) {
    let wallPoints = obj.wallRelation[i].wallPoints;
    let faceRelation = obj.wallRelation[i].faceRelation;

    faceRelation.forEach((item: any) => {
      item.panorama = (idToPanorama as any)[item.roomId];
    });

    let mesh = new Wall(wallPoints, faceRelation);
    scene.add(mesh);
  }

  let roomIndex = 0;
  let timeline = gsap.timeline();
  let dir = new THREE.Vector3();
  function changeRoom() {
    let room = panoramaLocation[roomIndex];
    dir = camera.position
      .clone()
      .sub(
        new THREE.Vector3(
          room.point[0].x / 100,
          room.point[0].z / 100,
          room.point[0].y / 100
        )
      )
      .normalize();

    timeline.to(camera.position, {
      duration: 1,
      x: room.point[0].x / 100 + dir.x * 0.01,
      y: room.point[0].z / 100,
      z: room.point[0].y / 100 + dir.z * 0.01,
    });
    camera.lookAt(
      room.point[0].x / 100,
      room.point[0].z / 100,
      room.point[0].y / 100
    );
    controls.target.set(
      room.point[0].x / 100,
      room.point[0].z / 100,
      room.point[0].y / 100
    );
    roomIndex++;
    if (roomIndex >= panoramaLocation.length) {
      roomIndex = 0;
    }
  }

  function resetCamera(){
    camera.position.set(0, 2, 5.5);
    camera.lookAt(0,0,0);
    controls.target.set(0,0,0);
  }

  // 加载全景图
  const loader = new THREE.TextureLoader();
  const texture = loader.load("../../public/img/HdrSkyCloudy004_JPG_8K.jpg");
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    }
  };

  gui.add(eventObj, 'Fullscreen');
  gui.add(eventObj, 'ExitFullscreen');
  gui.add(renderer, 'toneMappingExposure').min(0).max(100).step(0.01);
  gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.01);

  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');
  // const clock = new THREE.Clock();
  function animate() {
    // const elapsed = clock.getElapsedTime();

    // 标签渲染器渲染
    // labelRenderer.render(scene, camera);
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    composer.render();
    // renderer重复渲染会导致composer效果失效
    // renderer.render(scene, camera);
    // effectComposer.render();
    requestAnimationFrame(animate);
  }

  let isMouseDown = false;
  const MouseDownEvent = () => {
    isMouseDown = true;
  }
  const MouseUpEvent = () => {
    isMouseDown = false;
  }
  const MouseMoveEvent = (evt: MouseEvent) => {
    if (!isMouseDown) return;
    camera.rotation.y += evt.movementX * 0.002;
    camera.rotation.x += evt.movementY * 0.002;
    // 修改相机旋转顺序
    camera.rotation.order = "YXZ";
  }

  useEffect(() => {
    if (test5.current) {
      test5.current.appendChild(stats.dom);
      test5.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      test5.current.addEventListener('mousedown', MouseDownEvent);
      test5.current.addEventListener('mouseup', MouseUpEvent);
      test5.current.addEventListener('mouseout', MouseUpEvent);
      test5.current.addEventListener('mousemove', MouseMoveEvent);
      animate();
    }
    if (tagDiv.current) {
      tagDiv.current.style.cssText = `transform:translate(100px,110px)`;
    }
    return () => {
      if (test5.current) {
        window.removeEventListener('resize', ResizeWindow);
        test5.current.removeEventListener('mousedown', MouseDownEvent);
        test5.current.removeEventListener('mouseup', MouseUpEvent);
        test5.current.removeEventListener('mouseout', MouseUpEvent);
        test5.current.removeEventListener('mousemove', MouseMoveEvent);
      }
    }
  });

  return (<>
    <button class="btn">
      <button onClick={changeRoom}>toggle</button>
      <button onClick={resetCamera}>reset</button>
    </button>
    <div className={'canvas-container'} ref={test5}></div>
  </>);
}


function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  // camera.position.set(0, 0, 0);
  camera.position.set(0, 2, 5.5);
  // camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; //开启阴影
  // renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 创建一个渲染器
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // 发光效果,可以用来加亮场景
  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0, 1);
  composer.addPass(unrealBloomPass);
  unrealBloomPass.strength = 1;
  unrealBloomPass.radius = 0;
  unrealBloomPass.threshold = 1;

  // 实例化css2d的渲染器
  // const labelRenderer = new CSS2DRenderer();
  // labelRenderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(labelRenderer.domElement)
  // labelRenderer.domElement.style.position = 'fixed';
  // labelRenderer.domElement.style.top = '0px';
  // labelRenderer.domElement.style.left = '0px';
  // labelRenderer.domElement.style.zIndex = '10';

  // 初始化渲染器
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // 色调映射toneMapping
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMapping = THREE.LinearToneMapping;
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMapping = THREE.CineonToneMapping;

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.1;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // 点光影
  // let pointLight = new THREE.PointLight(0xffffff, 100000, 20);
  // pointLight.position.set(0, 10, 0);
  // pointLight.castShadow = true;
  // pointLight.decay = 2;
  // pointLight.shadow.mapSize.width = 1024; // default
  // pointLight.shadow.mapSize.height = 1024; // default
  // pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  // scene.add(pointLight);

  // 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight
    .position
    .set(20, 20, 20)
  // .normalize()
  // .multiplyScalar(- 200);
  // 修改照射目标位置
  directionalLight.target.position.set(0, 0, 0);
  // 平行光可以投射阴影
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  // 平行光阴影范围
  directionalLight.shadow.camera.left = -20;//默认-5
  directionalLight.shadow.camera.right = 20;//默认-5
  directionalLight.shadow.camera.top = 20;//默认-5,远处
  directionalLight.shadow.camera.bottom = -20;//默认-5
  directionalLight.shadow.camera.near = 0.1;//默认0.5
  directionalLight.shadow.camera.far = 200;//默认50,多远
  directionalLight.shadow.mapSize.width = 1024;//默认512
  directionalLight.shadow.mapSize.height = 1024;//默认512
  directionalLight.shadow.bias = -0.01; // 去除模糊
  // 平行光辅助器
  let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(directionalLightHelper);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, composer, unrealBloomPass, camera, ambientLight, ResizeWindow };
}
