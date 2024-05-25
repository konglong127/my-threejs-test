import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import *  as TWEEN from "three/examples/jsm/libs/tween.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function Test6() {
  const test6 = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);
  const gui = new GUI();

  // create ball
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 1, 0);
  scene.add(ball);

  const geometry2 = new THREE.SphereGeometry(1, 32, 32);
  const material2 = new THREE.MeshBasicMaterial({ color: 0xffcccc });
  const ball2 = new THREE.Mesh(geometry2, material2);
  ball2.position.set(3, 10, 0);
  scene.add(ball2);

  const geometry3 = new THREE.SphereGeometry(1, 32, 32);
  const material3 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const ball3 = new THREE.Mesh(geometry3, material3);
  ball3.position.set(-3, 10, 0);
  scene.add(ball3);

  scene.add(new THREE.AxesHelper(10));
  scene.add(new THREE.GridHelper(10, 10));

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
    const intersects = raycaster.intersectObjects([ball, ball2, ball3]);

    console.log(intersects);
    if (Array.isArray(intersects) && intersects.length) {
      if ((intersects[0].object as any).material.color.getHex() === 0xff0000) {
        (intersects[0].object as any).material.color.set(0x0000ff);
      } else {
        (intersects[0].object as any).material.color.set(0xff0000);
      }
    }
  }

  // tween动画
  const tween = new TWEEN.Tween(ball.position);
  tween.to({ x: 0, y: 10, z: 0 }, 1000).onUpdate(() => {
    // console.log(ball.position);
  });
  // tween.repeat(3);
  // tween.repeat(Infinity).yoyo(true).delay(100); // 无限循环，来回运动
  tween.easing(TWEEN.Easing.Quadratic.InOut); // 缓动效果
  
  tween.onStart(() => {
    // console.log('start');
  }).onStop(() => {
    // console.log('stop');
  }).onComplete(() => {
    // console.log('complete');
  }).onRepeat(() => {
    // console.log('repeat');
  }).onUpdate(() => {
    // console.log('update');
  });

  const tween2 = new TWEEN.Tween(ball.position);
  tween2.to({ x: 10, y: 10, z: 0 }, 1000);
  tween.chain(tween2);
  tween2.chain(tween);
  tween.start();
  gui.add({ stop: () => { tween.stop() } }, 'stop').name('停止动画');

  // 设置环形贴图，和雾
  scene.fog = new THREE.FogExp2(0xcccccc, 0.02);
  scene.background = new THREE.Color(0xcccccc);

  let rgbeLoader = new RGBELoader();
  rgbeLoader.load('../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping; // 设置贴图映射方式
    scene.environment = envMap; //设置环形贴图
  });

  const windowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test6.current) {
      test6.current.appendChild(renderer.domElement);
    }
    animate();
    window.addEventListener('resize', windowResize);
    return () => {
      window.removeEventListener('resize', windowResize);
    }
  }, []);

  return (<>
    <div className="test6" ref={test6} onClick={canvasActive}></div>
  </>)
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  return { scene, camera, renderer };
}