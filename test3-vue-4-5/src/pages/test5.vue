<template>
  <div ref="test5"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
const test5 = ref<HTMLDivElement | null>(null);
const { camera, scene, renderer } = init();
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
const gui = new GUI();

// const loader = new THREE.ObjectLoader();
// loader.load("./model/damon/scene.json", (object) => {
//   scene.add(object);
// });

let brickRoughness = new THREE.TextureLoader().load(
  "../../public/texture/brick/brick_roughness.jpg"
);

// 创建球几何体
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
// 创建球材质
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.05, // 粗糙度
  transmission: 1, //透光率
  thickness: 0.1, // 厚度
  iridescence: 1, // 彩虹色
  reflectivity: 1, // 反射率
  iridescenceIOR: 1.3, // 彩虹色折射率
  iridescenceThicknessRange: [100, 400],
  iridescenceThicknessMap: brickRoughness,
});
// 创建球体
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(5, 0, 0);
scene.add(sphere);

console.log(sphereMaterial);

let rgbeLoader = new RGBELoader();
rgbeLoader.load("../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
  // 设置球形贴图
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  scene.environment = envMap;
});

// gui 控制iridescence
gui.add(sphereMaterial, "iridescence", 0, 1).name("彩虹色");
// gui 控制reflectivity
gui.add(sphereMaterial, "reflectivity", 0, 1).name("反射率");
// gui 控制iridescenceIOR
gui.add(sphereMaterial, "iridescenceIOR", 0, 3).name("彩虹色折射率");
// gui 控制iridescenceThicknessRange

let iridescenceThickness = {
  min: 100,
  max: 400,
};
gui
  .add(iridescenceThickness, "min", 0, 1000)
  .name("彩虹色最小厚度")
  .onChange(() => {
    sphereMaterial.iridescenceThicknessRange[0] = iridescenceThickness.min;
  });
gui
  .add(iridescenceThickness, "max", 0, 1000)
  .name("彩虹色最大厚度")
  .onChange(() => {
    sphereMaterial.iridescenceThicknessRange[1] = iridescenceThickness.max;
  });

scene.add(new THREE.AxesHelper(10));
scene.add(new THREE.GridHelper(10, 10));
scene.background = new THREE.Color(0xffffff);

let eventObj = {
  Fullscreen: function () {
    document.body.requestFullscreen();
  },
  ExitFullscreen: function () {
    document.exitFullscreen();
  },
};

// 添加按钮
gui.add(eventObj, "Fullscreen").name("全屏");
gui.add(eventObj, "ExitFullscreen").name("退出全屏");

function animate() {
  //创建球
  const sphereGeometry = new THREE.SphereGeometry(
    2,
    Math.random() * 64,
    Math.random() * 32
  );
  // let edgesGeometry = new THREE.EdgesGeometry(sphereGeometry);
  let edgesGeometry = new THREE.WireframeGeometry(sphereGeometry);
  let lineMesh = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
  const line = new THREE.LineSegments(edgesGeometry, lineMesh);
  scene.add(line);
  // const sphereMaterial = new THREE.MeshBasicMaterial({
  //   color: Math.random() * 0xffffff,
  // });
  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // scene.add(sphere);

  controls.update();
  renderer.render(scene, camera);

  // 清除场景中的物体
  scene.remove(line);
  // // 清除几何体
  sphereGeometry.dispose();
  // // 清除材质
  sphereMaterial.dispose();
  // // 清除纹理贴图
  // texture.dispose();
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
  if (test5.value) {
    test5.value.appendChild(renderer.domElement);
    animate();
  }
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});
</script>

<style scoped></style>
