import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
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
  const guiObject = {
    random: false, // 是否要组合成立方体
    edge: false, // 组合之后是否要显示立方体
    pure: false, // 是否要现在显示立方体
  };
  const gui = new GUI(); // 调试

  let vertices: Array<number> = [];
  let colors: Array<number> = [];
  function createEdgeBox() {
    vertices = [];
    colors = [];
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 10; ++j) {
        for (let k = 0; k < 10; ++k) {
          if (i < 2 || k < 2 || j < 2 || j > 7 || i > 7 || k > 7) {
            const x = i * 3 - 15;
            const y = j * 3 + 1;
            const z = k * 3 - 15;
            vertices.push(x, y, z);
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            colors.push(r, g, b);
          }
        }
      }
    }
  }

  function createRandomBox() {
    vertices = [];
    colors = [];
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 10; ++j) {
        for (let k = 0; k < 10; ++k) {
          if (i < 2 || k < 2 || j < 2 || j > 7 || i > 7 || k > 7) {
            const x = Math.floor(Math.random() * 40) - 20;
            const y = Math.floor(Math.random() * 40) + 1;
            const z = Math.floor(Math.random() * 40) - 20;
            vertices.push(x, y, z);
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            colors.push(r, g, b);
          }
        }
      }
    }
  }
  createRandomBox();

  // 创建点材质
  let pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    map: getSprite(), // 可透明纹理贴图
    transparent: true,
    depthWrite: false, // 去除黑色部分产生的白色阴影
    blending: THREE.AdditiveBlending, // 点光源叠加,发光
    vertexColors: true, // 开起顶点颜色设置
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  points.position.set(0, 5, 0);
  scene.add(points);

  function getSprite() {
    const canvas = document.createElement('canvas');
    const size = 4;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const c = canvas.getContext('2d');

    if (c) {
      const gradient = c.createRadialGradient(size, size, 0, size, size, size);
      gradient.addColorStop(0.1, 'rgba(0,255,255,1)');

      c.fillStyle = '#00ffff';
      c.arc(size, size, size / 1.5, 0, Math.PI * 2);
      c.fill();
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  let boxGeometry = new THREE.BoxGeometry(20, 20, 20, 32, 32);
  let boxMaterial = new THREE.MeshNormalMaterial({});
  let box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.visible = false;
  box.position.set(0, 11, 0);
  scene.add(box);

  let tween: TWEEN.Tween<THREE.TypedArray> | null = null;
  gui.add(guiObject, 'random').onChange(() => {
    box.visible = false;
    createRandomBox();
    console.log(points.geometry.attributes.position.array);

    tween = new TWEEN.Tween(points.geometry.attributes.position.array)
      .to(new THREE.Float32BufferAttribute(vertices, 3), 2000)
      .start()
      .onUpdate(() => {
        points.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        // for (let i = 0; i < vertices.length; ++i) {
        //   points.geometry.attributes.position.array[i] = vertices[i];
        // }
        points.geometry.attributes.position.needsUpdate = true;
      });
  });
  gui.add(guiObject, 'edge').onChange((res: boolean) => {
    box.visible = false;
    if (res) {
      console.log(vertices);
      createEdgeBox();
      console.log(vertices);
    } else {
      createRandomBox();
    }
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  });
  gui.add(guiObject, 'pure').onChange((res: boolean) => {
    if (res) {
      points.visible = false;
      box.visible = true;
    } else {
      points.visible = true;
      box.visible = false;
    }
  });

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

    points.rotation.y += 0.004;
    if (Math.floor(points.rotation.y) == 360) {
      points.rotation.y = 0;
    }
    // if (tween)
    TWEEN.update();
    // tween.update();
    // csm.update();
    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    // effectComposer.render();
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
  camera.position.set(36, 36, 36);
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
