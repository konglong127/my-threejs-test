import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as CANNON from "cannon-es";

export default function Test1() {
  const test1 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  /* -------------------------------- 点材质1 -------------------------- */
  // // 创建三角形酷炫物体
  // // 添加物体
  // // 创建几何体
  // var sjxGroup = new THREE.Group();
  // for (let i = 0; i < 50; i++) {
  //   // 每一个三角形，需要3个顶点，每个顶点需要3个值
  //   const geometry = new THREE.BufferGeometry();
  //   const positionArray = new Float32Array(9);
  //   for (let j = 0; j < 9; j++) {
  //     if (j % 3 == 1) {
  //       positionArray[j] = Math.random() * 10 - 5;
  //     } else {
  //       positionArray[j] = Math.random() * 10 - 5;
  //     }
  //   }
  //   geometry.setAttribute(
  //     "position",
  //     new THREE.BufferAttribute(positionArray, 3)
  //   );
  //   let color = new THREE.Color(Math.random(), Math.random(), Math.random());
  //   const material = new THREE.MeshBasicMaterial({
  //     color: color,
  //     transparent: true,
  //     opacity: 0.5,
  //     side: THREE.DoubleSide,
  //   });
  //   // 根据几何体和材质创建物体
  //   let sjxMesh = new THREE.Mesh(geometry, material);
  //   //   console.log(mesh);
  //   sjxGroup.add(sjxMesh);
  // }
  // // sjxGroup.position.set(0, -30, 0);
  // scene.add(sjxGroup);

  const sphereGeometry = new THREE.SphereGeometry(2, 20, 20);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0000ff,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 10, 0);
  sphere.castShadow = true; // 投射阴影
  sphere.receiveShadow = true; // 接收阴影

  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.castShadow = true; // 投射阴影
  plane.receiveShadow = true; // 接收阴影

  scene.add(sphere);
  scene.add(plane);

  // 创建物理世界
  const world = new CANNON.World();
  world.gravity.set(0, -9.8, 0); // 设置重力
  // 创建小球
  const sphereBodyMaterial = new CANNON.Material("default");
  // const defaultContactMaterial = new CANNON.ContactMaterial(sphereMaterial);
  const sphereBody = new CANNON.Body({
    shape: new CANNON.Sphere(2), // 创建物理小球
    position: new CANNON.Vec3(0, 10, 0), // 小球位置
    mass: 1, // 小球的质量
    material: sphereBodyMaterial, // 材质
  });
  world.addBody(sphereBody);
  // 创建地面
  const planeBodyMaterial = new CANNON.Material("floor");
  const planeBody = new CANNON.Body({
    shape: new CANNON.Plane(), // 创建物理地面
    position: new CANNON.Vec3(0, 0, 0), // 小球位置
    mass: 0, // 地面的质量,为0固定不动
  });
  // planeBody.mass = 0;
  // planeBody.addShape(new CANNON.Plane());
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  planeBody.material = planeBodyMaterial;
  world.addBody(planeBody);

  // 设置材质碰撞参数
  const defaultContactMaterial = new CANNON.ContactMaterial(
    sphereBodyMaterial,
    planeBodyMaterial,
    {
      friction: 0.1, // 摩擦力
      restitution: 0.7, // 弹性系数
    }
  );
  // 材料关联设置到物理世界
  world.addContactMaterial(defaultContactMaterial);
  world.defaultContactMaterial = defaultContactMaterial;

  // 小球碰撞的事件
  const hitSound = new Audio('../../public/hit.mp3');
  sphereBody.addEventListener("collide", (evt: any) => {
    console.log(evt);
    // 碰撞强度
    const impactStrength = evt.contact.getImpactVelocityAlongNormal();
    console.log(impactStrength);
    hitSound.currentTime = 0;
    hitSound.play();
  });

  const cubeArr: Array<{ body: CANNON.Body, mesh: THREE.Mesh }> = [];
  const cubeWorldMaterial = new CANNON.Material("cube");
  const createCube = () => {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: Math.random()*0xffffff,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    // cube.position.set(0, 10, 0);
    scene.add(cube);

    // 创建物理cube形状
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    // 创建物理世界的物体
    const cubeBody = new CANNON.Body({
      shape: cubeShape,
      // position: new CANNON.Vec3(0, 10, 0),
      position: new CANNON.Vec3(0, 0, 0),
      mass: 1,//   小球质量
      material: cubeWorldMaterial,//   物体材质
    });
    // 添加作用力,抛出物体
    cubeBody.applyLocalForce(
      new CANNON.Vec3(0, 300, 0), //添加的力的大小和方向
      new CANNON.Vec3(0, 0, 0) //施加的力所在的位置
    );
    // 将物体添加至物理世界
    world.addBody(cubeBody);
    // 添加监听碰撞事件
    function HitEvent(evt: any) {
      // 获取碰撞的强度
      //   console.log("hit", e);
      const impactStrength = evt.contact.getImpactVelocityAlongNormal();
      console.log(impactStrength);
      if (impactStrength > 2) {
        //   重新从零开始播放
        hitSound.currentTime = 0;
        hitSound.volume = impactStrength / Math.ceil(impactStrength) / 10; // 根据掉落高度设置音量
        hitSound.play();
      }
    }
    cubeBody.addEventListener("collide", HitEvent);
    cubeArr.push({
      mesh: cube,
      body: cubeBody,
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

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    let delta = clock.getDelta(); // 动画帧时间差
    // if (mixer) {
    //   mixer.update(delta);
    // }
    // pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    world.step(1 / 120, delta); // 更新物理世界
    sphere.position.copy(sphereBody.position); // 更新小球位置
    if (sphere.position.y < -100) {
      sphereBody.position.y = 100;
    }
    //   cube.position.copy(cubeBody.position);
    cubeArr.forEach((item) => {
      item.mesh.position.copy(item.body.position);
      // 设置渲染的物体跟随物理的物体旋转
      item.mesh.quaternion.copy(item.body.quaternion);
    });
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test1.current) {
      test1.current.appendChild(stats.dom);
      test1.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      window.addEventListener('click', createCube);
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener('click', createCube);
    }
  });

  return (<>
    <div ref={test1}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 1, 0);

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

  // 点光影
  // let pointLight = new THREE.PointLight(0xffffff, 100000, 20);
  // pointLight.position.set(0, 10, 0);
  // pointLight.castShadow = true;
  // pointLight.decay = 2;
  // pointLight.shadow.mapSize.width = 1024; // default
  // pointLight.shadow.mapSize.height = 1024; // default
  // pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  // scene.add(pointLight);

  // 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight
    .position
    .set(20, 20, 20)
  // .normalize()
  // .multiplyScalar(- 200);
  // 修改照射目标位置
  directionalLight.target.position.set(0, 0, 0);
  // 平行光可以投射阴影
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  // 平行光阴影范围
  directionalLight.shadow.camera.left = -20;//默认-5
  directionalLight.shadow.camera.right = 20;//默认-5
  directionalLight.shadow.camera.top = 20;//默认-5,远处
  directionalLight.shadow.camera.bottom = -20;//默认-5
  directionalLight.shadow.camera.near = 0.1;//默认0.5
  directionalLight.shadow.camera.far = 200;//默认50,多远
  directionalLight.shadow.mapSize.width = 1024;//默认512
  directionalLight.shadow.mapSize.height = 1024;//默认512
  directionalLight.shadow.bias = -0.01; // 去除模糊
  // 平行光辅助器
  let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(directionalLightHelper);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ambientLight, ResizeWindow };
}
