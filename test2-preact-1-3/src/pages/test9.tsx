import { useRef, useEffect } from "preact/hooks";
import *  as THREE from "three";
import { OrbitControls, RGBELoader, VertexNormalsHelper } from "three/examples/jsm/Addons.js";
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
// import *  as TWEEN from "three/examples/jsm/libs/tween.module.js";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";


export default function Test9() {
  const test9 = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

  // create spheres
  let spheres = [];
  for (let i = -1; i < 2; ++i) {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const mesh = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    const sphere = new THREE.Mesh(geometry, mesh);
    sphere.position.set(i * 3, 1, 0);
    scene.add(sphere);
    spheres.push(sphere);
  }

  // create box helper
  const box3 = new THREE.Box3();
  for (let i = 0; i < spheres.length; i++) {
    /* --------- 方法一 --------*/
    // // 计算包围盒
    // spheres[i].geometry.computeBoundingBox();
    // // 获取包围盒
    // let box = spheres[i].geometry.boundingBox;
    // // 更新世界坐标
    // spheres[i].updateWorldMatrix(true, true);
    // // 申请更新
    // box?.applyMatrix4(spheres[i].matrixWorld);
    // // 合并包围盒
    // box3?.union(box as any);
    /* --------- 方法二 -------- */
    let box = new THREE.Box3().setFromObject(spheres[i]);
    // 合并包围盒
    box3.union(box);
  }
  let boxHelper = new THREE.Box3Helper(box3, 0xffff00);
  scene.add(boxHelper);

  scene.add(new THREE.AxesHelper(10));
  scene.add(new THREE.GridHelper(10, 10));
  scene.background = new THREE.Color(0xffcccc);

  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture; //设置环形贴图
    // 设置环境贴图
    // scene.background = texture;
  });

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  const ResizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  useEffect(() => {
    if (test9.current) {
      test9.current.appendChild(renderer.domElement);
      animate();
    }
    window.addEventListener('resize', ResizeWindow);
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test9}></div>
  </>);
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