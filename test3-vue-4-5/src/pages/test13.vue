<template>
  <div ref="test13"></div>
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

const test13 = ref<HTMLElement|null>(null);

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

onMounted(() => {
  if(test13.value){
    test13.value.appendChild(renderer.domElement);
  }
});

// 设置相机位置
camera.position.z = 50;
camera.position.y = 24;
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
rgbeLoader.load("../../public/texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
  // 设置球形贴图
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  scene.environment = envMap;
});
// 创建一个不规则形状,正面
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshPhysicalMaterial({
  // side: THREE.DoubleSide,
  side: THREE.FrontSide,
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);
// 不规则形状2,背面
const material1 = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0xffcccc,
  stencilWrite: true,
  stencilRef: 1,
  stencilWriteMask: 0xff,
  stencilZPass: THREE.ReplaceStencilOp,
});
const torusKnot1 = new THREE.Mesh(geometry, material1);
scene.add(torusKnot1);

// 创建裁剪平面
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
material.clippingPlanes = [plane];
material1.clippingPlanes = [plane];
renderer.localClippingEnabled = true;

// 创建平面,映射到不规则图形2中,进行金属材质反射
let planeGeometry = new THREE.PlaneGeometry(40, 40, 1, 1);
let planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xccccff,
  metalness: 0.95, // 金属度
  roughness: 0.1, // 粗糙度
  stencilWrite: true, // 可以写入stencil缓冲区
  stencilRef: 1, // 设置stencil缓冲区参考值
  stencilFunc: THREE.EqualStencilFunc, // 相等写入
});
let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

// 创建一个gui
const folder = gui.addFolder("裁剪平面");
// 添加一个滑块
folder.add(plane, "constant", -10, 10).name("位置");
// 设置plane的normal属性
folder.add(plane.normal, "x", -1, 1).name("法向量x");
folder.add(plane.normal, "y", -1, 1).name("法向量y");
folder.add(plane.normal, "z", -1, 1).name("法向量z");
</script>

<style scoped></style>
