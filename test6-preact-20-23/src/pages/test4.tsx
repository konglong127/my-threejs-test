import { useRef, useEffect, useState } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass, DotScreenPass, CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
import gsap from "gsap";
import React from "preact/compat";


export default function Test4() {
  const test4 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, composer, unrealBloomPass, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  // const controls = new OrbitControls(camera, labelRenderer.domElement); // control
  // const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试
  const tagDiv = useRef<HTMLDivElement | null>(null);

  // 创建客厅
  const livingroom = new Room('livingroom', 0, '../../public/img/livingroom/');
  livingroom.add(scene);

  // 创建厨房
  const kitchen = new Room('kitchen', 3, '../../public/img/kitchen/', new THREE.Vector3(-5, 0, -10), new THREE.Euler(0, -Math.PI / 2, 0));
  kitchen.add(scene);
  const kitchenTag = new SpriteText('厨房', new THREE.Vector3(-1, 0, -4));
  kitchenTag.add(scene);

  // 客厅到厨房,添加移动的点击事件
  SpriteText.addEvent({
    key: '厨房', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: kitchen.position.x,
        y: kitchen.position.y,
        z: kitchen.position.z,
      });
      moveTag("厨房");
    }
  });

  const kitchenBackToLivingroomTag = new SpriteText('厨房返回', new THREE.Vector3(-3, 0, -6));
  kitchenBackToLivingroomTag.add(scene);
  // 厨房返回客厅
  SpriteText.addEvent({
    key: '厨房返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: livingroom.position.x,
        y: livingroom.position.y,
        z: livingroom.position.z,
      });
      moveTag("客厅");
    }
  });


  // 创建阳台
  let balcony = new Room("阳台", 8, "../../public/img/balcony/", new THREE.Vector3(0, 0, 15));
  balcony.add(scene);
  // 创建阳台精灵文字
  let balconyText = new SpriteText("阳台", new THREE.Vector3(0, 0, 4));
  balconyText.add(scene);

  // 去阳台
  SpriteText.addEvent({
    key: '阳台', value: () => {
      // 让相机移动到阳台
      // console.log("阳台");
      gsap.to(camera.position, {
        duration: 1,
        x: balcony.position.x,
        y: balcony.position.y,
        z: balcony.position.z,
      });
      moveTag("阳台");
    }
  });

  // 阳台返回客厅
  let balconyBackToLivingroomText = new SpriteText("阳台返回", new THREE.Vector3(-1, 0, 11));
  balconyBackToLivingroomText.add(scene);
  // 厨房返回客厅
  SpriteText.addEvent({
    key: '阳台返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: livingroom.position.x,
        y: livingroom.position.y,
        z: livingroom.position.z,
      });
      moveTag("客厅");
    }
  });

  // 走廊
  let corridor = new Room("走廊", 9, "../../public/img/corridor/", new THREE.Vector3(-10, 0, 0), new THREE.Euler(0, -Math.PI, 0));
  corridor.add(scene);
  // 去走廊标签
  let corridorText = new SpriteText("走廊", new THREE.Vector3(-4, 0, 1));
  corridorText.add(scene);
  // 去走廊动画
  SpriteText.addEvent({
    key: '走廊', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: corridor.position.x,
        y: corridor.position.y,
        z: corridor.position.z,
      });
      moveTag("走廊");
    }
  });
  // 走廊返回客厅
  let corridorBackToLivingroomText = new SpriteText("走廊返回", new THREE.Vector3(-6, 0, 1));
  corridorBackToLivingroomText.add(scene);
  SpriteText.addEvent({
    key: '走廊返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: livingroom.position.x,
        y: livingroom.position.y,
        z: livingroom.position.z,
      });
      moveTag("客厅");
    }
  });

  // 儿童房
  let childroom = new Room("儿童房", 13, "../../public/img/childroom/", new THREE.Vector3(-15, 0, -15), new THREE.Euler(0, Math.PI / 2, 0));
  childroom.add(scene);
  // 去走廊标签
  let childroomText = new SpriteText("儿童房", new THREE.Vector3(-12, 0, -3));
  childroomText.add(scene);
  // 去走廊动画
  SpriteText.addEvent({
    key: '儿童房', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: childroom.position.x,
        y: childroom.position.y,
        z: childroom.position.z,
      });
      moveTag("儿童房");
    }
  });
  // 儿童房返回走廊
  let childroomBackToLivingroomText = new SpriteText("儿童房返回", new THREE.Vector3(-17, 0, -12));
  childroomBackToLivingroomText.add(scene);
  SpriteText.addEvent({
    key: '儿童房返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: corridor.position.x,
        y: corridor.position.y,
        z: corridor.position.z,
      });
      moveTag("走廊");
    }
  });

  // 老人房
  let elderroom = new Room("老人房", 14, "../../public/img/elderroom/", new THREE.Vector3(-15, 0, 15), new THREE.Euler(0, -Math.PI / 2, 0));
  elderroom.add(scene);
  // 去走廊标签
  let elderroomText = new SpriteText("老人房", new THREE.Vector3(-12, 0, 3));
  elderroomText.add(scene);
  // 去老人房动画
  SpriteText.addEvent({
    key: '老人房', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: elderroom.position.x,
        y: elderroom.position.y,
        z: elderroom.position.z,
      });
      moveTag("老人房");
    }
  });
  // 老人房返回走廊
  let elderroomBackToLivingroomText = new SpriteText("老人房返回", new THREE.Vector3(-13, 0, 12));
  elderroomBackToLivingroomText.add(scene);
  SpriteText.addEvent({
    key: '老人房返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: corridor.position.x,
        y: corridor.position.y,
        z: corridor.position.z,
      });
      moveTag("走廊");
    }
  });

  // 卧室
  let bedroom = new Room("卧室", 18, "../../public/img/bedroom/", new THREE.Vector3(-20, 0, 3), new THREE.Euler(0, 0, 0));
  bedroom.add(scene);
  // 去走卧室签
  let bedroomText = new SpriteText("卧室", new THREE.Vector3(-13, 0, 0));
  bedroomText.add(scene);
  // 去走廊动画
  SpriteText.addEvent({
    key: '卧室', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: bedroom.position.x,
        y: bedroom.position.y,
        z: bedroom.position.z,
      });
      moveTag("卧室");
    }
  });
  // 卧室返回走廊
  let bedroomBackToLivingroomText = new SpriteText("卧室返回", new THREE.Vector3(-20, 0, -1));
  bedroomBackToLivingroomText.add(scene);
  SpriteText.addEvent({
    key: '卧室返回', value: () => {
      gsap.to(camera.position, {
        duration: 1,
        x: corridor.position.x,
        y: corridor.position.y,
        z: corridor.position.z,
      });
      moveTag("走廊");
    }
  });

  function moveTag(name: string) {
    let positions: { [key: string]: number[] } = {
      客厅: [100, 110],
      厨房: [180, 190],
      阳台: [50, 50],
      走廊: [130, 85],
      儿童房: [210, 75],
      老人房: [120, 50],
      卧室: [140, 20]
    };
    if (positions[name]) {
      gsap.to(tagDiv.current, {
        duration: 0.5,
        x: positions[name][0],
        y: positions[name][1],
        ease: "power3.inOut",
      });
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
  gui.add(renderer, 'toneMappingExposure').min(0).max(100).step(0.01);
  gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01);
  gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.01);

  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');
  // const clock = new THREE.Clock();
  function animate() {
    // const elapsed = clock.getElapsedTime();

    // 标签渲染器渲染
    // labelRenderer.render(scene, camera);
    stats.update();
    // controls.update();
    camera.updateMatrixWorld();
    composer.render();
    // renderer重复渲染会导致composer效果失效
    // renderer.render(scene, camera);
    // effectComposer.render();
    requestAnimationFrame(animate);
  }

  let isMouseDown = false;
  const MouseDownEvent = () => {
    isMouseDown = true;
  }
  const MouseUpEvent = () => {
    isMouseDown = false;
  }
  const MouseMoveEvent = (evt: MouseEvent) => {
    if (!isMouseDown) return;
    camera.rotation.y += evt.movementX * 0.002;
    camera.rotation.x += evt.movementY * 0.002;
    // 修改相机旋转顺序
    camera.rotation.order = "YXZ";
  }

  useEffect(() => {
    if (test4.current) {
      test4.current.appendChild(stats.dom);
      test4.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      test4.current.addEventListener('mousedown', MouseDownEvent);
      test4.current.addEventListener('mouseup', MouseUpEvent);
      test4.current.addEventListener('mouseout', MouseUpEvent);
      test4.current.addEventListener('mousemove', MouseMoveEvent);
      test4.current.addEventListener('click', SpriteText.register(camera))
      animate();
    }
    if (tagDiv.current) {
      tagDiv.current.style.cssText = `transform:translate(100px,110px)`;
    }
    return () => {
      if (test4.current) {
        window.removeEventListener('resize', ResizeWindow);
        test4.current.removeEventListener('mousedown', MouseDownEvent);
        test4.current.removeEventListener('mouseup', MouseUpEvent);
        test4.current.removeEventListener('mouseout', MouseUpEvent);
        test4.current.removeEventListener('mousemove', MouseMoveEvent);
        test4.current.removeEventListener('click', SpriteText.register(camera));
      }
    }
  });

  return (<>
    <div class="map">
      <div class="tag" ref={tagDiv}></div>
      <img src="../../public/img/map.gif" />
    </div>
    <Loading></Loading>
    <div ref={test4}></div>
  </>);
}

