<template>
  <div ref="test8"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
// 导入threejs
import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入dds格式加载器
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader.js";
// ktx2格式加载器
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
// 导入tga
import { TGALoader } from "three/addons/loaders/TGALoader.js";
// 导入exrloader
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
// 导入tif
import { LogLuvLoader } from "three/addons/loaders/LogLuvLoader.js";
// 导入rgbmloader
import { RGBMLoader } from "three/addons/loaders/RGBMLoader.js";

const test8 = ref<HTMLDivElement | null>(null);

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
  antialias: true, // 抗锯齿
});

renderer.setSize(window.innerWidth, window.innerHeight);

const ResizeWindow = () => {
  // 重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
};

onMounted(() => {
  if (test8.value) {
    test8.value.appendChild(renderer.domElement);
  }
  // 监听窗口变化
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  // 移除监听
  window.removeEventListener("resize", ResizeWindow);
});

// 设置相机位置
camera.position.z = 5;
camera.position.y = 2;
camera.position.x = 2;
camera.lookAt(0, 0, 0);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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

// 创建纹理加载器
let textureLoader = new THREE.TextureLoader();
// 加载纹理
// let texture = textureLoader.load("./texture/filter/minecraft.png");
let texture = textureLoader.load("../../public/texture/brick/brick_diffuse.jpg");
// let texture = textureLoader.load("./texture/rain.png");
let planeGeometry = new THREE.PlaneGeometry(1, 1);
let planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
  // 允许透明
  transparent: true,
});
// planeMaterial.map = texture;
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// texture.flipY = false;
// texture.flipY = true;

texture.colorSpace = THREE.SRGBColorSpace;
// 场景背景
// scene.background = new THREE.Color(0xffffff);
// 直接取映射到的最近的像素
// texture.magFilter = THREE.NearestFilter;
// 取映射到的最近的四个像素的平均值
// texture.magFilter = THREE.LinearFilter;

// texture.minFilter = THREE.NearestFilter;
// texture.minFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearMipMapLinearFilter;
// texture.minFilter = THREE.LinearMipMapNearestFilter;
// texture.minFilter = THREE.NearestMipMapLinearFilter;
// texture.minFilter = THREE.NearestMipMapNearestFilter;

// texture.generateMipmaps = false;

// 获取各项异性的最大值
let maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
texture.anisotropy = 4;
console.log(maxAnisotropy);

// jpg/png纹理加载
// textureLoader.load(
//   "./texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k.jpg",
//   (texture) => {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     console.log("jpg/png", texture);
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//     texture.magFilter = THREE.LinearFilter;
//     texture.minFilter = THREE.LinearMipMapLinearFilter;
//     texture.anisotropy = 16;
//   }
// );

// dds加载器
// let ddsLoader = new DDSLoader();
// let ddsTexture = ddsLoader.load(
//   "./texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k_bc3_nomip.dds",
//   (texture) => {
//     console.log("dds", texture);
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     texture.flipY = true;
//     texture.needsUpdate = true;
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//     texture.center = new THREE.Vector2(0.5, 0.5);
//     texture.rotation = Math.PI;
//     texture.magFilter = THREE.LinearFilter;
//     texture.minFilter = THREE.LinearMipMapLinearFilter;
//     texture.anisotropy = 16;
//   }
// );

// Alex_Hart - Nature_Lab_Bones_2k_bc7.tga;
// tga加载纹理;
// let tgaLoader = new TGALoader();
// tgaLoader.load(
//   "./texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k-mipmap.tga",
//   (texture) => {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     console.log("tga", texture);
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//   }
// );

// ktx2加载器;
// let ktx2Loader = new KTX2Loader()
//   .setTranscoderPath("../../public/basis/")
//   .detectSupport(renderer);
// let ktx2Texture = ktx2Loader.load(
//   "../../public/texture/opt/ktx2/Alex_Hart-Nature_Lab_Bones_2k_uastc-mip-triangle.ktx2",
//   (texture) => {
//     console.log("ktx2", texture);
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     // texture.magFilter = THREE.LinearFilter;
//     // texture.minFilter = THREE.LinearMipMapLinearFilter;
//     texture.anisotropy = 16;
//     // 不起效果texture.flipY = true;
//     texture.needsUpdate = true;
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//   }
// );

const gui=new GUI();
// 设置色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// 设置色调映射曝光度
renderer.toneMappingExposure = 1;
gui.add(renderer, "toneMapping", {
  // 无色调映射
  No: THREE.NoToneMapping,
  // 线性色调映射
  Linear: THREE.LinearToneMapping,
  // Reinhard色调映射。这是一种更复杂的色调映射方式，可以更好地处理高亮度的区域。它根据整个图像的平均亮度来调整每个像素的亮度。
  Reinhard: THREE.ReinhardToneMapping,
  // Cineon色调映射。这种方法起源于电影行业，尝试模仿电影胶片的颜色响应，使得图像在颜色上看起来更富有电影感。
  Cineon: THREE.CineonToneMapping,
  // ACES Filmic色调映射。这是一种模仿电影行业中常用的色调映射算法，可以产生类似于电影的视觉效果。
  ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, "toneMappingExposure", 0, 3, 0.1);


// exrLoader 加载hdr贴图
// let exrLoader = new EXRLoader();
// exrLoader.load(
//   "../../public/texture/opt/memorial/Alex_Hart-Nature_Lab_Bones_2k.exr",
//   (texture) => {
//     console.log("exr", texture);
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//   }
// );

// tif logLuv 加载hdr贴图
// let logLuvLoader = new LogLuvLoader();
// logLuvLoader.load("../../public/texture/opt/memorial/memorial.tif", (texture) => {
//   console.log("exr", texture);
//   // texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;
//   plane.material.map = texture;
// });

// rgbmloader
let rgbmLoader = new RGBMLoader();
rgbmLoader.load("../../public/texture/opt/memorial/memorial.png", (texture) => {
  scene.background = texture;
  scene.environment = texture;
  plane.material.map = texture;
});

</script>

<style scoped></style>
