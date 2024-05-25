import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test13() {
  const test13 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, pointLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  /* -------------------------------- 点材质1 -------------------------- */
  const params = {
    count: 10000,
    size: 0.1,
    radius: 5,
    branch: 3,
    color: "#ff6030",
    rotateScale: 0.3,
    endColor: "#1b3984",
  };
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("../../public/texture/points/1.png");
  const centerColor = new THREE.Color(params.color);
  const endColor = new THREE.Color(params.endColor);
  let geometry = null, material = null, points: THREE.Points | null = null;
  function createGalaxy() {
    // 创建自定义几何体
    geometry = new THREE.BufferGeometry();
    // 随机生成顶点数据
    const positions = new Float32Array(params.count * 3);
    // 随机生成颜色数据
    let colors = new Float32Array(params.count * 3);

    for (let i = 0; i < params.count; i++) {
      //   当前的点应该在哪一条分支的角度上
      const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch);

      // 当前点距离圆心的距离
      const distance = Math.random() * params.radius * Math.pow(Math.random(), 3);
      const current = i * 3;

      const randomX =
        (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;
      const randomY =
        (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;
      const randomZ =
        (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;

      positions[current] =
        Math.cos(branchAngel + distance * params.rotateScale) * distance +
        randomX;
      positions[current + 1] = 0 + randomY;
      positions[current + 2] =
        Math.sin(branchAngel + distance * params.rotateScale) * distance +
        randomZ;

      // 混合颜色，形成渐变色
      const mixColor = centerColor.clone();
      mixColor.lerp(endColor, distance / params.radius);

      colors[current] = mixColor.r;
      colors[current + 1] = mixColor.g;
      colors[current + 2] = mixColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      // color: new THREE.Color(params.color),
      size: params.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: texture,
      alphaMap: texture,
      transparent: true,
      vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    }
  };

  gui.add(eventObj, 'Fullscreen');
  gui.add(eventObj, 'ExitFullscreen');
  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');
  lightFolder.add(pointLight, 'intensity', 0, 10000).step(1).name('点光源亮度');
  lightFolder.add(pointLight.position, 'x', -100, 100).step(1).name('点光源X轴');
  lightFolder.add(pointLight.position, 'y', -100, 100).step(1).name('点光源Y轴');
  lightFolder.add(pointLight.position, 'z', -100, 100).step(1).name('点光源Z轴');

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    let delta = clock.getElapsedTime();
    // if (mixer) {
    //   mixer.update(delta);
    // }
    if (points) {
      points.rotation.y += 0.005;
      if (points.rotation.y >= 360) {
        points.rotation.y = 0;
      }
    }
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test13.current) {
      test13.current.appendChild(stats.dom);
      test13.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
      createGalaxy();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test13}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 可以开启关闭灯光
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  let pointLight = new THREE.PointLight(0xffffff, 10000, 20);
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  pointLight.castShadow = true;
  pointLight.decay = 2;
  pointLight.shadow.mapSize.width = 1024; // default
  pointLight.shadow.mapSize.height = 1024; // default
  pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  scene.add(pointLight);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ambientLight, pointLight, ResizeWindow };
}
