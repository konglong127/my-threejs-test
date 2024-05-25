<template>
  <div ref="test4"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { GLTFLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
const test4 = ref<HTMLDivElement | null>(null);
const { camera, scene, renderer } = init();
const controls = new OrbitControls(camera, renderer.domElement);

// 载入背景图，水晶鸭
const rgbeLoader = new RGBELoader();
rgbeLoader.load("../../public/texture/HDRI_Hen-Hikers_Ce_4k.hdr", (texture) => {
  // texture.mapping = THREE.EquirectangularReflectionMapping; //反射
  texture.mapping = THREE.EquirectangularRefractionMapping; //折射
  scene.background = texture;
  scene.environment = texture;
  console.log(scene);

  // 鸭子
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("../../public/Duck.glb", (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    let duckMesh = gltf.scene.getObjectByName("LOD3spShape");
    let preMaterial = (duckMesh as any).material;
    (duckMesh as any).material = new THREE.MeshPhongMaterial({
      // color: 0xffffff,
      map: preMaterial.map,
      refractionRatio: 0.7, //折射
      reflectivity: 0.99, //反射率
      envMap: texture,
    });
  });

  // 载入剑
  gltfLoader.load("../../public/model/sword/sword.gltf", (gltf) => {
    gltf.scene.scale.set(0.2, 0.2, 0.2);
    gltf.scene.position.set(2, 0, 0);
    scene.add(gltf.scene);
  });
});

let thicknessMap = new THREE.TextureLoader().load(
  "../../public/texture/diamond/diamond_emissive.png"
);

let normalMap = new THREE.TextureLoader().load(
  "../../public/texture/diamond/diamond_normal.png"
);

let carbonNormal = new THREE.TextureLoader().load(
  "../../public/texture/diamond/Carbon_Normal.png"
);

let scratchNormal = new THREE.TextureLoader().load(
  "../../public/texture/diamond/Scratched_gold_01_1K_Normal.png"
);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshPhysicalMaterial({
  // color: 0x00ff00,
  transparent: true,
  transmission: 0.95, // 透光率
  // emissive: 0x00ff00, // 自发光
  // opacity: 0.5, //透明度
  // wireframe:true, //线框
  // side:THREE.DoubleSide, //双面
  roughness: 0.05, // 粗糙度
  thickness: 2, // 厚度
  attenuationColor: new THREE.Color(0.9, 0.9, 0), // 衰减颜色
  attenuationDistance: 1, // 衰减距离
  thicknessMap,
  clearcoat: 1, // 光泽
  clearcoatRoughness: 0.1, //光泽粗糙度
  // clearcoatMap: thicknessMap,
  // clearcoatRoughnessMap: thicknessMap,
  // clearcoatNormalMap: scratchNormal,
  // normalMap: carbonNormal,
  // clearcoatNormalScale: new THREE.Vector2(0.1, 0.1),
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// sheen 主要用于布料
const brickRoughness = new THREE.TextureLoader().load(
  "../../public/texture/brick/brick_roughness.png"
);
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x222288,
  sheen: 1, //光泽
  sheenColor: 0xffffff, // 光泽颜色
  sheenRoughness: 0.5, //光泽粗糙度
  sheenColorMap: brickRoughness, // 光泽贴图
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(8, 0, 0);
scene.add(sphere);

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
gui.add(cube.material, "attenuationDistance", 0, 10).step(0.01).name("衰减距离");
gui.add(cube.material, "thickness", 0, 4).step(0.01).name("厚度");
gui.add(cube.material, "roughness", 0, 2).step(0.01).name("粗糙度");
gui.add(cube.material, "ior", 0, 1).step(0.01).name("折射率");
gui.add(cube.material, "reflectivity", 0, 2).step(0.01).name("反射率");
// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

scene.add(new THREE.AxesHelper(10));
scene.add(new THREE.GridHelper(10, 10));
scene.background = new THREE.Color(0xffffff);

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
  if (test4.value) {
    test4.value.appendChild(renderer.domElement);
    animate();
  }
  window.addEventListener("resize", ResizeWindow);
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});
</script>

<style scoped></style>
