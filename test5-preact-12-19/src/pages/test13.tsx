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
  const test13 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // // 创建纹理加载器对象
  const textureLoader = new THREE.TextureLoader();

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

    scene.add(mesh);
  });

  // 合成效果
  const effectComposer = new EffectComposer(renderer);
  effectComposer.setSize(window.innerWidth, window.innerHeight);

  // 添加渲染通道
  const renderPass = new RenderPass(scene, camera);
  effectComposer.addPass(renderPass);

  // 点效果
  const dotScreenPass = new DotScreenPass();
  dotScreenPass.enabled = false;
  effectComposer.addPass(dotScreenPass);

  // 抗锯齿
  const smaaPass = new SMAAPass(100, 100);
  effectComposer.addPass(smaaPass);

  // 发光效果
  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0, 1);
  effectComposer.addPass(unrealBloomPass);

  // 屏幕闪动
  // const glitchPass = new GlitchPass();
  // effectComposer.addPass(glitchPass);

  // unrealBloomPass.exposure = 1;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  unrealBloomPass.strength = 1;
  unrealBloomPass.radius = 0;
  unrealBloomPass.threshold = 1;

  gui.add(renderer, 'toneMappingExposure').min(0).max(2).step(0.01)
  gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01)
  gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01)
  gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.01)

  const colorParams = {
    r: 0,
    g: 0,
    b: 0
  }

  // 着色器写渲染通道,设置着色器,动态调色
  const shaderPass = new ShaderPass(
    {
      uniforms: {
        tDiffuse: {
          value: null
        },
        uColor: {
          value: new THREE.Color(colorParams.r, colorParams.g, colorParams.b)
        }
      },
      vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
      fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec3 uColor;
      void main(){
        vec4 color = texture2D(tDiffuse,vUv);
        // gl_FragColor = vec4(vUv,0.0,1.0);
        color.xyz+=uColor;
        gl_FragColor = color;
      }
    `
    },
  );

  effectComposer.addPass(shaderPass);

  gui.add(colorParams, 'r').min(-1).max(1).step(0.01).onChange((value) => {
    shaderPass.uniforms.uColor.value.r = value;
  });
  gui.add(colorParams, 'g').min(-1).max(1).step(0.01).onChange((value) => {
    shaderPass.uniforms.uColor.value.g = value;
  });
  gui.add(colorParams, 'b').min(-1).max(1).step(0.01).onChange((value) => {
    shaderPass.uniforms.uColor.value.b = value;
  });

  const normalTexture = textureLoader.load('../../public/texture/environmentMaps/3/nx.jpg');

  const techPass = new ShaderPass({
    uniforms: {
      tDiffuse: {
        value: null
      },
      uNormalMap: {
        value: null
      },
      uTime: {
        value: 0
      }
    },
    vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    uniform float uTime;
    void main(){

      vec2 newUv = vUv;
      newUv += sin(newUv.x*10.0+uTime*0.5)*0.03;

      vec4 color = texture2D(tDiffuse,newUv);
      // gl_FragColor = vec4(vUv,0.0,1.0);
      vec4 normalColor = texture2D(uNormalMap,vUv);
      // 设置光线的角度
      vec3 lightDirection = normalize(vec3(-5,5,2)) ;

      float lightness = clamp(dot(normalColor.xyz,lightDirection),0.0,1.0) ;
      color.xyz+=lightness;
      gl_FragColor = color;
    }
  `
  })
  techPass.material.uniforms.uNormalMap.value = normalTexture;
  effectComposer.addPass(techPass);

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
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    const time = clock.getElapsedTime();
    techPass.material.uniforms.uTime.value = time;
    // renderer重复渲染会导致composer效果失效
    // renderer.render(scene, camera);
    effectComposer.render();
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
