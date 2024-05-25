<template>
  <div ref="test9"></div>
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
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const test9 = ref<HTMLDivElement | null>(null);

const { scene, camera, renderer } = init();

const controls = new OrbitControls(camera, renderer.domElement);

const gui = new GUI();

// rgbeLoader 加载hdr贴图
let rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "../../public/texture/opt/memorial/Alex_Hart-Nature_Lab_Bones_2k.hdr",
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

// 创建平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  // map: new THREE.TextureLoader().load("./texture/brick/brick_diffuse.jpg"),
  map: new THREE.TextureLoader().load("../../public/texture/sprite0.png"),
  side: THREE.DoubleSide,
  transparent: true,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.renderOrder = 0;

const planeGeometry1 = new THREE.PlaneGeometry(10, 10);
const planeMaterial1 = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("../../public/texture/lensflare0_alpha.png"),
  side: THREE.DoubleSide,
  transparent: true,
});
const plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
plane1.position.z = 3;
plane1.renderOrder = 0;


// 设置深度模式
plane.material.depthFunc = THREE.LessEqualDepth;
plane.material.depthWrite = true;
plane.material.depthTest = true;
plane1.material.depthFunc = THREE.LessEqualDepth;
plane1.material.depthWrite = true;
plane1.material.depthTest = true;

// gui
const gui1 = gui.addFolder("plane");
gui1
  .add(plane.material, "depthFunc", {
    "THREE.NeverDepth": THREE.NeverDepth,
    "THREE.AlwaysDepth": THREE.AlwaysDepth,
    "THREE.LessDepth": THREE.LessDepth,
    "THREE.LessEqualDepth": THREE.LessEqualDepth,
    "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
    "THREE.GreaterDepth": THREE.GreaterDepth,
    "THREE.NotEqualDepth": THREE.NotEqualDepth,
  })
  .name("深度模式");
gui1
  .add(plane.material, "depthWrite")
  .name("深度写入")
  .onChange(() => {
    plane.material.needsUpdate = true;
  });
gui1
  .add(plane.material, "depthTest")
  .name("深度测试")
  .onChange(() => {
    plane.material.needsUpdate = true;
  });

gui1.add(plane, "renderOrder", 0, 10).step(1).name("渲染顺序");

const gui2 = gui.addFolder("plane1");
gui2
  .add(plane1.material, "depthFunc", {
    "THREE.NeverDepth": THREE.NeverDepth,
    "THREE.AlwaysDepth": THREE.AlwaysDepth,
    "THREE.LessDepth": THREE.LessDepth,
    "THREE.LessEqualDepth": THREE.LessEqualDepth,
    "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
    "THREE.GreaterDepth": THREE.GreaterDepth,
    "THREE.NotEqualDepth": THREE.NotEqualDepth,
  })
  .name("深度模式");
gui2
  .add(plane1.material, "depthWrite")
  .name("深度写入")
  .onChange(() => {
    plane1.material.needsUpdate = true;
  });
gui2
  .add(plane1.material, "depthTest")
  .name("深度测试")
  .onChange(() => {
    plane1.material.needsUpdate = true;
  });

gui2.add(plane1, "renderOrder", 0, 10).step(1).name("渲染顺序");

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

gui.add(eventObj, "Fullscreen");
gui.add(eventObj, "ExitFullscreen");

// scene.background = new THREE.Color(0xeeeeee);
scene.add(plane);
scene.add(plane1);
scene.add(new THREE.AmbientLight(0xffffff, 1));
scene.add(new THREE.PointLight(0xffffff, 1));
scene.add(new THREE.AxesHelper(20));
scene.add(new THREE.GridHelper(10, 10));

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function init() {
  // 创建场景
  const scene = new THREE.Scene();
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}

const ResizeWindow = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  if (test9.value) {
    animate();
    test9.value.appendChild(renderer.domElement);
  }
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});
</script>

<style scoped></style>
