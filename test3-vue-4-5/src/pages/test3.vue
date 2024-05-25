<template>
  <div ref="test3"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
const test3 = ref<HTMLDivElement | null>(null);
const { camera, scene, renderer } = init();
const controls = new OrbitControls(camera, renderer.domElement);

let textureLoader = new THREE.TextureLoader();
let colorTexture = textureLoader.load(
  "../../public/texture/watercover/CityNewYork002_COL_VAR1_1K.png"
);
colorTexture.colorSpace = THREE.SRGBColorSpace;
// 高光贴图,会变亮
let specularTexture = textureLoader.load(
  "../../public/texture/watercover/CityNewYork002_GLOSS_1K.jpg"
);
// 法线贴图,增强凹凸性,会加点点,更真实,反射光也更真实
let normalTexture = textureLoader.load(
  "../../public/texture/watercover/CityNewYork002_NRM_1K.jpg"
);
// 凹凸贴图,增强凹凸性
let dispTexture = textureLoader.load(
  "../../public/texture/watercover/CityNewYork002_DISP_1K.jpg"
);
// 环境光遮蔽贴图,会暗一些
let aoTexture = textureLoader.load(
  "../../public/texture/watercover/CityNewYork002_AO_1K.jpg"
);
const geometry = new THREE.PlaneGeometry(4, 4, 200, 200);
// const material = new THREE.MeshPhongMaterial({
const material = new THREE.MeshLambertMaterial({
  transparent: true,
  map: colorTexture,
  specularMap: specularTexture,
  normalMap: normalTexture,
  bumpMap: dispTexture,
  displacementMap: dispTexture,
  displacementScale: 0.04,
  aoMap: aoTexture,
  // side:THREE.DoubleSide
});
const plane = new THREE.Mesh(geometry, material);
plane.position.set(0, 0, 0);
plane.rotation.x = -Math.PI / 2;
// plane.receiveShadow = true;
scene.add(plane);

// rgbeLoader 加载hdr贴图
let rgbeLoader = new RGBELoader();
rgbeLoader.load("../../public/Video_Copilot-Back Light_0007_4k.hdr", (envMap) => {
  // 设置球形贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  scene.environment = envMap;
  // 反射环境贴图
  plane.material.envMap = envMap;
});

// 环境光
const light = new THREE.AmbientLight(0xffffff, 1); // 柔和的白光
scene.add(light);

// 点光源
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

scene.add(new THREE.AxesHelper(10));
scene.add(new THREE.GridHelper(10, 10));
scene.background = new THREE.Color(0x808080);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function ResizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  return { scene, renderer, camera };
}

onMounted(() => {
  if (test3.value) {
    test3.value.appendChild(renderer.domElement);
    animate();
  }
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});

let eventObj = {
  Fullscreen: function () {
    document.body.requestFullscreen();
  },
  ExitFullscreen: function () {
    document.exitFullscreen();
  },
};

// 创建GUI
const gui = new GUI();
// 添加按钮
gui.add(eventObj, "Fullscreen").name("全屏");
gui.add(eventObj, "ExitFullscreen").name("退出全屏");
</script>

<style scoped></style>
