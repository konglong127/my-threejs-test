import * as THREE from "three";
import { useEffect, useRef } from "preact/hooks";
import { OrbitControls } from "three/examples/jsm/Addons.js";


export default function Test3() {
  const test3 = useRef(null);

  const { scene, camera, renderer } = init();

  // box
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = [];
  let color = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];
  for (let i = 0; i < color.length; ++i) {
    material.push(new THREE.MeshPhysicalMaterial({ color: color[i] }));
  }
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  console.log(cube);

  // 创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;// 设置阻力
  controls.dampingFactor = 0.05;// 阻力大小

  const skyColor = new THREE.Color(0x0000ff);
  const groundColor = new THREE.Color(0xd0dee7);
  scene.add(new THREE.HemisphereLight(skyColor, groundColor, 0.5));

  scene.add(cube);
  scene.add(new THREE.AxesHelper(5));
  scene.add(camera);
  scene.background = new THREE.Color(0xffcccc);
  // scene.fog = new THREE.Fog( 0xcccccc, 0, 20 );
  scene.fog = new THREE.FogExp2(0xcccccc, 0.08);

  function Animation() {
    controls.update();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    requestAnimationFrame(Animation);
  }

  useEffect(() => {
    // console.log(test3.current);
    if (test3.current) {
      (test3.current as HTMLDivElement).appendChild(renderer.domElement);
    }
    Animation();
    return () => {
      if (test3.current) {
        (test3.current as HTMLDivElement).innerHTML = '';
      }
    }
  }, []);

  return (<>
    <div ref={test3}></div>
  </>)
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}