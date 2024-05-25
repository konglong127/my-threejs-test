import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { CSM } from "three/addons/csm/CSM.js";
// import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test5() {
  const test3 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // const geometry = new THREE.CylinderGeometry(2, 2, 40, 8, 12)
  // const material = new THREE.MeshPhongMaterial();
  // // 蒙皮 - 皮肤
  // const mesh = new THREE.SkinnedMesh(geometry, material)
  // scene.add(mesh);

  const geometry = new THREE.CylinderGeometry(2, 2, 40, 8, 12);
  const material = new THREE.MeshPhongMaterial();
  // 蒙皮 - 皮肤
  const mesh = new THREE.SkinnedMesh(geometry, material);
  scene.add(mesh);

  // 首先，创建一个起点. 创建骨骼系统
  let b1 = new THREE.Bone();
  b1.position.set(0, -20, 0);

  let b2 = new THREE.Bone();
  b1.add(b2)
  b2.position.set(0, 10, 0);

  let b3 = new THREE.Bone();
  b2.add(b3)
  b3.position.set(0, 10, 0)

  let b4 = new THREE.Bone();
  b3.add(b4)
  b4.position.set(0, 10, 0)

  let b5 = new THREE.Bone();
  b4.add(b5)
  b5.position.set(0, 10, 0)

  // 创建骨架
  const skeleton = new THREE.Skeleton([b1, b2, b3, b4, b5])
  mesh.add(b1)
  mesh.bind(skeleton)

  // 添加权重   设置的就是蒙皮的权重，  顶点的蒙皮索引
  const index = [] // 索引
  const weight = [] // 权重

  const arr = geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    const y = arr[i + 1] + 20

    // const index = Math.floor(y / 10);
    const weightValue = (y % 10) / 10

    index.push(Math.floor(y / 10), Math.floor(y / 10) + 1, 0, 0)
    weight.push(1 - weightValue, weightValue, 0, 0);
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(index, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weight, 4));

  let step = 0.1;




  function CreateWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('../../public/texture/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = - Math.PI / 2;
    return water;
  }
  const water = CreateWater();
  scene.add(water);

  function CreateSky() {
    const sky = new Sky();
    sky.scale.setScalar(10000);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    return sky;
  }
  const sky = CreateSky();
  scene.add(sky);

  // sun
  function createSun() {
    const sun = new THREE.Vector3();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    const parameters = {
      elevation: 24,
      azimuth: 180
    };

    let renderTarget: THREE.WebGLRenderTarget | null = null;

    return function updateSun() {

      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();

      if (renderTarget) renderTarget.dispose();

      sceneEnv.add(sky);
      renderTarget = pmremGenerator.fromScene(sceneEnv);
      scene.add(sky);

      scene.environment = renderTarget.texture;
    }
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

  function animate() {
    // 添加边界
    if (
      mesh.skeleton.bones[0].rotation.x > 0.3 ||
      mesh.skeleton.bones[0].rotation.x < -0.3
    ) {
      step = -step
    }

    for (let i = 0; i < mesh.skeleton.bones.length; i++) {
      mesh.skeleton.bones[i].rotation.x += step * Math.PI / 180;
    }

    water.material.uniforms['time'].value += 1.0 / 300.0;

    // tween.update();
    // csm.update();
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test3.current) {
      test3.current.appendChild(stats.dom);
      test3.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      createSun()();
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test3}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 阴影类型,软阴影,更圆滑
  // renderer.toneMapping = THREE.ReinhardToneMapping; // 可以开启关闭灯光
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setPixelRatio(window.devicePixelRatio);
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

  // let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);

  // 点光影
  // let pointLight = new THREE.PointLight(0xffffff, 100000, 20);
  // pointLight.position.set(0, 10, 0);
  // pointLight.castShadow = true;
  // pointLight.decay = 2;
  // pointLight.shadow.mapSize.width = 1024; // default
  // pointLight.shadow.mapSize.height = 1024; // default
  // pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  // scene.add(pointLight);

  // 聚光灯
  // let spotLight = new THREE.SpotLight(0xffffff, 1, 200);
  // spotLight.position.set(0, 30, 0);
  // spotLight.target.position.set(0, 1, 0); // 聚光灯照向的目标
  // spotLight.castShadow = true; // 计算阴影
  // spotLight.angle = Math.PI / 8; // 设置聚光灯角度
  // spotLight.distance = 30; // 聚光灯照射距离
  // spotLight.penumbra = 0.1; // 设置聚光灯半影衰减百分比
  // spotLight.decay = 0.1; // 设置聚光灯的衰减量
  // spotLight.power = 400; // 光照强度
  // /* 几何体影子清晰度 */
  // spotLight.shadow.mapSize.width = 1024; // 设置阴影贴图的宽
  // spotLight.shadow.mapSize.height = 1024; // 设置阴影贴图的高
  // spotLight.castShadow = true;
  // scene.add(spotLight);
  // let spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);

  // 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight
    .position
    .set(-1, -1, -1).normalize()
    .multiplyScalar(- 200);
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

  // scene.background = new THREE.Color(0xcccccc);

  // 半球光
  // const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 30);
  // hemisphereLight.position.set(0, 30, 0);
  // scene.add(hemisphereLight);

  return { scene, renderer, camera, ResizeWindow };
}
