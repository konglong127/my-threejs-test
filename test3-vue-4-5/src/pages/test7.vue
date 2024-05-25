<template>
  <div ref="test7"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const test7 = ref<HTMLElement | null>(null);
const { scene, camera, renderer } = init();
const controls = new OrbitControls(camera, renderer.domElement);
const gui = new GUI();

// 井盖
const texture = new THREE.TextureLoader().load(
  "../../public/texture/watercover/CityNewYork002_Flat.png"
);
texture.repeat.set(4, 3); // 设置纹理重复次数,水平4次,垂直2次
// texture.wrapS = THREE.RepeatWrapping; // 设置水平重复
// texture.wrapT = THREE.RepeatWrapping; // 设置垂直重复
texture.wrapS = THREE.MirroredRepeatWrapping; // 设置水平镜像重复
texture.wrapT = THREE.MirroredRepeatWrapping; // 设置垂直镜像重复
texture.offset.set(0.5, 0.5); // 设置纹理偏移
texture.rotation = Math.PI * 0.3; // 设置纹理旋转
texture.center.set(0.5, 0.5); // 设置纹理中心点

const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
  side: THREE.DoubleSide,
  // transparent: true,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// plane
const texture2 = new THREE.TextureLoader().load(
  "../../public/texture/rain.png"
);
texture2.flipY = false; // 垂直翻转y轴,默认true
texture2.premultiplyAlpha = true; // 透明度预乘,默认false
const planeGeometry2 = new THREE.PlaneGeometry(2, 2);
const planeMaterial2 = new THREE.MeshBasicMaterial({
  map: texture2,
  side: THREE.DoubleSide,
  transparent:true
});
const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
plane2.position.set(3, 0, 0);
scene.add(plane2);

gui
  .add(texture2, "premultiplyAlpha")
  .name("premultiplyAlpha")
  .onChange(() => {
    texture2.needsUpdate = true;
  });


const texture3 = new THREE.TextureLoader().load(
  "../../public/texture/filter/minecraft.png"
);
// 放大过滤,小图到大图
// 取映射到的最近像素平均值
texture3.magFilter = THREE.LinearFilter;
// 直接取映射到的最近像素
texture3.magFilter = THREE.NearestFilter;
// 缩小过滤,大图到小图
// 取映射到的最近像素平均值
texture3.minFilter = THREE.LinearMipMapLinearFilter;
// 直接取映射到的最近像素
texture3.minFilter = THREE.NearestMipMapNearestFilter;
// 去波纹
texture3.minFilter=THREE.LinearMipmapNearestFilter; //差一点,就近计算
texture3.minFilter=THREE.LinearMipMapLinearFilter; //好,4个点取平均值

const geometry3 = new THREE.PlaneGeometry(2, 2);
const material3 = new THREE.MeshBasicMaterial({
  map: texture3,
  side: THREE.DoubleSide,
});
const plane3 = new THREE.Mesh(geometry3, material3);
plane3.position.set(-3, 0, 0);
scene.add(plane3);


// wall
const texture4 = new THREE.TextureLoader().load(
  "../../public/texture/brick/brick_diffuse.jpg"
);
texture4.colorSpace = THREE.SRGBColorSpace;
// 放大过滤,小图到大图
// 取映射到的最近像素平均值
texture4.magFilter = THREE.LinearFilter;
// 直接取映射到的最近像素
texture4.magFilter = THREE.NearestFilter;
// 缩小过滤,大图到小图
// 取映射到的最近像素平均值
texture4.minFilter = THREE.LinearMipMapLinearFilter;
// 直接取映射到的最近像素
texture4.minFilter = THREE.NearestMipMapNearestFilter;
// 去波纹
texture4.minFilter=THREE.LinearMipmapNearestFilter; //差一点,就近计算
texture4.minFilter=THREE.LinearMipMapLinearFilter; //好,4个点取平均值

// 获取各项异性的最大值,处理倾斜模糊
let maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
texture4.anisotropy = maxAnisotropy;
texture4.anisotropy = 1; //默认1,倾斜会更清楚
console.log(maxAnisotropy);

const geometry4 = new THREE.PlaneGeometry(2, 2);
const material4 = new THREE.MeshBasicMaterial({
  map: texture4,
  side: THREE.DoubleSide,
});
const plane4 = new THREE.Mesh(geometry4, material4);
plane4.position.set(5, 0, 0);
scene.add(plane4);


scene.add(new THREE.AxesHelper(20));
scene.add(new THREE.GridHelper(10, 10));
scene.background = new THREE.Color(0x808080);

const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const ResizeWindow = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 4, 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}

onMounted(() => {
  window.addEventListener("resize", ResizeWindow);
  if (test7.value) {
    test7.value.appendChild(renderer.domElement);
    animate();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", ResizeWindow);
});
</script>

<style scoped></style>
