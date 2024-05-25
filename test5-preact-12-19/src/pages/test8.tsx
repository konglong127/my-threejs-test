import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import vertexShader from "../shader/flylight/vertex";
import fragmentShader from "../shader/flylight/fragment";
// import { Water } from 'three/addons/objects/Water2.js';
import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
import gsap from "gsap";
import Fireworks from "./firework";

export default function Test8() {
  const test8 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // 设置创建烟花函数
  const fireworks:Fireworks[] = [];
  let createFireworks = () => {
    let color = `hsl(${Math.floor(Math.random() * 360)},100%,80%)`;
    let position = {
      x: (Math.random() - 0.5) * 40,
      z: -(Math.random() - 0.5) * 40,
      y: 15 + Math.random() * 10,
    };

    // 随机生成颜色和烟花放的位置
    let firework = new Fireworks(color, position);
    firework.addScene(scene, camera);
    fireworks.push(firework);
  };
  // 监听点击事件
 

  /* ------------------- 导入建筑模型 ---------------------- */
  const gltfLoader = new GLTFLoader();
  let LightBox = null, water: Water | null = null;
  gltfLoader.load("../../public/model/newyears_min.glb", (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    //   创建水面
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    water = new Water(waterGeometry, {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: new THREE.TextureLoader().load('../../public/texture/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    });
    water.position.y = 1;
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
  });

  /* ------------------- 创建孔明灯 ---------------------- */
  // 创建着色器材质;
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {},
    side: THREE.DoubleSide,
    //   transparent: true,
  });
  gltfLoader.load("../../public/model/flyLight.glb", (gltf) => {
    console.log(gltf);

    LightBox = gltf.scene.children[0];
    (LightBox as any).material = shaderMaterial;

    for (let i = 0; i < 40; i++) {
      let flyLight = gltf.scene.clone(true);
      let x = (Math.random() - 0.5) * 120;
      let z = (Math.random() - 0.5) * 120;
      let y = Math.random() * 60 + 5;
      flyLight.position.set(x, y, z);
      gsap.to(flyLight.rotation, {
        y: 2 * Math.PI,
        duration: 10 + Math.random() * 30,
        repeat: -1,
      });
      gsap.to(flyLight.position, {
        x: "+=" + Math.random() * 5,
        y: "+=" + Math.random() * 20,
        yoyo: true,
        duration: 5 + Math.random() * 10,
        repeat: -1,
      });
      scene.add(flyLight);
    }
  });

  /* ------------------- 创建天空盒子 ---------------------- */
  // 加载场景背景
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync("../../public/2k.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

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
    // const elapsedTime = clock.getElapsedTime();
    if (water) {
      water.material.uniforms['time'].value += 1.0 / 300.0;
    }
    fireworks.forEach((item, i) => {
      const type = item.update();
      if (type == "remove") {
        fireworks.splice(i, 1);
      }
    });

    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test8.current) {
      test8.current.appendChild(stats.dom);
      test8.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      window.addEventListener("click", createFireworks);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener("click", createFireworks);
    }
  });

  return (<>
    <div ref={test8}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(30, 30, 30);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setPixelRatio( window.devicePixelRatio );
  // renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.4; // 通过曝光数值控制灯光
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

  // 平行光
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
