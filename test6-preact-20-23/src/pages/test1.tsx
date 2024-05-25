import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass, DotScreenPass, CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";


export default function Test11() {
  const test13 = useRef<HTMLDivElement | null>(null);
  const { scene, labelRenderer, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, labelRenderer.domElement); // control
  const gui = new GUI(); // 调试
  const textureLoader = new THREE.TextureLoader();
  const raycaster = new THREE.Raycaster();
  const EARTH_RADIUS = 1;
  const MOON_RADIUS = 0.27;

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 5,
    map: textureLoader.load("../../public/texture/planets/earth_atmos_2048.jpg"),
    specularMap: textureLoader.load("../../public/texture/planets/earth_specular_2048.jpg"),
    normalMap: textureLoader.load("../../public/texture/planets/earth_normal_2048.jpg"),
    normalScale: new THREE.Vector2(0.85, 0.85),
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  // earth.rotation.y = Math.PI;
  scene.add(earth);

  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
  const moonMaterial = new THREE.MeshPhongMaterial({
    shininess: 5,
    map: textureLoader.load("../../public/texture/planets/moon_1024.jpg"),
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  // 地球标签
  const earthDiv = document.createElement('div');
  earthDiv.className = "label";
  earthDiv.innerHTML = "地球";
  const earthLabel = new CSS2DObject(earthDiv);
  earthLabel.position.set(0, 1, 0);
  earth.add(earthLabel);

  // 中国标签
  const chinaDiv = document.createElement('div');
  chinaDiv.className = "label1";
  chinaDiv.innerHTML = "中国";
  const chinaLabel = new CSS2DObject(chinaDiv);
  chinaLabel.position.set(-0.3, 0.5, -0.9);
  earth.add(chinaLabel);
  console.log(chinaLabel)

  // 月球标签
  const moonDiv = document.createElement('div');
  moonDiv.className = "label";
  moonDiv.innerHTML = "月球";
  const moonLabel = new CSS2DObject(moonDiv);
  moonLabel.position.set(0, 0.3, 0);
  moon.add(moonLabel);



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

  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');
  const clock = new THREE.Clock();
  function animate() {
    const elapsed = clock.getElapsedTime();
    moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

    const chinaPosition = chinaLabel.position.clone();
    // 计算出标签跟摄像机的距离
    const labelDistance = chinaPosition.distanceTo(camera.position);
    // 检测射线的碰撞
    // chinaLabel.position
    // 向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间。
    chinaPosition.project(camera);
    raycaster.setFromCamera(chinaPosition as any, camera);

    const intersects = raycaster.intersectObjects(scene.children, true)
    // console.log(intersects)

    // 如果没有碰撞到任何物体，那么让标签显示
    if (intersects.length == 0) {
      chinaLabel.element.classList.add('visible');

    } else {
      const minDistance = intersects[0].distance;
      // console.log(minDistance, labelDistance)
      if (minDistance < labelDistance) {
        chinaLabel.element.classList.remove('visible');
      } else {
        chinaLabel.element.classList.add('visible');
      }

    }


    // 标签渲染器渲染
    labelRenderer.render(scene, camera);

    stats.update();
    controls.update();
    camera.updateMatrixWorld();

    // renderer重复渲染会导致composer效果失效
    renderer.render(scene, camera);
    // effectComposer.render();
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test13.current) {
      test13.current.appendChild(stats.dom);
      test13.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test13}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(3, 5, 5);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 实例化css2d的渲染器
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(labelRenderer.domElement)
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.left = '0px';
  labelRenderer.domElement.style.zIndex = '10';

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
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
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

  return { scene, labelRenderer, renderer, camera, ambientLight, ResizeWindow };
}
