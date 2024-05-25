<template>
  <div ref="test6"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
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
const test6 = ref<HTMLDivElement | null>(null);

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
  if (test6.value) {
    test6.value.appendChild(renderer.domElement);
  }
});

// 设置相机位置
camera.position.z = 0;
camera.position.y = 1.8;
camera.position.x = 5;
camera.lookAt(0, 0.8, 0);

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
controls.target.set(0, 1.2, 0);
// 禁用平移
controls.enablePan = false;
// 设置最小距离
controls.minDistance = 3;
// 设置最大距离
controls.maxDistance = 5;
// 设置垂直的最小角度
controls.minPolarAngle = Math.PI / 2 - Math.PI / 12;
// 设置垂直的最大角度
controls.maxPolarAngle = Math.PI / 2;

// 设置水平的最小角度
controls.minAzimuthAngle = Math.PI / 2 - Math.PI / 12;
// 设置水平的最大角度
controls.maxAzimuthAngle = Math.PI / 2 + Math.PI / 12;
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

// 创建GUI
const gui = new GUI();
// 添加按钮
gui.add(eventObj, "Fullscreen").name("全屏");
gui.add(eventObj, "ExitFullscreen").name("退出全屏");

// rgbeLoader 加载hdr贴图
let rgbeLoader = new RGBELoader();
rgbeLoader.load("../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
  // 设置球形贴图
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  // scene.background = envMap;
  scene.background = new THREE.Color(0xe2d0e0);
  // 设置环境贴图
  scene.environment = envMap;

  // 实例化加载器gltf
  const gltfLoader = new GLTFLoader();
  // 实例化加载器draco
  const dracoLoader = new DRACOLoader();
  // 设置draco路径
  dracoLoader.setDecoderPath("./draco/");
  // 设置gltf加载器draco解码器
  gltfLoader.setDRACOLoader(dracoLoader);
  // 加载模型
  gltfLoader.load(
    // 模型路径
    "../../public/model/liveroom-scene.glb",
    // 加载完成回调
    (gltf) => {
      console.log(gltf);
      scene.add(gltf.scene);
    }
  );
});
</script>

<style scoped></style>
