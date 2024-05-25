import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass, DotScreenPass, CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";


export default function Test3() {
  const test3 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, composer, unrealBloomPass, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  // const controls = new OrbitControls(camera, labelRenderer.domElement); // control
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试
  const textureLoader = new THREE.TextureLoader();

 
  
  
  let params = {
    value0: 0,
    value1: 0,
  };
  // 加载压缩的glb模型
  let material = null;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("../../public/draco/gltf/");
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.preload();
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  let mixer;
  let stem, petal, stem1, petal1, stem2, petal2, stem3, petal3;
  gltfLoader.load("../../public/model/f4.glb", function (gltf) {
    console.log(gltf);
    gltf.scene.rotation.x = Math.PI;
    gltf.scene.traverse((item) => {
      if (item.material && item.material.name == "Water") {
        console.log(item);
        // item.renderOrder = 9;
        // item.material.blending = THREE.AdditiveBlending;
        // item.scale.set(0.8, 0.8, 0.8);
        // item.material.depthTest = false;

        // // item.material.transparent = false;
        // item.material.depthWrite = true;
        // item.material.side = THREE.DoubleSide;
        // item.material = new THREE.MeshBasicMaterial({
        //   color: "skyblue",
        //   depthWrite: false,
        //   depthTest: false,
        //   transparent: true,
        //   opacity: 0.7,
        // });

        item.material = new THREE.MeshStandardMaterial({
          color: "skyblue",
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 0.7,
        });
      }
      if (item.material && item.material.name == "Stem") {
        stem = item;
      }

      if (item.material && item.material.name == "Petal") {
        console.log(item);
        petal = item;

        gltfLoader.load("../../public/model/f2.glb", (gltf) => {
          gltf.scene.traverse((item) => {
            if (item.material && item.material.name == "Petal") {
              petal1 = item;
              // console.log(petal1.geometry.attributes.position);
              if (!petal.geometry.morphAttributes.position) {
                petal.geometry.morphAttributes.position = [];
              }
              petal.geometry.morphAttributes.position[0] =
                petal1.geometry.attributes.position;

              console.log(petal.morphTargetInfluences);
              petal.updateMorphTargets();
              petal.morphTargetInfluences[0] = 1;
              console.log(petal.geometry.morphAttributes);

              gsap.to(params, {
                value0: 1,
                duration: 10,
                // repeat: -1,
                delay: 0,
                onUpdate: function () {
                  petal.morphTargetInfluences[0] = params.value0;
                  stem.morphTargetInfluences[0] = params.value0;
                },
              });
            }
            if (item.material && item.material.name == "Stem") {
              stem1 = item;
              if (!stem.geometry.morphAttributes.position) {
                stem.geometry.morphAttributes.position = [];
              }
              stem.geometry.morphAttributes.position[0] =
                stem1.geometry.attributes.position;
              stem.updateMorphTargets();
              stem.morphTargetInfluences[0] = 1;
            }
          });

          gltfLoader.load("../../public/model/f1.glb", (gltf) => {
            gltf.scene.traverse((item) => {
              if (item.material && item.material.name == "Petal") {
                petal2 = item;

                // console.log(petal1.geometry.attributes.position);
                petal.geometry.morphAttributes.position[1] = petal2.geometry.attributes.position;
                console.log(petal.morphTargetInfluences);
                petal.updateMorphTargets();
                petal.morphTargetInfluences[1] = 0;
                console.log(petal.geometry.morphAttributes);

                gsap.to(params, {
                  value1: 1,
                  duration: 10,
                  delay: 10,
                  // repeat: -1,
                  onUpdate: function () {
                    // console.log(petal.morphTargetInfluences);
                    console.log(stem.morphTargetInfluences);
                    petal.morphTargetInfluences[0] = params.value0;
                    stem.morphTargetInfluences[0] = params.value0;
                    petal.morphTargetInfluences[1] = params.value1;
                    stem.morphTargetInfluences[1] = params.value1;
                  },
                });
              }
              if (item.material && item.material.name == "Stem") {
                stem2 = item;

                stem.geometry.morphAttributes.position[1] =
                  stem2.geometry.attributes.position;
                stem.updateMorphTargets();
                stem.morphTargetInfluences[1] = 0;
              }
            });
          });
        });
      }
    });
    scene.add(gltf.scene);
  });




  const loader = new RGBELoader();
  loader.load("../../public/texture/038.hdr", function (texture) {
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

  useEffect(() => {
    if (test3.current) {
      test3.current.appendChild(stats.dom);
      test3.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test3}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(3, 5, 5);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; //开启阴影
  // renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
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
