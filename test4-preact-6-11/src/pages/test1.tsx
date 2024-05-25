import { useEffect, useRef } from "preact/hooks";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

export default function Test1() {
  const test1 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, camera } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  const clock = new THREE.Clock();
  /* 
    ease变化过程,去gsap文档寻找调试 https://gsap.com/docs/v3/Eases/CustomEase
  */
  const cpa = gsap.to(cube.position, {
    x: 5,  // x运动到5
    duration: 2, // 2s一次
    repeat: -1, // 无限循环
    yoyo: true, // 往返运动
    ease: "back.out(1.7)",
    onStart: () => {
      console.log("start");
    },
    onComplete: () => {
      console.log("complete");
    }
  });

  gsap.to(cube.rotation, {
    x: 2 * Math.PI, // 旋转一周
    duration: 2, // 2s一次
    repeat: -1, // 无限循环
    ease: "bounce.out",
    onStart: () => {
      console.log("start");
    }
  });

  window.addEventListener("dblclick", () => {
    if(cpa.isActive()){
      cpa.pause();
    }else{
      cpa.resume();
    }
    console.log(cpa);
  });

  scene.add(cube);
  scene.add(new THREE.AxesHelper(15));
  scene.add(new THREE.GridHelper(10, 10));

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function ResizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test1.current) {
      test1.current.appendChild(renderer.domElement);
      animate();
      window.addEventListener('resize', ResizeWindow);
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  }, []);

  return (<>
    <div ref={test1}></div>
  </>);
}

function init() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 5);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, renderer, camera };
}