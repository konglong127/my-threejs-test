<template>
  <div ref="test11"></div>
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

const test11 = ref<HTMLDivElement | null>(null);

const { camera, renderer, scene } = init();

const controls = new OrbitControls(camera, renderer.domElement);

const gui = new GUI();
/*
  图形1
*/
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshPhysicalMaterial({
  side: THREE.DoubleSide,
});
const torusKnot = new THREE.Mesh(geometry, material);
/*
  图形2
*/
const geometry1 = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material1 = new THREE.MeshBasicMaterial({
  wireframe: true,
});
const torusKnot1 = new THREE.Mesh(geometry1, material1);

// 创建新场景
const newScene = new THREE.Scene();
newScene.add(torusKnot1);

scene.add(torusKnot);
scene.add(new THREE.AxesHelper(5));

// 创建裁剪平面
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
// 创建第2个平面
const plane2 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
// const plane3 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
// material.clippingPlanes = [plane, plane2];
material.clippingPlanes = [plane, plane2];
// renderer.clippingPlanes = [plane, plane2, plane3];
// 设置裁剪为并集,默认为交集
material.clipIntersection = true;
// 设置渲染器的localClippingEnabled属性为true
renderer.localClippingEnabled = true;
// 设置裁剪阴影,没阴影,没效果
material.clipShadows = true;
// 裁剪距离
plane.constant = 0;

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

  newScene.background = envMap;
  newScene.environment = envMap;
});


// 创建一个gui
const folder = gui.addFolder("裁剪平面");
// 添加一个滑块
folder.add(plane, "constant", -10, 10).name("位置");
// // 设置plane的normal属性
folder.add(plane.normal, "x", -1, 1).name("法向量x");
folder.add(plane.normal, "y", -1, 1).name("法向量y");
folder.add(plane.normal, "z", -1, 1).name("法向量z");

// scissorWidth
let params = {
  scissorWidth: window.innerWidth / 2,
};
gui.add(params, "scissorWidth", 0, window.innerWidth);

// 渲染函数
function animate() {
  controls.update();
  // 设置裁剪
  renderer.setScissorTest(true);
  // 从0,0点开始裁剪一半
  renderer.setScissor(0, 0, params.scissorWidth, window.innerHeight);
  renderer.render(scene, camera);
  // 渲染
  requestAnimationFrame(animate);
  /* 另一半画面 */
  renderer.setScissor(
    params.scissorWidth,
    0,
    window.innerWidth - params.scissorWidth,
    window.innerHeight
  );
  renderer.render(newScene, camera);
  renderer.setScissorTest(false);
}

const resizeWindow = () => {
  // 重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
};

onMounted(() => {
  if (test11.value) {
    test11.value.appendChild(renderer.domElement);
    animate();
  }
  window.addEventListener('resize',resizeWindow);
});

onUnmounted(()=>{
  window.removeEventListener('resize',resizeWindow);
});

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45, // 视角
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近平面
    1000 // 远平面
  );

  // 设置相机位置
  camera.position.z = 50;
  camera.position.y = 4;
  camera.position.x = 2;
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启抗锯齿
  });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}
</script>

<style scoped></style>
