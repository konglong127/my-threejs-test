import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { FBXLoader, GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { CSM } from "three/addons/csm/CSM.js";
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
// import * as CANNON from "cannon-es";
// import { AmmoPhysics } from 'three/examples/jsm/physics/AmmoPhysics.js';
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
  // const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI();
  camera.rotation.order = 'YXZ';

  // let physics = await AmmoPhysics();

  let csm = new CSM({
    mode: 'practical',
    maxFar: 1000,
    lightDirection: new THREE.Vector3(-1, -1, -1).normalize(),
    parent: scene,
    camera
  });
  csm.fade = true;// 阴影渐变更明显

  // 加载地图模型
  const gltfLoader = new GLTFLoader();
  // 创建 DRACOLoader 的实例
  const dracoLoader = new DRACOLoader();
  // 设置draco路径
  dracoLoader.setDecoderPath("../../public/draco/");
  // 设置gltf加载器draco解码器
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    // 模型路径
    "../../public/model/city.glb",
    // 加载完成回调
    (gltf) => {
      // console.log(gltf);
      gltf.scene.position.y += 1;
      // gltf.scene.traverse((child) => {
      //   let tmp = child as any;
      //   if (tmp.isMesh) {
      //     tmp.castShadow = true;
      //     tmp.receiveShadow = true;
      //     if (tmp.material.map) {
      //       tmp.material.map.anisotropy = 4;
      //     }
      //   }
      // });
      gltf.scene.userData.physics = { mass: 0 };
      scene.add(gltf.scene);
    }
  );

  // 加载角色模型
  let model: THREE.Group<THREE.Object3DEventMap> | null = null;
  let mixer: THREE.AnimationMixer | null = null;
  let actions: { [key: string]: THREE.AnimationAction | null } = { current: null };
  gltfLoader.load("../../public/model/Xbot.glb", (gltf) => {
    gltf.scene.scale.set(0.4, 0.4, 0.4);
    gltf.scene.position.y += 1;
    gltf.scene.position.z -= 2;
    model = gltf.scene;
    // gltf.scene.traverse((child) => {
    //   let tmp = child as any;
    //   if (tmp.isMesh) {
    //     tmp.castShadow = true;
    //     tmp.receiveShadow = true;
    //     if (tmp.material.map) {
    //       tmp.material.map.anisotropy = 4;
    //     }
    //     // csm.setupMaterial(tmp.material);
    //   }
    // });
    gltf.scene.userData.physics = { mass: 1 };

    scene.add(gltf.scene);
    console.log(gltf);
    mixer = new THREE.AnimationMixer(gltf.scene);
    actions.agress = mixer.clipAction(gltf.animations[0]);
    actions.handShake = mixer.clipAction(gltf.animations[1]);
    actions.idle = mixer.clipAction(gltf.animations[2]);
    actions.run = mixer.clipAction(gltf.animations[3]);
    actions.sadPose = mixer.clipAction(gltf.animations[4]);
    actions.sneakPose = mixer.clipAction(gltf.animations[5]);
    actions.walk = mixer.clipAction(gltf.animations[6]);
    actions.current = mixer.clipAction(gltf.animations[2]);

    actions.current.play();

    camera.position.set(
      model.position.x,
      model.position.y + 0.5,
      model.position.z - 0.3,
    );
    camera.lookAt(
      model.position.x,
      model.position.y + 0.5,
      model.position.z,
    );
    // camera.rotation.y = Math.PI;
    model.add(camera);
  });

  // 视频纹理，在几何体表面播放视频
  // const video = document.createElement('video');
  // video.src = '../../public/bg2.mp4';
  // video.autoplay = true;
  // video.loop = true;
  // video.muted = true;
  // const geometry = new THREE.BoxGeometry(6, 6, 1);
  // const videoMaterial = new THREE.MeshBasicMaterial();
  // const plane = new THREE.Mesh(geometry, videoMaterial);
  // plane.position.set(0, 3, 3);
  // scene.add(plane);

  /* ------------------ 控制事件 ------------------------- */
  let addSpeed = 0;
  let keyPress: { [key: string]: boolean } = {
    w: false, a: false, s: false, d: false, shift: false,
  };
  function StartMove(evt: KeyboardEvent) {
    if (!isLocked) return;

    if (evt.key.toLowerCase() === 'w') {
      keyPress.w = true;
    }
    if (evt.key.toLowerCase() === 'a') {
      addSpeed = 0;
      keyPress.a = true;
    }
    if (evt.key.toLowerCase() === 's') {
      addSpeed = 0;
      keyPress.s = true;
    }
    if (evt.key.toLowerCase() === 'd') {
      addSpeed = 0;
      keyPress.d = true;
    }
    if (evt.key === 'Shift') {
      keyPress.shift = true;
    }
    for (let i in keyPress) {
      if (keyPress[i] && !keyPress.shift) {
        Walk();
      }
    }
    if (keyPress.shift && keyPress.w ||
      keyPress.shift && keyPress.d ||
      keyPress.shift && keyPress.s ||
      keyPress.shift && keyPress.a) {
      Run();
    }
  }

  function StopMove(evt: KeyboardEvent) {

    console.log('keyup=', evt.key);
    if (evt.key.toLowerCase() === 'w') {
      keyPress.w = false;
    }
    if (evt.key.toLowerCase() === 'a') {
      keyPress.a = false;
    }
    if (evt.key.toLowerCase() === 's') {
      keyPress.s = false;
    }
    if (evt.key.toLowerCase() === 'd') {
      keyPress.d = false;
    }
    if (evt.key === 'Shift') {
      keyPress.shift = false;
    }
    let count = 0;
    for (let i in keyPress) {
      if (!keyPress[i]) {
        count++;
      }
    }
    console.log(count, keyPress);
    if (count === Object.keys(keyPress).length ||
      !keyPress.a && !keyPress.w && !keyPress.s && !keyPress.d) {
      Stand();
    }
  }

  // let prePos: number = 0;
  function RotateModel(evt: MouseEvent) {
    if (!model || !isLocked) return;

    // if (prePos) {
    //   // 控制视角左右转动
    //   model.rotateY((prePos - evt.clientX) * 0.01);
    // }
    // prePos = evt.clientX;

    // 控制视角左右转动
    model.rotation.y -= evt.movementX / 500;
    // 控制视角上下转动
    // camera.rotation.y -= evt.movementX / 500;
    camera.rotation.x -= evt.movementY / 500;
  }

  function LockMouse() {
    document.body.requestPointerLock();
  }

  let isLocked: boolean = false;
  function LockState() {
    if (document.pointerLockElement) {
      isLocked = true;
    } else {
      isLocked = false;
    }
    console.log(isLocked);
  }

  // 碰撞检测
  function Collision(type: 'w' | 'a' | 's' | 'd') {
    const playerHalf = new THREE.Vector3(0, 1, 0);
    // 利用射线做碰撞检测
    if (model) {
      const curPos = model.position.clone();
      if (type === 'w') model.translateZ(1);
      if (type === 's') model.translateZ(-1);
      if (type === 'a') model.translateX(1);
      if (type === 'd') model.translateX(-1);
      const frontPos = model.position.clone();
      if (type === 'w') model.translateZ(-1);
      if (type === 's') model.translateZ(1);
      if (type === 'a') model.translateX(-1);
      if (type === 'd') model.translateX(1);

      const frontVector3 = frontPos.sub(curPos).normalize();
      const raycasterFront = new THREE.Raycaster(model.position.clone().add(playerHalf), frontVector3);
      const collisionResultFront = raycasterFront.intersectObjects(scene.children);

      if (collisionResultFront && collisionResultFront[0] && collisionResultFront[0].distance > 1) {
        console.log('move continue');
        return true;
      }
      // if (collisionResultFront && collisionResultFront.length===0) {
      //   console.log('move continue???');
      // }
    }
    return false;
  }

  /* ------------------------------ 动画 ---------------------------- */
  function Run() {
    if (actions.run && actions.current) {
      if (!actions.run.isRunning()) {
        actions.run.enabled = true;
        actions.run.setEffectiveTimeScale(1);
        actions.run.setEffectiveWeight(1);
        // 动画过度
        actions.current.crossFadeTo(actions.run, 0.5, true);
        actions.current = actions.run;
        actions.current.play();
      }
    }
  }

  function Walk() {
    if (actions.walk && actions.current) {
      if (!actions.walk.isRunning()) {
        actions.walk.enabled = true;
        actions.walk.setEffectiveTimeScale(1);
        actions.walk.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.walk, 0.5, true);
        actions.current = actions.walk;
        actions.current.play();
      }
    }
  }

  function Stand() {
    if (actions.idle && actions.current) {
      if (!actions.idle.isRunning()) {
        actions.idle.enabled = true;
        actions.idle.setEffectiveTimeScale(1);
        actions.idle.setEffectiveWeight(1);
        actions.current.crossFadeTo(actions.idle, 0.5, true);
        actions.current = actions.idle;
        actions.current.play();
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

  let clock = new THREE.Clock();
  function animate() {
    // 使动画播放更加平稳
    let delta = clock.getDelta();
    water.material.uniforms['time'].value += 1.0 / 300.0;

    if (mixer) {
      mixer.update(delta);
    }

    if (model && isLocked) {
  
      if (keyPress.w && Collision('w')) {
        // model.position
        if (keyPress.shift) {
          if (addSpeed <= 0.02) {
            addSpeed += 0.001;
          }
          model.translateZ(0.04 + addSpeed);
        } else {
          model.translateZ(0.02);
        }
      }
      if (keyPress.a && Collision('a')) {
        if (keyPress.shift) {
          model.translateX(0.03);
        } else {
          model.translateX(0.02);
        }
      }
      if (keyPress.s && Collision('s')) {
        if (keyPress.shift) {
          model.translateZ(-0.03);
        } else {
          model.translateZ(-0.02);
        }
      }
      if (keyPress.d && Collision('d')) {
        if (keyPress.shift) {
          model.translateX(-0.03);
        } else {
          model.translateX(-0.02);
        }
      }
    }

    // if (tween)
    TWEEN.update();
    // tween.update();
    csm.update();
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
      window.addEventListener('keydown', StartMove);
      window.addEventListener('keyup', StopMove);
      window.addEventListener('mousemove', RotateModel);
      window.addEventListener('mousedown', LockMouse);
      document.addEventListener('pointerlockchange', LockState);
      createSun()();
      animate();
    }
    // // const video = document.getElementById('video') as HTMLVideoElement;
    // if (video) {
    //   plane.material.map = new THREE.VideoTexture(video);
    //   document.onclick = () => {
    //     video.play();
    //   }
    // }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener('keydown', StartMove);
      window.removeEventListener('keyup', StopMove);
      window.removeEventListener('mousemove', RotateModel);
      window.removeEventListener('mousedown', LockMouse);
      document.removeEventListener('pointerlockchange', LockState);
    }
  });

  return (<>
    <div ref={test3}></div>
    {/* <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none;">
      <source src="../../public/bg2.mp4"  type="video/mp4"/>
    </video> */}
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
  // camera.position.set(6, 6, 6);
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
  // directionalLight.position.set(100, 100, 30);
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
