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
  // 通过geometry模型,创建出边缘模型
  const yellowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff000,
    transparent: true,
    opacity: 0.8,
    depthTest: true,
    // refractionRatio: 0.7, //折射
    // reflectivity: 0.99, //反射率
    transmission: 0.9, // 透光率
    emissive: 0x00ff00, // 自发光
    // wireframe:true, //线框
    // side:THREE.DoubleSide, //双面
    roughness: 0.05, // 粗糙度
    thickness: 0.1, // 厚度
    attenuationColor: new THREE.Color(0.9, 0.9, 0), // 衰减颜色
    attenuationDistance: 1, // 衰减距离
    clearcoat: 1, // 光泽
    clearcoatRoughness: 0.1, //光泽粗糙度
  });
  const redMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff0000 });
  function createCube(x: number, y: number, z: number) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 加线框
    let edgesGeometry = new THREE.WireframeGeometry(geometry);
    let lineMesh = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.LineSegments(edgesGeometry, lineMesh);
    const material = yellowMaterial;
    // box
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.add(line);
    cube.position.set(x, y, z);
    return cube;
  }

  let cubs: THREE.Mesh[] = [];
  for (let i = 0; i < 10; ++i) {
    for (let j = 0; j < 10; ++j) {
      for (let k = 0; k < 10; ++k) {
        let cub = createCube(i * 3, j * 3, k * 3);
        cubs.push(cub);
        scene.add(cub);
      }
    }
  }

  // 创建投射光线对象
  const raycaster = new THREE.Raycaster();
  // 鼠标的位置对象
  const mouse = new THREE.Vector2();
  function active(evt: MouseEvent) {
    //   console.log(event);
    mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((evt.clientY / window.innerHeight) * 2 - 1);
    raycaster.setFromCamera(mouse, camera);
    let result = raycaster.intersectObjects(cubs);
    //   console.log(result);
    //   result[0].object.material = redMaterial;
    for (let i in cubs) {
      // 0是选中的第一个
      cubs[i].material = yellowMaterial;
    }
    result.forEach((item) => {
      console.log(item);
      (item.object as any).material = redMaterial;
    });
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
  lightFolder.add(pointLight, 'intensity', 0, 900000).step(1).name('点光源亮度');
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
    pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
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
      window.addEventListener('click', active);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener('click', active);
    }
  });

  return (<>
    <div ref={test13}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(30, 30, 20);
  camera.lookAt(0, 20, 0);

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

  let pointLight = new THREE.PointLight(0xffffff, 100000, 20);
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
