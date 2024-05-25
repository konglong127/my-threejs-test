import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default function Test5() {
  const test5 = useRef<HTMLDivElement>(null);
  const { scene, renderer, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  // 变换控制器
  const transformControls = new TransformControls(camera, renderer.domElement);
  // 移动物体时重新渲染
  transformControls.addEventListener('change', () => renderer.render(scene, camera));
  // 当拖动物体时,禁用轨道控制器
  transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
  });
  // 变化监听,吸附在地面
  transformControls.addEventListener('change', function () {
    if (eventObj.isClampGroup && transformControls.object) {
      (transformControls.object as any).position.y = 0;
    }
  });
  scene.add(transformControls);

  function tControlSelect(mesh: THREE.Mesh) {
    transformControls.attach(mesh);
  }

  let livingroom: any = null;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("../../public/draco");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("../../public/model/livingroom.glb", (gltf) => {
    // scene.add(gltf.scene);
    livingroom = gltf.scene;
    gltf.scene.scale.set(3, 3, 3);
  });

  let modelList = [
    {
      name: "添加鸭子",
      path: "../../public/model/duck/duck.gltf",
    },
    {
      name: "添加bush",
      path: "../../public/model/bush.gltf",
    },
    {
      name: "添加tree",
      path: "../../public/model/tree.gltf",
    },
  ];
  let modelList2: any = [];
  let eventObj = {
    Fullscreen: function () {
      document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
      document.exitFullscreen();
    },
    addScene() {
      livingroom.receiveShadow = true;
      livingroom.castShadow = true;
      scene.add(livingroom);
    },
    setTranslate() {
      transformControls.setMode('translate');
    },
    setRotate() {
      transformControls.setMode('rotate');
    },
    setScale() {
      transformControls.setMode('scale');
    },
    toggleSpace() {
      transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
    },
    closeController() {
      transformControls.detach();
    },
    translateSnapNum: 1,
    rotateSnapNum: 0.1,
    scaleSapNum: 0.2,
    isClampGroup: true,
    isLight: true
  };
  let snapFolder = gui.addFolder("固定设置");
  snapFolder.add(eventObj, "translateSnapNum", 0, 10, 1).name("平移固定值").onChange(() => {
    transformControls.setTranslationSnap(eventObj.translateSnapNum)
  });
  snapFolder.add(eventObj, "rotateSnapNum", 0, 360, 1).step(0.1).name("旋转固定值").onChange(() => {
    transformControls.setRotationSnap(eventObj.rotateSnapNum / 180 * Math.PI);
  });
  snapFolder.add(eventObj, "scaleSapNum", 0, 10, 1).step(0.1).name("缩放固定值").onChange(() => {
    transformControls.setScaleSnap(eventObj.scaleSapNum);
  });
  snapFolder.add(eventObj, 'isClampGroup').name('是否吸附在地面');
  snapFolder.add(eventObj, 'isLight').name('是否开启灯光').onChange((value) => {
    if (value) {
      renderer.toneMappingExposure = 1;
    } else {
      renderer.toneMappingExposure = 0.1;
    }
  });
  function createModel() {
    // 添加按钮
    gui.add(eventObj, "Fullscreen").name("全屏");
    gui.add(eventObj, "ExitFullscreen").name("退出全屏");
    gui.add(eventObj, "addScene").name("添加场景");
    gui.add(eventObj, "setTranslate").name("平移模式");
    gui.add(eventObj, "setRotate").name("旋转模式");
    gui.add(eventObj, "setScale").name("缩放模式");
    gui.add(eventObj, "toggleSpace").name("切换空间模式");
    gui.add(eventObj, "closeController").name("关闭控制器");
    let folder = gui.addFolder("添加物体");
    let folder2 = gui.addFolder("物体列表");

    modelList.forEach((item: any) => {
      item.addMesh = () => {
        gltfLoader.load(item.path, (gltf) => {
          gltf.scene.receiveShadow = true;
          gltf.scene.castShadow = true;
          item.object3d = gltf.scene.clone();
          scene.add(item.object3d);
          tControlSelect(item.object3d);
          // 添加模型列表
          let obj = item.object3d;
          let tmp = {
            name: item.name,
            object3d: obj,
            id: Math.floor(Math.random() * 10000),
            setControl: () => {
              transformControls.attach(obj);
            }
          }
          modelList2.push(tmp);
          folder2.add(tmp, "setControl").name(tmp.name);
        });
      };
      folder.add(item, "addMesh").name(item.name);
    });
    console.log(modelList);
  }

  // 创建射线
  const raycaster = new THREE.Raycaster();
  // 创建鼠标向量
  const mouse = new THREE.Vector2();
  const canvasActive = (evt: MouseEvent) => {
    // 归一化，-1~1
    mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse.x, mouse.y);
    // 通过鼠标和相机位置更新射线
    raycaster.setFromCamera(mouse, camera);
    // 计算物体和射线的交点,能获取到点击的图形
    // const intersects = raycaster.intersectObjects(scene.children);
    let model = [];
    for (let i = 0; i < modelList2.length; i++) {
      if (modelList2[i].object3d)
        model.push(modelList2[i].object3d);
    }
    const intersects = raycaster.intersectObjects(model);

    console.log(intersects);
    if (Array.isArray(intersects) && intersects.length) {
      tControlSelect(intersects[0].object as any);
    }
  }

  function keyControl(evt: KeyboardEvent) {
    if (evt.key === 't') {
      eventObj.setTranslate();
    }
    if (evt.key === 'r') {
      eventObj.setRotate();
    }
    if (evt.key === 's') {
      eventObj.setScale();
    }
  }

  function animate() {
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test5.current) {
      test5.current.appendChild(stats.dom);
      test5.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      window.addEventListener('click', canvasActive);
      window.addEventListener('keydown', keyControl);
      animate();
      createModel();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
      window.removeEventListener('click', canvasActive);
      window.removeEventListener('keydown', keyControl);
    }
  });

  return (<>
    <div ref={test5}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(15, 8, 0);
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

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  let pointLight = new THREE.PointLight(0xffffff, 1000, 20);
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  pointLight.castShadow = true;
  pointLight.decay = 2;
  pointLight.shadow.mapSize.width = 1024; // default
  pointLight.shadow.mapSize.height = 1024; // default
  pointLight.shadow.bias = -0.01; // 反射偏移量,解决阴影波纹问题
  scene.add(pointLight);

  scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ResizeWindow };
}