const Loading = React.memo(function Son() {
  const [progress, setProgress] = useState(0);

  THREE.DefaultLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    setProgress(0);
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  THREE.DefaultLoadingManager.onLoad = function () {
    setProgress(100);
  };
  THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    setProgress(Number(((itemsLoaded / itemsTotal) * 100).toFixed(2)));
    console.log(Number(((itemsLoaded / itemsTotal) * 100).toFixed(2)), 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  THREE.DefaultLoadingManager.onError = function (url) {
    console.log('There was an error loading ' + url);
  };

  return (<>
    {progress != 100 ? (<>
      <div class="loading" v-if="progress != 100"></div>
      <div class="progress" v-if="progress != 100">
        <img src="../../public/img/loading.gif" />
        <span>新房奔跑中：{progress}%</span>
      </div>
    </>) : (<></>)}
  </>)
})

class SpriteText {
  sprite: THREE.Sprite;
  position: THREE.Vector3;

  static sprites: THREE.Sprite[] = [];
  static mouse: THREE.Vector2 = new THREE.Vector2();
  static raycaster: THREE.Raycaster = new THREE.Raycaster();
  static callbacks: Array<{ key: string, value: Function }> = [];

  constructor(text: string, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    // 创建canvas纹理,和一个精灵,面向相机
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = 'rgba(100,100,100,0.8)';
    ctx.fillRect(0, 256, 1024, 512);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 200px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 512, 512);
    let texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    this.sprite = new THREE.Sprite(material);
    // this.sprite.position.set(0, 0, -4);
    this.sprite.position.copy(position);
    this.sprite.name = text;
    this.position = position;
  }
  add(scene: THREE.Scene) {
    SpriteText.sprites.push(this.sprite);
    scene.add(this.sprite);
  }
  static addEvent(item: { key: string, value: Function }) {
    SpriteText.callbacks.push(item);
  }
  static register(camera: THREE.Camera) {
    return (event: MouseEvent) => {
      SpriteText.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      SpriteText.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      SpriteText.raycaster.setFromCamera(SpriteText.mouse, camera);
      let intersects = SpriteText.raycaster.intersectObjects(SpriteText.sprites);
      if (intersects.length > 0) {
        // console.log(intersects[0].object.name);
        SpriteText.callbacks.forEach((item) => {
          // console.log(item);
          if (item.key === intersects[0].object.name) {
            item.value();
            return;
          }
        });
      }
    }
  }
};

