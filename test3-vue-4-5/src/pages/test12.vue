<template>
  <div ref="test12"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
// 导入threejs
import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入顶点法向量辅助器
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const test12 = ref<HTMLDivElement | null>(null);

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

onMounted(()=>{
  if (test12.value) {
    test12.value.appendChild(renderer.domElement);
  }
});

// 设置相机位置
camera.position.z = 40;
camera.position.y = 4;
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

// 监听窗口变化
window.addEventListener("resize", () => {
  // 重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
});

// 创建GUI
const gui = new GUI();

// rgbeLoader 加载hdr贴图
let rgbeLoader = new RGBELoader();
rgbeLoader.load("./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
  // 设置球形贴图
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  scene.environment = envMap;
});

// 创建1个平面

// 1、2个物体都设置模板缓冲区的写入和测试
// 2、设置模板缓冲的基准值
// 3、设置允许写入的掩码0xff
// 4、在小球上设置模板比较函数THREE.EqualStencilFunc
// 5、设置当函数比较通过时候，设置为replace替换
const plane = new THREE.PlaneGeometry(8, 8);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  stencilWrite: true, // 可以写入
  stencilWriteMask: 0xff, //0-255
  stencilRef: 2, // 基准值
  stencilZPass: THREE.ReplaceStencilOp, // 设置当函数比较通过时候，设置为replace替换
});
const planeMesh = new THREE.Mesh(plane, planeMaterial);
scene.add(planeMesh);

// 创建1个球
const sphere = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffcccc,
  stencilWrite: true,
  stencilRef: 2, // 基准值
  stencilFunc: THREE.EqualStencilFunc, // 基准值相等可以写入
  depthTest: false,
});
const sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
sphereMesh.position.z = -10;
scene.add(sphereMesh);
</script>

<style scoped></style>
