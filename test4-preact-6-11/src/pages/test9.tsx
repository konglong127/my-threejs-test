import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test8() {
  const test9 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, pointLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  /* -------------------------------- 点材质1 -------------------------- */
  const vertices = [];
  for (let i = 0; i < 100; i++) {
    const x = THREE.MathUtils.randFloatSpread(20);
    const y = THREE.MathUtils.randFloatSpread(20);
    const z = THREE.MathUtils.randFloatSpread(20);
    vertices.push(x, y, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  // 纹理
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('../../public/texture/points/1.png');
  // 点材质
  const material = new THREE.PointsMaterial({
    color: Math.floor(Math.random() * 0xffffff),
    alphaMap: texture, // 可透明纹理贴图
    transparent: true,
    depthWrite: false, // 去除黑色部分产生的白色阴影
    blending: THREE.AdditiveBlending, // 点光源叠加,发光
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ----------------------------------- 点材质2 ---------------------------- */
  const sphereBufferGeometry = new THREE.BufferGeometry();
  // 圆形坐标放入bufferGeometry
  sphereBufferGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      new THREE.SphereGeometry(10, 32, 32).attributes.position.array,
      3
    )
  );
  // const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  const pointMaterial = new THREE.PointsMaterial({
    color: 0xfff000,
    alphaMap: texture,
    transparent: true,
    depthWrite: false, // 去除黑色部分产生的白色阴影
    blending: THREE.AdditiveBlending, // 点光源叠加,发光
  });
  pointMaterial.size = 0.5; // point的大小
  pointMaterial.sizeAttenuation = true; // 点的大小是否衰减,设置为false离近就看不见了
  const points2 = new THREE.Points(sphereBufferGeometry, pointMaterial);
  points2.position.set(20, 0, 0);
  scene.add(points2);




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

  // let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    // let delta = clock.getDelta();
    // if (mixer) {
    //   mixer.update(delta);
    // }
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test9.current) {
      test9.current.appendChild(stats.dom);
      test9.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test9}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 10, 20);
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
