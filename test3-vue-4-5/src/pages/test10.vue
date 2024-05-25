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
rgbeLoader.load("../../public/texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envMap) => {
  // 设置球形贴图
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
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
    "../../public/model/cup.glb",
    // 加载完成回调
    (gltf) => {
      let cup:any = gltf.scene.getObjectByName("copo_low_01_vidro_0");
      let water:any = gltf.scene.getObjectByName("copo_low_02_agua_0");
      let ice:any = gltf.scene.getObjectByName("copo_low_04_vidro_0");

      ice.scale.set(0.86, 0.86, 0.86);
      water.position.z = -1;
      ice.renderOrder = 1;
      water.renderOrder = 2;
      cup.renderOrder = 3;

      // cup.visible = false;
      // water.visible = false;

      console.log("ice", ice);
      console.log("water", water);
      let iceMaterial = ice.material;
      ice.material = new THREE.MeshPhysicalMaterial({
        normalMap: iceMaterial.normalMap,
        metalnessMap: iceMaterial.metalnessMap,
        roughness: 10,
        color: 0xddddff,
        transmission: 0.2,
        transparent: true,
        thickness: 20,
        ior: 1,
        // opacity: 0.5,
      });

      // console.log("iceMaterial", iceMaterial);

      let waterMaterial = water.material;
      water.material = new THREE.MeshPhysicalMaterial({
        map: waterMaterial.map,
        normalMap: waterMaterial.normalMap,
        metalnessMap: waterMaterial.metalnessMap,
        roughnessMap: waterMaterial.roughnessMap,
        transparent: true,
        transmission: 0.5,
        roughness: 2,
        thickness: 20,
        ior: 2,
        // opacity: 0.6,
      });

      // water.visible = false;

      cup.material = new THREE.MeshPhysicalMaterial({
        map: cup.material.map,
        normalMap: cup.material.normalMap,
        metalnessMap: cup.material.metalnessMap,
        roughnessMap: cup.material.roughnessMap,
        transparent: true,
        transmission: 0.5,
        roughness: 1,
        thickness: 10,
        ior: 2,
        opacity: 0.6,
      });
      // cup.material = material;

      let material = water.material;
      material.blending = THREE.CustomBlending;
      material.blendEquation = THREE.AddEquation;
      material.blendSrc = THREE.SrcAlphaFactor;
      material.blendDst = THREE.SrcColorFactor;

      cup.material.blending = THREE.CustomBlending;
      cup.material.blendEquation = THREE.AddEquation;
      cup.material.blendSrc = THREE.SrcAlphaFactor;
      cup.material.blendDst = THREE.SrcColorFactor;

      gui
        .add(material, "blendEquation", {
          AddEquation: THREE.AddEquation,
          SubtractEquation: THREE.SubtractEquation,
          ReverseSubtractEquation: THREE.ReverseSubtractEquation,
          MinEquation: THREE.MinEquation,
          MaxEquation: THREE.MaxEquation,
        })
        .name("blendEquation");

      gui
        .add(material, "blendSrc", {
          ZeroFactor: THREE.ZeroFactor,
          OneFactor: THREE.OneFactor,
          SrcColorFactor: THREE.SrcColorFactor,
          OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
          SrcAlphaFactor: THREE.SrcAlphaFactor,
          OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
          DstAlphaFactor: THREE.DstAlphaFactor,
          OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
          DstColorFactor: THREE.DstColorFactor,
          OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
          SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
        })
        .name("blendSrc");
      gui
        .add(cup.material, "blendDst", {
          ZeroFactor: THREE.ZeroFactor,
          OneFactor: THREE.OneFactor,
          SrcColorFactor: THREE.SrcColorFactor,
          OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
          SrcAlphaFactor: THREE.SrcAlphaFactor,
          OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
          DstAlphaFactor: THREE.DstAlphaFactor,
          OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
          DstColorFactor: THREE.DstColorFactor,
          OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
          // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
        })
        .name("blendDst");

      gui
        .add(material, "blendEquationAlpha", {
          AddEquation: THREE.AddEquation,
          SubtractEquation: THREE.SubtractEquation,
          ReverseSubtractEquation: THREE.ReverseSubtractEquation,
          MinEquation: THREE.MinEquation,
          MaxEquation: THREE.MaxEquation,
        })
        .name("blendEquationAlpha");

      gui
        .add(material, "blendSrcAlpha", {
          ZeroFactor: THREE.ZeroFactor,
          OneFactor: THREE.OneFactor,
          SrcColorFactor: THREE.SrcColorFactor,
          OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
          SrcAlphaFactor: THREE.SrcAlphaFactor,
          OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
          DstAlphaFactor: THREE.DstAlphaFactor,
          OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
          DstColorFactor: THREE.DstColorFactor,
          OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
          SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
        })
        .name("blendSrcAlpha");
      gui.add(material, "blendDstAlpha", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      });
      scene.add(gltf.scene);
    }
  );
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

gui.add(eventObj, "Fullscreen");
gui.add(eventObj, "ExitFullscreen");



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
