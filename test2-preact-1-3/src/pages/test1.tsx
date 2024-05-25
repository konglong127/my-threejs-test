// import { useState } from 'preact/hooks';
import { useEffect } from 'preact/hooks';
import * as THREE from "three";
// 引入坐标控制器
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const init = () => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // 渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}

const createCube = (color: number, width: number, height: number, depth: number) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({ color });// 材质
  material.wireframe = true;//设置成线框
  const cube = new THREE.Mesh(geometry, material); // 网格
  // cube['material'] = material;
  return cube;
}

export default function Test1() {
  const { scene, camera, renderer } = init();

  // 创建box几何体
  let cube = createCube(0x00ff00, 1, 1, 1);
  let parentCube = createCube(0xff0000, 1, 1, 1);
  parentCube.add(cube);
  parentCube.position.x = 3;
  cube.position.x = -3;
  // 放大缩小
  // cube.scale.set(1, 2, 0.5);
  cube.scale.set(2, 2, 2);
  console.log(cube);

  // 创建xyz轴
  const axesHelper = new THREE.AxesHelper(5);

  // 创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置阻力
  controls.enableDamping = true;
  // 阻力大小
  controls.dampingFactor = 0.05;
  // 自动旋转
  controls.autoRotate = true;

  scene.add(axesHelper);
  scene.add(parentCube);
  scene.fog = new THREE.Fog(0xcccccc, 10, 15);

  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  const resizeAnimate = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }

  useEffect(() => {
    if (document.querySelector('#animate')) {
      (document.querySelector('#animate') as HTMLDivElement).innerHTML = '';
      (document.querySelector('#animate') as HTMLDivElement).appendChild(renderer.domElement);
    }
    animate();
    window.addEventListener('resize', resizeAnimate);

    return () => {
      window.removeEventListener('resize', resizeAnimate);
    }
  }, []);

  const fullScreen = () => {
    // 画布全屏
    // renderer.domElement.requestFullscreen();
    document.body.requestFullscreen();
  }

  const exitFullScreen = () => {
    document.exitFullscreen();
  }

  let gui = new GUI();
  gui.add({ fullScreen }, 'fullScreen').name('全屏');
  gui.add({ exitFullScreen }, 'exitFullScreen').name('退出全屏');
  // parentCube
  let folder = gui.addFolder('图形位置');
  folder.add(parentCube.position, 'x', -10, 10).name('图形位置x');
  folder.add(parentCube.position, 'y', -10, 10).name('图形位置y').onFinishChange((val)=>{
    console.log(val);
  });
  // gui.add(parentCube.position, 'z', -10, 10).name('图形位置z');
  folder.add(parentCube.position, 'z').min(-10).max(10).step(0.1).name('图形位置z').onChange((val) => {
    console.log(val);
  });
  let folder2 = gui.addFolder('设置线框');
  folder2.add(parentCube.material, 'wireframe').name('父图形是否显示线框');
  folder2.add(cube.material, 'wireframe').name('子图形是否显示线框');
  folder2.addColor({cubeColor: '#00ff00'}, 'cubeColor').name('父图形颜色').onChange((val) => {
    parentCube.material.color.set(val);
  });
  folder2.addColor({cubeColor: '#00ff00'}, 'cubeColor').name('子图形颜色').onChange((val) => {
    cube.material.color.set(val);
  });
  return (
    <>
      <button className='fs' onClick={fullScreen}>full screen</button>
      <button className='efs' onClick={exitFullScreen}>exit full screen</button>
      <div id="animate">
      </div>
    </>
  )
}
