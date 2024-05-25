import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { CSM } from "three/addons/csm/CSM.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test5() {
  const test5 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  let csm = new CSM({
    mode: 'practical',
    maxFar: 1000,
    lightDirection: new THREE.Vector3(-1, -1, -1).normalize(),
    parent: scene,
    camera
  });
  csm.fade = true;// 阴影渐变更明显

  let planeGeometry = new THREE.PlaneGeometry(40, 40);
  let planeMaterial = new THREE.MeshToonMaterial({
    color: '#ff0000',
    side: THREE.DoubleSide
  });
  let plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = 1;
  plane.receiveShadow = true;
  scene.add(plane);
  // csm.setupMaterial(planeMaterial); // 设置级联阴影

  let boxGeometry = new THREE.BoxGeometry(5, 5, 5);
  let boxMaterial = new THREE.MeshPhongMaterial({
    specular: 0xffff00,
    shininess: 10,
    emissive: 0xffff00,
    emissiveIntensity: 0.2,
    color: 0xffff00,
    wireframe: false
  });
  let box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.y = 4;
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);
  // csm.setupMaterial(boxMaterial); // 设置级联阴影

  // 给box加线框
  let edgesGeometry = new THREE.WireframeGeometry(boxGeometry);
  let lineMesh = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.LineSegments(edgesGeometry, lineMesh);
  line.position.set(box.position.x, box.position.y, box.position.z);
  scene.add(line);

  let sphereGeometry = new THREE.SphereGeometry(3);
  let sphereMaterial = new THREE.MeshNormalMaterial();
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y = 4;
  sphere.position.x = 10;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.name = 'sphere01';
  scene.add(sphere);
  console.log(scene.getObjectByName('sphere01'));
  console.log(scene.children);
  // 场景中物体全部设置为相同材质
  // scene.overrideMaterial=new THREE.MeshLambertMaterial();
  // scene.remove(sphere);
  // csm.setupMaterial(sphereMaterial); // 设置级联阴影
  let edgesGeometry2 = new THREE.WireframeGeometry(sphereGeometry);
  let lineDashedMesh = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: 1,
    gapSize: 2,
  });
  const lineDashed = new THREE.LineSegments(edgesGeometry2, lineDashedMesh);
  lineDashed.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
  lineDashed.computeLineDistances();
  scene.add(lineDashed);

  // 自定义绘制平面
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
  const geometry = new THREE.ShapeGeometry(heartShape);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide
  });
  const shape1 = new THREE.Mesh(geometry, material);
  shape1.scale.set(0.5, 0.5, 0.5);
  shape1.position.set(0, 8, 0);
  scene.add(shape1);

  const shapeLine = new THREE.Shape();
  shapeLine.moveTo(0, 0);
  shapeLine.lineTo(0, 3);
  shapeLine.lineTo(3, 3);
  shapeLine.lineTo(3, 0);
  shapeLine.lineTo(0, 0);
  const geometry2 = new THREE.ShapeGeometry(shapeLine);
  const shape2 = new THREE.Mesh(geometry2, material);
  shape2.scale.set(0.5, 0.5, 0.5);
  shape2.position.set(8, 8, 0);
  scene.add(shape2);

  const geometry3 = new THREE.TorusGeometry(5, 2, 16, 60, Math.PI * 2);
  const material3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const torus = new THREE.Mesh(geometry3, material3);
  torus.position.set(-13, 10, 0);
  scene.add(torus);
  let edgesGeometry3 = new THREE.WireframeGeometry(geometry3);
  let lineMesh2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const line2 = new THREE.LineSegments(edgesGeometry3, lineMesh2);
  line2.position.set(torus.position.x, torus.position.y, torus.position.z);
  scene.add(line2);

  const verticesOfCube = [
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ];

  const indicesOfFaces = [
    2, 1, 0, 0, 3, 2,
    0, 4, 7, 7, 3, 0,
    0, 1, 5, 5, 4, 0,
    1, 2, 6, 6, 5, 1,
    2, 3, 7, 7, 6, 2,
    4, 5, 6, 6, 7, 4
  ];

  const geometry4 = new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, 6, 2);
  const mesh3 = new THREE.Mesh(geometry4, material);
  mesh3.position.set(18, 10, 0);
  scene.add(mesh3);

  new FontLoader().load('../../public/fonts/helvetiker_regular.typeface.json', function (font) {
    let materials = [
      new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true }), // front
      new THREE.MeshPhongMaterial({ color: 0x00ff00 }) // side
    ];

    const textGeo = new TextGeometry('Hello three.js!', {
      font: font,
      size: 80,  // 文字大小
      depth: 5,  // 文字厚度
      curveSegments: 10, // 分段数，越多越圆滑
      bevelEnabled: true,
      bevelThickness: 6, // 文字厚度
      bevelSize: 2, // 粗细
      bevelSegments: 4, // 分段数，越多越圆滑
    });

    textGeo.computeBoundingBox();

    // const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    let textMesh1 = new THREE.Mesh(textGeo, materials);

    // textMesh1.position.x = centerOffset;
    // textMesh1.position.y = hover;
    // textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;
    textMesh1.scale.set(0.08, 0.08, 0.08);
    textMesh1.position.set(-25, 20, 0);

    scene.add(textMesh1);
  });

  scene.fog = new THREE.Fog(0xcccccc, 1, 100);

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
  const sun = new THREE.Vector3();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  const parameters = {
    elevation: 24,
    azimuth: 180
  };

  let renderTarget: THREE.WebGLRenderTarget | null = null;

  function updateSun() {

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

    csm.update();
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
      updateSun();
      animate();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test5}></div>
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
