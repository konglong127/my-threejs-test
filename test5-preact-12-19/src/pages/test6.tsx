import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test6() {
  const test6 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1,
    speed: 1,
  };

  const water = new Water(
    new THREE.PlaneGeometry(10, 10, 1024, 1024),
    {
      color: params.color,
      scale: params.scale,
      flowDirection: new THREE.Vector2(params.flowX, params.flowY),// 水流方向
      textureWidth: 512, // 水流贴图宽度
      textureHeight: 512, // 水流贴图高度
      // flowSpeed: 1, // 水流速度
      // flowMap: new THREE.TextureLoader().load("../../public/texture/Water_1_M_Flow.jpg", function (texture) {
      //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      // }), // 水流方向贴图
      normalMap0: new THREE.TextureLoader().load('../../public/texture/Water_1_M_Normal.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }), // 水流贴图1
      normalMap1: new THREE.TextureLoader().load('../../public/texture/Water_1_M_Normal.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }), // 水流贴图2
    }
  );
  water.rotation.x = - Math.PI / 2;
  water.position.y = 0.1; // 水面高度
  scene.add(water);

  // 加载浴缸
  // const gltfLoader = new GLTFLoader();
  // gltfLoader.load("../../public/model/yugang.glb", (gltf) => {
  //   console.log(gltf);
  //   const yugang = gltf.scene.children[0] as THREE.Mesh;
  //   (yugang.material as THREE.Material).side = THREE.DoubleSide;

  //   const waterGeometry = (gltf.scene.children[1] as any).geometry;
  //   const water = new Water(waterGeometry, {
  //     color: "#ffffff",
  //     scale: 1,
  //     flowDirection: new THREE.Vector2(1, 1),
  //     textureHeight: 1024,
  //     textureWidth: 1024,
  //     normalMap0: new THREE.TextureLoader().load('../../public/texture/Water_1_M_Normal.jpg', function (texture) {
  //       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //     }),
  //     normalMap1: new THREE.TextureLoader().load('../../public/texture/Water_1_M_Normal.jpg', function (texture) {
  //       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //     })
  //   });

  //   scene.add(water);
  //   scene.add(yugang);
  // });

  // const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  // directionalLight.position.set(- 1, 1, 1);
  // scene.add(directionalLight);

  // 加载场景背景
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync("../../public/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;

    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.anisotropy = 16;
    // texture.repeat.set(4, 4);
    // texture.colorSpace = THREE.SRGBColorSpace;
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
  // gui.addColor(params, 'color').onChange(function (value) {
  //   water.material.uniforms['color'].value.set(value);
  // });
  // gui.add(params, 'scale', 1, 10).onChange(function (value) {
  //   water.material.uniforms['config'].value.w = value;
  // });
  // gui.add(params, 'flowX', - 1, 1).step(0.01).onChange(function (value) {
  //   water.material.uniforms['flowDirection'].value.x = value;
  //   water.material.uniforms['flowDirection'].value.normalize();
  // });
  // gui.add(params, 'flowY', - 1, 1).step(0.01).onChange(function (value) {
  //   water.material.uniforms['flowDirection'].value.y = value;
  //   water.material.uniforms['flowDirection'].value.normalize();
  // });

  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');

  // const clock = new THREE.Clock();
  function animate() {
    // const elapsedTime = clock.getElapsedTime();

    stats.update();
    controls.update();
    camera.updateMatrixWorld();
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
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
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
  gridHelper.material.opacity = 0.3;
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
