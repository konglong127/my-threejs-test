// 导入threejs
import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45, // 视角
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近平面
  1000 // 远平面
);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 开启抗锯齿
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 15;
// camera.position.y = 2;
// camera.position.x = 2;
camera.lookAt(0, 0, 0);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;
// 设置旋转速度
// controls.autoRotate = true;

// 渲染函数
function animate() {
  controls.update();
  requestAnimationFrame(animate);
  // 渲染
  renderer.render(scene, camera);
}
animate();

// 监听窗口变化
window.addEventListener("resize", () => {
  // 重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
});

let eventObj = {
  Fullscreen: function () {
    // 全屏
    document.body.requestFullscreen();
    console.log("全屏");
  },
  ExitFullscreen: function () {
    document.exitFullscreen();
    console.log("退出全屏");
  },
};

// rgbeLoader 加载hdr贴图
let rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "./texture/opt/memorial/Alex_Hart-Nature_Lab_Bones_2k.hdr",
  (envMap) => {
    // 设置球形贴图
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    // 设置环境贴图
    scene.background = envMap;
    // 设置环境贴图
    scene.environment = envMap;
    // plane.material.map = envMap;
  }
);

// 创建GUI
const gui = new GUI();

// 创建平面
let spriteTexture = new THREE.TextureLoader().load("./texture/sprite0.png");
spriteTexture.colorSpace = THREE.SRGBColorSpace;
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: spriteTexture,
  side: THREE.DoubleSide,
  transparent: true,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.visible = false;
plane.renderOrder = 0;
scene.add(plane);

// 设置深度模式
plane.material.depthFunc = THREE.LessEqualDepth;
plane.material.depthWrite = true;
plane.material.depthTest = true;

let material = plane.material;
material.blending = THREE.CustomBlending;
material.blendEquationAlpha = THREE.AddEquation;
material.blendSrcAlpha = THREE.OneFactor;
material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

// 设置混合方程式 最终颜色 = 源颜色 * 源因子 + 目标颜色 * 目标因子

// gui
gui
  .add(material, "blending", {
    NoBlending: THREE.NoBlending,
    NormalBlending: THREE.NormalBlending,
    AdditiveBlending: THREE.AdditiveBlending,
    SubtractiveBlending: THREE.SubtractiveBlending,
    MultiplyBlending: THREE.MultiplyBlending,
    CustomBlending: THREE.CustomBlending,
  })
  .name("blending");

gui
  .add(material, "blendEquation", {
    AddEquation: THREE.AddEquation,
    SubtractEquation: THREE.SubtractEquation,
    ReverseSubtractEquation: THREE.ReverseSubtractEquation,
    MinEquation: THREE.MinEquation,
    MaxEquation: THREE.MaxEquation,
  })
  .name("blendEquation");

gui
  .add(material, "blendSrc", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  })
  .name("blendSrc");
gui
  .add(material, "blendDst", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  })
  .name("blendDst");

gui
  .add(material, "blendEquationAlpha", {
    AddEquation: THREE.AddEquation,
    SubtractEquation: THREE.SubtractEquation,
    ReverseSubtractEquation: THREE.ReverseSubtractEquation,
    MinEquation: THREE.MinEquation,
    MaxEquation: THREE.MaxEquation,
  })
  .name("blendEquationAlpha");

gui
  .add(material, "blendSrcAlpha", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  })
  .name("blendSrcAlpha");
gui.add(material, "blendDstAlpha", {
  ZeroFactor: THREE.ZeroFactor,
  OneFactor: THREE.OneFactor,
  SrcColorFactor: THREE.SrcColorFactor,
  OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
  SrcAlphaFactor: THREE.SrcAlphaFactor,
  OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
  DstAlphaFactor: THREE.DstAlphaFactor,
  OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
  DstColorFactor: THREE.DstColorFactor,
  OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
  // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
});
console.log(material);
