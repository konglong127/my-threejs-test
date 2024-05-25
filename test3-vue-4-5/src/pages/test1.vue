<template>
  <div ref="test1"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
const test1 = ref<HTMLDivElement | null>(null);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

// 设置相机位置
camera.position.z = 5;
camera.position.y = 5;
// camera.lookAt(cube.position);
camera.lookAt(0, 0, 0);

// box几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 材质
const cube = new THREE.Mesh(geometry, material); // 网格
// 画一个线框
const edgeGeometry = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const line = new THREE.LineSegments(edgeGeometry, edgeMaterial);
cube.add(line);

scene.add(cube);
scene.add(new THREE.AxesHelper(10));
scene.add(new THREE.GridHelper(10, 10));
scene.background = new THREE.Color(0xffeeee);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;
  renderer.render(scene, camera);
}

const windowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  if (!test1.value) return;
  test1.value.appendChild(renderer.domElement);
  animate();
  window.addEventListener("resize", windowResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", windowResize);
});
</script>

<style scoped></style>
