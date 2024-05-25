import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { FBXLoader, GLTF, GLTFLoader, Octree, OctreeHelper, OrbitControls } from "three/examples/jsm/Addons.js";
import { Capsule } from 'three/addons/math/Capsule.js';
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
  const { water, sky: _sky, createSun } = createEnvironment(scene, renderer);
  const gui = initGui();
  const stats = new Stats(); // 帧数
  // const controls = new OrbitControls(camera, renderer.domElement); // control

  const keyStates: Record<string, any> = {};
  let playerOnFloor = false;
  const playerVelocity = new THREE.Vector3();
  const playerDirection = new THREE.Vector3();
  const STEPS_PER_FRAME = 5;
  const GRAVITY = 30;
  // 创建胶囊碰撞体
  const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
  let player: GLTF | null = null;
  const worldOctree = new Octree();
  camera.rotation.order = 'YXZ';
  // let mouseTime = 0;

  let modelAction: THREE.AnimationMixer | null = null;
  const loader = new GLTFLoader();
  loader.load('../../public/model/Xbot.glb', function (gltf) {
    player = gltf;
    scene.add(gltf.scene);
    console.log(gltf.animations);
    // 添加骨骼
    // let skeleton = new THREE.SkeletonHelper( model );
    // skeleton.visible = true;
    // scene.add( skeleton );
    // 获取动画
    modelAction = new THREE.AnimationMixer(gltf.scene);
    const action = modelAction.clipAction(gltf.animations[2]);
    action.play();
  });

  loader.load('../../public/model/collision-world.glb', (gltf) => {
    scene.add(gltf.scene);

    worldOctree.fromGraphNode(gltf.scene);

    gltf.scene.traverse((child) => {
      let tmp = child as any;
      if (tmp.isMesh) {
        tmp.castShadow = true;
        tmp.receiveShadow = true;
        if (tmp.material.map) {
          tmp.material.map.anisotropy = 4;
        }
      }
    });

    // const helper = new OctreeHelper(worldOctree);
    // helper.visible = false;
    // scene.add(helper);

    // const gui = new GUI({ width: 200 });
    // gui.add({ debug: false }, 'debug')
    //   .onChange(function (value) {

    //     helper.visible = value;

    //   });

    // animate();
  });

  document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true;
  });

  document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false;
  });

  // mousedown锁住鼠标
  document.addEventListener('mousedown', () => {
    document.body.requestPointerLock();
    // mouseTime = performance.now();
  });

  document.body.addEventListener('mousemove', (event) => {
    // 如果锁住鼠标,相机跟随旋转
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
      if(player){
        player.scene.rotation.y += event.movementX / 500;
        // player.scene.rotation.x -= event.movementY / 500;
      }
    }
  });

  // 更新玩家位置
  function updatePlayer(deltaTime: number) {
    let damping = Math.exp(- 4 * deltaTime) - 1;

    if (!playerOnFloor) {

      playerVelocity.y -= GRAVITY * deltaTime;

      // small air resistance
      damping *= 0.1;
    }

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    playerCollisions();

    camera.position.copy(playerCollider.end);
    // player!!!!!!!!!!!!!!!!!!!!!!!!
    // if (player) {
      // console.log(playerCollider.end);
      // player.scene.position.copy(playerCollider.end);
      // camera.position.y += 1.5;
      // camera.position.x-=0.5;
      // camera.position.z-=0.5;
      // player.scene.position.y -= 1.5;
      // player.scene.position.x += 1.5;
      // player.scene.position.z += 1.5;
    // }
  }

  function playerCollisions() {
    const result = worldOctree.capsuleIntersect(playerCollider);

    playerOnFloor = false;

    if (result) {
      playerOnFloor = result.normal.y > 0;

      if (!playerOnFloor) {
        playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
      }
      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;
  }

  function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
  }

  function controls(deltaTime: number) {
    // gives a bit of air control
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
    if (keyStates['KeyW']) {
      playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }
    if (keyStates['KeyS']) {
      playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));
    }
    if (keyStates['KeyA']) {
      playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));
    }
    if (keyStates['KeyD']) {
      playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }
    if (playerOnFloor) {
      if (keyStates['Space']) {
        playerVelocity.y = 15;
      }
    }
  }

  function teleportPlayerIfOob() {
    if (camera.position.y <= - 25) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1, 0);
      playerCollider.radius = 0.35;
      camera.position.copy(playerCollider.end);
      camera.rotation.set(0, 0, 0);
      // if (player) {
      //   player.scene.position.copy(playerCollider.end);
      // }
    }
  }

  let clock = new THREE.Clock();
  function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

      controls(deltaTime);

      updatePlayer(deltaTime);

      // updateSpheres( deltaTime );

      teleportPlayerIfOob();
    }

    water.material.uniforms['time'].value += 1.0 / 300.0;

    // 使动画播放更加平稳
    let delta = clock.getDelta();
    if (modelAction) {
      modelAction.update(delta);
    }

    // if (tween)
    TWEEN.update();
    // tween.update();
    // csm.update();
    stats.update();
    // controls.update();
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
  // camera.position.set(4, 4, 4);
  // camera.lookAt(0, 1, 0);

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
  // let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  // scene.add(directionalLightHelper);

  // scene.background = new THREE.Color(0xcccccc);

  // 半球光
  // const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 30);
  // hemisphereLight.position.set(0, 30, 0);
  // scene.add(hemisphereLight);

  return { scene, renderer, camera, ResizeWindow };
}


function createEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
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

  return { water, sky, createSun };
}

function initGui() {
  const gui = new GUI();

  gui.add({
    Fullscreen: () => {
      document.body.requestFullscreen();
    }
  }, 'Fullscreen');
  gui.add({
    ExitFullscreen: () => {
      document.exitFullscreen();
    }
  }, 'ExitFullscreen');

  return gui;
}