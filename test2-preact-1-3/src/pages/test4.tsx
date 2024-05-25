import * as THREE from "three";
import { useEffect, useRef } from "preact/hooks";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export default function Test4() {
  const test4 = useRef(null);
  const { scene, camera, renderer } = init();
  const gui = new GUI();

  // 创建一个平面
  const createPlane = () => {
    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');

    let planeGeometry = new THREE.PlaneGeometry(40, 40);
    let planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, //设置颜色
      map: texture, //设置纹理
      side: THREE.DoubleSide, //双面绘制
      transparent: true, //允许透明
    });
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;

    return plane;
  }

  const createWaterCover = () => {
    let textureLoader = new THREE.TextureLoader();
    // 加载纹理贴图
    let texture = textureLoader.load('../../public/watercover/CityNewYork002_COL_VAR1_1K.png');
    // ao贴图,调整阴影亮度
    let aoMap = textureLoader.load('../../public/watercover/CityNewYork002_AO_1K.jpg');
    // 透明度贴图
    let alphaMap = textureLoader.load('../../public/door/alpha.jpg');
    // 光照贴图
    let lightMap = textureLoader.load('../../public/watercover/CityNewYork002_Sphere.jpg');
    // 高光贴图
    let specularMap = textureLoader.load('../../public/watercover/CityNewYork002_Sphere.jpg');

    // rgb空间，接近原色
    texture.colorSpace = THREE.SRGBColorSpace;
    // 默认线性空间，偏白
    // texture.colorSpace=THREE.LinearSRGBColorSpace;
    // 无颜色空间，白
    // texture.colorSpace = THREE.NoColorSpace;

    // 设置平面图形
    let planeGeometry = new THREE.PlaneGeometry(10, 10);
    let planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, //设置颜色
      map: texture, //设置纹理
      side: THREE.DoubleSide, //双面绘制
      transparent: true, //允许透明
      aoMapIntensity: 1, //调整阴影亮度
      // aoMap, //ao贴图
      // alphaMap, //透明度贴图
      reflectivity: 0.5,
      // lightMap, //光照贴图 
      specularMap
    });
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 5, 0);

    gui.add(planeMaterial, 'aoMapIntensity', 0, 1).onChange(function (value) {
      planeMaterial.aoMapIntensity = value;
    });

    gui.add(texture, 'colorSpace', {
      sRGB: THREE.SRGBColorSpace,
      Linear: THREE.LinearSRGBColorSpace,
      No: THREE.NoColorSpace
    }).onChange(function () {
      // texture.colorSpace = value;
      texture.needsUpdate = true;
    });

    return plane;
  }
  const waterCover = createWaterCover();

  // 加载环境贴图
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load('../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr', function (texture) {
    // 设置球形映射，使图片不是一个平面
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // 设置场景背景
    scene.background = texture;
    // 设置场景环境
    scene.environment = texture;
    // 设置环境贴图，会反射环境光
    waterCover.material.envMap = texture;
  });

  scene.add(createPlane());
  scene.add(waterCover);

  scene.add(new THREE.AxesHelper(50));
  scene.add(new THREE.GridHelper(40, 40));

  const controls = new OrbitControls(camera, renderer.domElement);

  function Animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(Animate);
  }

  function ResizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }

  useEffect(() => {
    if (test4.current) {
      (test4.current as HTMLDivElement).appendChild(renderer.domElement);
    }
    Animate();
    window.addEventListener('resize', ResizeWindow);
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  }, []);

  return (<>
    <div ref={test4} className="test3"></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}