import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import * as CANNON from "cannon-es";
import vertexShader from "../shader/water/vertex";
import fragmentShader from "../shader/water/fragment";
// import gsap from "gsap";

export default function Test4() {
  const test4 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  const params = {
    uWaresFrequency: 14,
    uScale: 0.03,
    uXzScale: 1.5,
    uNoiseFrequency: 10,
    uNoiseScale: 1.5,
    uLowColor: "#adf5ff",
    uHighColor: "#8aadff",
    uXspeed: 1,
    uZspeed: 1,
    uNoiseSpeed: 1,
    uOpacity: 1,
    uTime: 0,
  };
  
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uWaresFrequency: {
        value: params.uWaresFrequency,
      },
      uScale: {
        value: params.uScale,
      },
      uNoiseFrequency: {
        value: params.uNoiseFrequency,
      },
      uNoiseScale: {
        value: params.uNoiseScale,
      },
      uXzScale: {
        value: params.uXzScale,
      },
      uTime: {
        value: params.uTime,
      },
      uLowColor: {
        value: new THREE.Color(params.uLowColor),
      },
      uHighColor: {
        value: new THREE.Color(params.uHighColor),
      },
      uXspeed: {
        value: params.uXspeed,
      },
      uZspeed: {
        value: params.uZspeed,
      },
      uNoiseSpeed: {
        value: params.uNoiseSpeed,
      },
      uOpacity: {
        value: params.uOpacity,
      },
    },
    transparent: true,
  });
  
  gui
    .add(params, "uWaresFrequency")
    .min(1)
    .max(100)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uWaresFrequency.value = value;
    });
  
  gui
    .add(params, "uScale")
    .min(0)
    .max(0.2)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uScale.value = value;
    });
  
  gui
    .add(params, "uNoiseFrequency")
    .min(1)
    .max(100)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseFrequency.value = value;
    });
  
  gui
    .add(params, "uNoiseScale")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseScale.value = value;
    });
  
  gui
    .add(params, "uXzScale")
    .min(0)
    .max(5)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uXzScale.value = value;
    });
  
  gui.addColor(params, "uLowColor").onFinishChange((value) => {
    shaderMaterial.uniforms.uLowColor.value = new THREE.Color(value);
  });
  gui.addColor(params, "uHighColor").onFinishChange((value) => {
    shaderMaterial.uniforms.uHighColor.value = new THREE.Color(value);
  });
  
  gui
    .add(params, "uXspeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uXspeed.value = value;
    });
  
  gui
    .add(params, "uZspeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uZspeed.value = value;
    });
  
  gui
    .add(params, "uNoiseSpeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseSpeed.value = value;
    });
  
  gui
    .add(params, "uOpacity")
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((value) => {
      shaderMaterial.uniforms.uOpacity.value = value;
    });
  
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1024, 1024),
    shaderMaterial
  );
  plane.rotation.x = -Math.PI / 2;
  
  scene.add(plane);

  // 创建纹理加载器对象
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
    const elapsedTime = clock.getElapsedTime();
    shaderMaterial.uniforms.uTime.value = elapsedTime;

    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test4.current) {
      test4.current.appendChild(stats.dom);
      test4.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test4}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 初始化渲染器
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // 色调映射toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMapping = THREE.LinearToneMapping;
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMapping = THREE.CineonToneMapping;
  renderer.toneMappingExposure = 0.2; // 曝光程度

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