class Room {
  roomIndex: number;
  name: string;
  textureUrl: string;
  position: THREE.Vector3;
  euler: THREE.Euler;
  constructor(name: string, roomIndex: number, textureUrl: string, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), euler: THREE.Euler = new THREE.Euler(0, 0, 0)) {
    this.roomIndex = roomIndex;
    this.name = name;
    this.textureUrl = textureUrl;
    this.position = position;
    this.euler = euler;
    console.log(position, euler);
  }
  add(scene: THREE.Scene) {
    const textureLoader = new THREE.TextureLoader();
    var arr = [
      `${this.roomIndex}_l`,
      `${this.roomIndex}_r`,
      `${this.roomIndex}_u`,
      `${this.roomIndex}_d`,
      `${this.roomIndex}_b`,
      `${this.roomIndex}_f`,
    ];
    let boxMaterials: THREE.MeshBasicMaterial[] = [];
    arr.forEach((item) => {
      let texture = textureLoader.load(`${this.textureUrl}${item}.jpg`);
      boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
    });

    const geometry = new THREE.BoxGeometry(10, 10, 10);
    geometry.scale(1, 1, -1);
    const cube = new THREE.Mesh(geometry, boxMaterials);
    cube.rotation.copy(this.euler);
    cube.position.copy(this.position);
    scene.add(cube);
  }
};

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 0, 0);
  // camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; //开启阴影
  // renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 创建一个渲染器
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // 发光效果,可以用来加亮场景
  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0, 1);
  composer.addPass(unrealBloomPass);
  unrealBloomPass.strength = 1;
  unrealBloomPass.radius = 0;
  unrealBloomPass.threshold = 1;

  // 实例化css2d的渲染器
  // const labelRenderer = new CSS2DRenderer();
  // labelRenderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(labelRenderer.domElement)
  // labelRenderer.domElement.style.position = 'fixed';
  // labelRenderer.domElement.style.top = '0px';
  // labelRenderer.domElement.style.left = '0px';
  // labelRenderer.domElement.style.zIndex = '10';

  // 初始化渲染器
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // 色调映射toneMapping
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMapping = THREE.LinearToneMapping;
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMapping = THREE.CineonToneMapping;

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.1;
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

  return { scene, renderer, composer, unrealBloomPass, camera, ambientLight, ResizeWindow };
}
