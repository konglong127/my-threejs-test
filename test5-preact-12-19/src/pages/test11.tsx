import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass, DotScreenPass } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";


export default function Test11() {
  const test11 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // // 创建纹理加载器对象
  // const textureLoader = new THREE.TextureLoader();

  // 添加环境纹理
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const envMapTexture = cubeTextureLoader.load([
    "../../public/texture/environmentMaps/0/px.jpg",
    "../../public/texture/environmentMaps/0/nx.jpg",
    "../../public/texture/environmentMaps/0/py.jpg",
    "../../public/texture/environmentMaps/0/ny.jpg",
    "../../public/texture/environmentMaps/0/pz.jpg",
    "../../public/texture/environmentMaps/0/nz.jpg",
  ]);
  scene.background = envMapTexture;
  scene.environment = envMapTexture;

  // 模型加载
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('../../public/model/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
    console.log(gltf)
    // scene.add(gltf.scene)
    const mesh = gltf.scene.children[0];

    scene.add(mesh)
  })

  scene.add(new THREE.AmbientLight(0xcccccc));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(1, 1, 1);
  scene.add(light);

  // 创建一个渲染器
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // 黑白点效果
  // const dotScreenPass = new DotScreenPass();
  // dotScreenPass.enabled = true;
  // composer.addPass(dotScreenPass);

  // 黑白点效果2,通过ShaderPass自定义实现
  // const effect1 = new ShaderPass(DotScreenShader);
  // effect1.uniforms['scale'].value = 4;
  // composer.addPass(effect1);

  // const effect2 = new ShaderPass(RGBShiftShader);
  // effect2.uniforms['amount'].value = 0.0015;
  // composer.addPass(effect2);

  // const effect3 = new OutputPass();
  // composer.addPass(effect3);

  // 抗锯齿
  // const smaaPass = new SMAAPass(100, 100);
  // composer.addPass(smaaPass);

  // 屏幕闪动
  // const glitchPass = new GlitchPass();
  // composer.addPass(glitchPass);

  // 发光效果,可以用来加亮场景
  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0, 1);
  composer.addPass(unrealBloomPass);

  // unrealBloomPass.exposure = 1;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  unrealBloomPass.strength = 1;
  unrealBloomPass.radius = 0;
  unrealBloomPass.threshold = 1;

  gui.add(renderer,'toneMappingExposure').min(0).max(100).step(0.01);
  gui.add(unrealBloomPass,'strength').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass,'radius').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass,'threshold').min(0).max(2).step(0.01);

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
  renderer.render(scene, camera);
  const clock = new THREE.Clock();
  function animate() {
    // const elapsedTime = clock.getElapsedTime();
    composer.setSize(window.innerWidth, window.innerHeight);
    // composer.setPixelRatio(window.devicePixelRatio);
    composer.render();
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    // renderer重复渲染会导致composer效果失效
    // renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test11.current) {
      test11.current.appendChild(stats.dom);
      test11.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test11}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(3, 5, 5);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

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
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.1;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);

  // 点光影
  // let pointLight = new THREE.PointLight(0xffffff, 100000, 20);
  // pointLight.position.set(0, 10, 0);
  // pointLight.castShadow = true;
  // pointLight.decay = 2;
  // pointLight.shadow.mapSize.width = 1024; // default
  // pointLight.shadow.mapSize.height = 1024; // default
  // pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  // scene.add(pointLight);

  // // 平行光
  // let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight
  //   .position
  //   .set(20, 20, 20)
  // // .normalize()
  // // .multiplyScalar(- 200);
  // // 修改照射目标位置
  // directionalLight.target.position.set(0, 0, 0);
  // // 平行光可以投射阴影
  // directionalLight.castShadow = true;
  // scene.add(directionalLight);
  // // 平行光阴影范围
  // directionalLight.shadow.camera.left = -20;//默认-5
  // directionalLight.shadow.camera.right = 20;//默认-5
  // directionalLight.shadow.camera.top = 20;//默认-5,远处
  // directionalLight.shadow.camera.bottom = -20;//默认-5
  // directionalLight.shadow.camera.near = 0.1;//默认0.5
  // directionalLight.shadow.camera.far = 200;//默认50,多远
  // directionalLight.shadow.mapSize.width = 1024;//默认512
  // directionalLight.shadow.mapSize.height = 1024;//默认512
  // directionalLight.shadow.bias = -0.01; // 去除模糊
  // // 平行光辅助器
  // let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  // scene.add(directionalLightHelper);

  // scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ambientLight, ResizeWindow };
}
