import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import * as CANNON from "cannon-es";
import basicVertexShader from "../shader/basic/vertex";
import basicFragmentShader from "../shader/basic/fragment";
import rawVertexShader from "../shader/raw/vertex";
import rawFragmentShader from "../shader/raw/fragment";
import deepVertexShader from "../shader/deep/vertex";
import deepFragmentShader from "../shader/deep/fragment";

export default function Test2() {
  const test2 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  /* 
  // 创建着色器
  const shaderMaterial2 = new THREE.RawShaderMaterial({
    vertexShader: rawBasicVertexShader, // 顶点着色器
    fragmentShader: rawFragmentVertexShader, // 片元着色器,vec4 rgba
    side: THREE.DoubleSide, // 双面渲染
  });
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: basicVertexShader, // 顶点着色器
    fragmentShader: fragmentVertexShader, // 片元着色器,vec4 rgba
    side: THREE.DoubleSide, // 双面渲染
  });

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  plane.castShadow = true;
  scene.add(plane); 
  */

  // 创建纹理加载器对象
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("../../public/ca.jpeg");
  const params = {
    uFrequency: 10,
    uScale: 0.1,
  };

  // const material = new THREE.MeshBasicMaterial({ color: "#00ff00" });
  // 创建原始着色器材质,不会在glsl中自动添加常用变量
  const rawShaderMaterial = new THREE.RawShaderMaterial({
    // vertexShader: rawVertexShader,
    // fragmentShader: rawFragmentShader,
    vertexShader: deepVertexShader,
    fragmentShader: deepFragmentShader,
    //   wireframe: true,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uTime: {
        value: 0,
      },
      uTexture: {
        value: texture,
      },
    },
  });

  // 创建平面
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 64, 64),
    rawShaderMaterial
  );

  console.log(floor);
  scene.add(floor);

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

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    // let delta = clock.getDelta(); // 动画帧时间差
    // if (mixer) {
    //   mixer.update(delta);
    // }
    // pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    const elapsedTime = clock.getElapsedTime();
    //   console.log(elapsedTime);
    rawShaderMaterial.uniforms.uTime.value = elapsedTime * 0.008;
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test2.current) {
      test2.current.appendChild(stats.dom);
      test2.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test2}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 1, 0);

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

  return { scene, renderer, camera, ambientLight, ResizeWindow };
}
