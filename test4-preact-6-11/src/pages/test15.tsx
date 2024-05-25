import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
// import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
// import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test13() {
  const test15 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, spotLight, pointLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  // const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  /* -------------------------------- 场景1 -------------------------- */
  // 通过geometry模型,创建出边缘模型
  const boxGroup = new THREE.Group();
  let materialparams = {
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
  }
  const yellowMaterial = new THREE.MeshPhysicalMaterial({ ...materialparams, color: 0xfff000 });
  const redMaterial = new THREE.MeshPhysicalMaterial({ ...materialparams, color: 0xff0000 });
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
  function createCube(x: number, y: number, z: number) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 加线框
    let edgesGeometry = new THREE.WireframeGeometry(geometry);
    let lineMesh = lineMaterial;
    const line = new THREE.LineSegments(edgesGeometry, lineMesh);
    const material = yellowMaterial;
    // box
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.add(line);
    cube.position.set(x, y, z);
    return { cube, line };
  }

  let cubs: Array<{ cube: THREE.Mesh, line: THREE.LineSegments }> = [];
  for (let i = 0; i < 6; ++i) {
    for (let j = 0; j < 6; ++j) {
      for (let k = 0; k < 6; ++k) {
        let res = createCube(i - 10, j, k - 10);
        cubs.push({ cube: res.cube, line: res.line });
        boxGroup.add(res.cube);
      }
    }
  }
  scene.add(boxGroup);

  /* ----------------------------------- 场景2 ------------------------------ */
  const vertices = [];
  const colors = [];
  for (let i = 0; i < 1600; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(30) + 10;
    const z = THREE.MathUtils.randFloatSpread(200);
    vertices.push(x, y, z);
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    colors.push(r, g, b);
  }

  const bGeometry = new THREE.BufferGeometry();
  // float32BufferAttribute 3个为一组
  bGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  bGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  // 纹理
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('../../public/texture/points/1.png');
  // 点材质
  const material = new THREE.PointsMaterial({
    // color: 0xfff000,
    alphaMap: texture, // 可透明纹理贴图
    transparent: true,
    depthWrite: false, // 去除黑色部分产生的白色阴影
    blending: THREE.AdditiveBlending, // 点光源叠加,发光
    vertexColors: true, // 开起顶点颜色设置
  });
  const points = new THREE.Points(bGeometry, material);
  points.position.y = -139;
  scene.add(points);

  /* ------------------------ 场景3 ---------------------------- */
  const SceneGroup3 = new THREE.Group();
  // 平面
  const geometry = new THREE.PlaneGeometry(100, 100, 100);
  const material2 = new THREE.MeshPhysicalMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(geometry, material2);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  plane.castShadow = true;
  // 圆
  const sphereGeomretry = new THREE.SphereGeometry(6, 32, 32)
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    // transparent: true,
    // emissive: 0xfff000, // 自发光
  });
  const sphere = new THREE.Mesh(sphereGeomretry, sphereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  // 弹跳小球
  const sphereGeomretry2 = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial2 = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
  });
  const sphere2 = new THREE.Mesh(sphereGeomretry2, sphereMaterial2);
  sphere2.castShadow = true;
  sphere2.receiveShadow = true;
  // 设置坐标
  sphere2.position.set(16, 16, 0);
  sphere.position.set(0, 7, 0);
  // sphere.position.set(10, 5, 10);
  SceneGroup3.add(sphere2);
  SceneGroup3.add(sphere);
  SceneGroup3.add(plane);
  // SceneGroup3.position.set(-40, -396, -40);
  SceneGroup3.position.y = -396;
  scene.add(SceneGroup3);

  let currentPage = 0;
  function scroll() {
    const newPage = Math.round(window.scrollY / window.innerHeight);
    let y = -(200 * (1 + window.scrollY / window.innerHeight) - 200) + 10;
    camera.position.y = y;
    camera.lookAt(0, y, 0);
    // console.log(newPage, y);

    if (newPage != currentPage) {
      currentPage = newPage;
      gsap.fromTo(
        `.page${currentPage} h1`,
        { x: -300 },
        { x: 0, rotate: "+=360", duration: 1 }
      );
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
    let arr = [];
    for (let i in cubs) {
      arr.push(cubs[i].cube);
    }
    let result = raycaster.intersectObjects(arr);
    //   console.log(result);
    //   result[0].object.material = redMaterial;
    for (let i in cubs) {
      // 0是选中的第一个
      cubs[i].cube.material = yellowMaterial;
      cubs[i].line.material = lineMaterial;
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
  lightFolder.add(pointLight, 'intensity', 0, 1000000).step(1).name('点光源亮度');
  lightFolder.add(pointLight, 'distance', 0, 1000).step(1).name('点光源照射距离');
  lightFolder.add(pointLight.position, 'x', -100, 100).step(1).name('点光源X轴');
  lightFolder.add(pointLight.position, 'y', -100, 100).step(1).name('点光源Y轴');
  lightFolder.add(pointLight.position, 'z', -100, 100).step(1).name('点光源Z轴');

  // gsap.to(boxGroup.rotation, {
  //   x: "+=" + Math.PI * 2,
  //   y: "+=" + Math.PI * 2,
  //   duration: 10,
  //   ease: "power2.inOut",
  //   repeat: -1,
  // });
  // gsap.to(points.rotation, {
  //   y: "+=" + Math.PI * 2,
  //   duration: 12,
  //   ease: "power2.inOut",
  //   repeat: -1,
  // });
  // gsap.to(smallBall.position, {
  //   x: -3,
  //   duration: 6,
  //   ease: "power2.inOut",
  //   repeat: -1,
  //   yoyo: true,
  // });
  // gsap.to(smallBall.position, {
  //   y: 0,
  //   duration: 0.5,
  //   ease: "power2.inOut",
  //   repeat: -1,
  //   yoyo: true,
  // });

  let clock = new THREE.Clock();
  function animate() {
    let delta = clock.getElapsedTime();// 使动画播放更加平稳
    // 场景1,box旋转
    boxGroup.rotation.x = delta * 0.6;
    boxGroup.rotation.y = delta * 0.6;
    // 场景2,点旋转
    points.rotation.y = delta * 0.6;
    // 场景3,小球旋转
    sphere2.position.x = Math.sin(delta) * 8;
    sphere2.position.z = Math.cos(delta) * 8;
    sphere2.position.y = 10 + Math.sin(delta * 10);
    SceneGroup3.rotation.z = Math.sin(delta) * 0.05;
    SceneGroup3.rotation.x = Math.sin(delta) * 0.05;
    // 点光源跟随相机移动
    pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    // other
    stats.update();
    camera.updateMatrixWorld();
    // controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test15.current) {
      test15.current.appendChild(stats.dom);
      test15.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      window.addEventListener('click', active);
      window.addEventListener('scroll', scroll);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener('click', active);
      window.removeEventListener('scroll', scroll);
    }
  });

  return (<div className="test15" ref={test15}>
    <div class="page page0">
      <h1>Ray投射光线</h1>
      <h3>THREE.Raycaster实现3d交互效果</h3>
    </div>
    <div class="page page1">
      <h1>THREE.BufferGeometry!</h1>
      <h3>应用打造酷炫的粒子效果</h3>
    </div>
    <div class="page page2">
      <h1>活泼点光源</h1>
      <h3>点光源围绕照亮小球</h3>
    </div>
  </div>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(20, 10, 20);
  camera.lookAt(0, 10, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 可以开启关闭灯光
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 阴影类型
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  scene.add(new THREE.AxesHelper(20));

  let gridHelper = new THREE.GridHelper(20, 20);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  let pointLight = new THREE.PointLight(0xffffff, 10000, 80);
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  pointLight.castShadow = true;
  pointLight.decay = 2;
  pointLight.shadow.mapSize.width = 1024; // default
  pointLight.shadow.mapSize.height = 1024; // default
  pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  scene.add(pointLight);

  // 添加一个聚光灯
  let spotLight = new THREE.SpotLight(0xffffff, 10000);
  spotLight.position.set(0, -360, 0);
  spotLight.target.position.set(0, -396, 0); // 聚光灯照向的目标
  spotLight.castShadow = true; // 计算阴影
  spotLight.angle = Math.PI / 6; // 设置聚光灯角度
  spotLight.distance = 1000; // 聚光灯照射距离
  spotLight.penumbra = 0.1; // 设置聚光灯半影衰减百分比
  spotLight.decay = 2.4; // 设置聚光灯的衰减量
  // spotLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  /* 几何体影子清晰度 */
  spotLight.shadow.mapSize.width = 1024; // 设置阴影贴图的宽
  spotLight.shadow.mapSize.height = 1024; // 设置阴影贴图的高
  scene.add(spotLight);

  let spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, pointLight, spotLight, ambientLight, ResizeWindow };
}

