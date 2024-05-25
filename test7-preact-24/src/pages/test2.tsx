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
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

export default function Test5() {
  const test5 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  // const controls = new TrackballControls(camera, renderer.domElement);
  // const controls = new FirstPersonControls(camera, renderer.domElement);
  // controls.lookSpeed = 1
  // const controls = new FlyControls(camera, renderer.domElement);
  // controls.rollSpeed = 0.5
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // create ball
  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(geometry, material);
  ball.name = 'ball01';
  ball.position.set(0, 100, 0);
  scene.add(ball);

  const geometry2 = new THREE.SphereGeometry(2, 32, 32);
  const material2 = new THREE.MeshBasicMaterial({ color: 0xffcccc });
  const ball2 = new THREE.Mesh(geometry2, material2);
  ball2.name = 'ball02';
  ball2.position.set(5, 100, 0);
  scene.add(ball2);

  const geometry3 = new THREE.SphereGeometry(2, 32, 32);
  const material3 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const ball3 = new THREE.Mesh(geometry3, material3);
  ball3.name = 'ball03';
  ball3.position.set(-5, 100, 0);
  scene.add(ball3);

  // box
  let boxGeometry = new THREE.BoxGeometry(5, 5, 5);
  const lambert = new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const basic = new THREE.MeshBasicMaterial({ wireframe: true, side: THREE.DoubleSide });
  const box = new THREE.Mesh(boxGeometry, [lambert, basic, lambert, basic, lambert, basic]);
  box.name = 'box';
  box.position.set(0, 110, 0);
  scene.add(box);

  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  mtlLoader.load('../../public/model/city.mtl', (materials) => {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load('../../public/model/city.obj', (mesh) => {
      mesh.position.set(0, 3, 0)
      scene.add(mesh);
    });
  });



  let tween = new TWEEN.Tween(box.rotation).to({
    x: box.rotation.x + 2,
    y: box.rotation.y + 2,
    z: box.rotation.z + 2,
  }, 2000).start().repeat(Infinity);

  const canvasActive = (evt: MouseEvent) => {
    // 创建射线
    const raycaster = new THREE.Raycaster();
    // 创建鼠标向量
    const mouse = new THREE.Vector2();
    // 归一化，-1~1
    mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse.x, mouse.y);
    // 通过鼠标和相机位置更新射线
    raycaster.setFromCamera(mouse, camera);
    // 计算物体和射线的交点,能获取到点击的图形
    // const intersects = raycaster.intersectObjects(scene.children);
    const intersects = raycaster.intersectObjects([box, ball, ball2, ball3]);

    console.log(intersects);
    if (Array.isArray(intersects) && intersects.length) {

      for (let i in intersects) {
        console.log(intersects[i].object.name, (intersects[0].object as any).material);
        if (intersects[i].object.name.startsWith('ball')) {
          if ((intersects[0].object as any).material.color.getHex() === 0xff0000) {
            (intersects[0].object as any).material.color.set(0x0000ff);
          } else {
            (intersects[0].object as any).material.color.set(0xff0000);
          }
        }
      }
    }
  }

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
    water.material.uniforms['time'].value += 1.0 / 300.0;

    tween.update();
    // csm.update();
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test5.current) {
      test5.current.appendChild(stats.dom);
      test5.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      createSun()();
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test5} onClick={canvasActive}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.set(100, 100, 100);
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
