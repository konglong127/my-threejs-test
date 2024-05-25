import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test10() {
  const test10 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

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
  scene.environment = envMapTexture;
  scene.background = envMapTexture;

  const textureLoader = new THREE.TextureLoader();
  // 加载模型纹理
  const modelTexture = textureLoader.load("../../public/model/LeePerrySmith/color.jpg");
  // 加载模型的法向纹理
  const normalTexture = textureLoader.load("../../public/model/LeePerrySmith/normal.jpg");

  const material = new THREE.MeshStandardMaterial({
    map: modelTexture,
    normalMap: normalTexture,
  });
  const customUniforms = {
    uTime: {
      value: 0,
    },
  };
  material.onBeforeCompile = (shader) => {
    console.log(shader.vertexShader);
    console.log(shader.fragmentShader);
    // 传递时间
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      mat2 rotate2d(float _angle){
        return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
      }
      uniform float uTime;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      #include <beginnormal_vertex>
      float angle = sin(position.y+uTime) *0.5;
      mat2 rotateMatrix = rotate2d(angle);
      
      objectNormal.xz = rotateMatrix * objectNormal.xz;
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      // float angle = transformed.y*0.5;
      // mat2 rotateMatrix = rotate2d(angle);
      
      transformed.xz = rotateMatrix * transformed.xz;
      `
    );
  };

  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
  });

  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      mat2 rotate2d(float _angle){
        return mat2(cos(_angle),-sin(_angle),
                    sin(_angle),cos(_angle));
      }
      uniform float uTime;
    `
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      float angle = sin(position.y+uTime) *0.5;
      mat2 rotateMatrix = rotate2d(angle);
      
      transformed.xz = rotateMatrix * transformed.xz;
      `
    );
    console.log("depthMaterial", shader.vertexShader);
  };

  // 模型加载
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("../../public/model/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
    // console.log(gltf)
    const mesh = gltf.scene.children[0];
    console.log(mesh);
    mesh.material = material;
    mesh.castShadow = true;
    // 设定自定义的深度材质
    // mesh.customDepthMaterial = depthMaterial;
    scene.add(mesh);
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({color:0xffffff})
  );
  plane.position.set(0, 0, -6);
  plane.receiveShadow = true;
  scene.add(plane);


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


    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test10.current) {
      test10.current.appendChild(stats.dom);
      test10.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test10}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 20, 20);
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

  // scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ambientLight, ResizeWindow };
}
