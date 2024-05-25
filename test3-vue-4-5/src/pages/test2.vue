<template>
  <div ref="test2"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { GLTFLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
const test2 = ref<HTMLDivElement | null>(null);
const { camera, scene, renderer } = init();
const controls = new OrbitControls(camera, renderer.domElement);

// 创建一个平面，贴了一张图
const geometry = new THREE.PlaneGeometry(2, 2);
const texture = new THREE.TextureLoader().load("../../public/texture/uv_grid_opengl.jpg");
const material = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map: texture,
});
const plane = new THREE.Mesh(geometry, material);
plane.position.set(3, 0, 0);
plane.rotation.x = Math.PI * -0.5;
scene.add(plane);

const gltfLoader = new GLTFLoader();
gltfLoader.load("../../public/Duck.glb", (gltf) => {
  scene.add(gltf.scene);

  let duckMesh = gltf.scene.getObjectByName("LOD3spShape");
  let matcapTexture = new THREE.TextureLoader().load(
    "../../public/texture/matcaps/4.png"
  );
  console.log(gltf.scene);
  let preMaterial = (duckMesh as any).material;
  //这个材料设置好后不会反射周围的环境
  (duckMesh as any).material = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
    map: preMaterial.map,
  });
});

const rgbeLoader = new RGBELoader();
rgbeLoader.load("../../public/Video_Copilot-Back Light_0007_4k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
  console.log(scene);
  plane.material.envMap = texture; //反射周围环境贴图
  // scene.getObjectByName("LOD3spShape").material.envMap = texture;
  // console.log(scene.getObjectByName("LOD3spShape").material);
});

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
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  return { scene, renderer, camera };
}

onMounted(() => {
  if (test2.value) {
    test2.value.appendChild(renderer.domElement);
    animate();
  }
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});
</script>

<style scoped></style>
