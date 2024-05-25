import { useEffect } from 'preact/hooks';
import * as THREE from "three";
// 引入坐标控制器
import { OrbitControls } from 'three/examples/jsm/Addons.js';
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const init = () => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // 渲染器
  const renderer = new THREE.WebGLRenderer({ alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}

export default function Test1() {
  const { scene, camera, renderer } = init();

  // 
  // const geometry = new THREE.BufferGeometry();
  // // 通过点连线画图形,顺时针反面，逆时针正面
  // const vertices = new Float32Array([
  //   1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

  //   1.0, 1.0,1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  // ]);
  // geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // const material = new THREE.MeshBasicMaterial({ 
  //   color: 0x00ff00,
  //   side: THREE.DoubleSide,//双面绘制
  //   wireframe: true,//变成线框
  // });
  // const plane = new THREE.Mesh(geometry, material);

  // 利用点画线构成三角形
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0
  ]);//四个点的xyz坐标
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // 利用点构成三角形，点来源于vertices
  const indexes = new Uint16Array([0, 1, 2, 2, 3, 0]);
  // 设置索引
  geometry.setIndex(new THREE.BufferAttribute(indexes, 1));
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,//双面绘制
    wireframe: true,//变成线框
  });
  const material2 = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,//双面绘制
    wireframe: true,//变成线框
  });
  geometry.addGroup(0, 3, 0);//索引0,3个点,第0个材质
  geometry.addGroup(3, 3, 1);//索引3,3个点,第1个材质
  const plane = new THREE.Mesh(geometry, [material, material2]);
  scene.add(plane);
  console.log(geometry);

  // const ambientLight = new THREE.AmbientLight(0xff0000, 0.5);
  // scene.add(ambientLight);

  // const directionalLight = new THREE.DirectionalLight(0xff0000, 0.5);
  // directionalLight.position.set(1, 1, 1).normalize();
  // scene.add(directionalLight);

  // 创建xyz轴
  const axesHelper = new THREE.AxesHelper(5);

  // 创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置阻力
  controls.enableDamping = true;
  // 阻力大小
  controls.dampingFactor = 0.05;
  // 自动旋转
  // controls.autoRotate = true;

  
  scene.add(axesHelper);
  scene.background = new THREE.Color(0xf0f5f5);
  scene.fog = new THREE.Fog( 0xff0000);

  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  function animate() {
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
    if (document.querySelector('#test2')) {
      (document.querySelector('#test2') as HTMLDivElement).innerHTML = '';
      (document.querySelector('#test2') as HTMLDivElement).appendChild(renderer.domElement);
    }
    animate();
    window.addEventListener('resize', resizeAnimate);

    return () => {
      window.removeEventListener('resize', resizeAnimate);
    }
  }, []);

  return (<>
    <div id="test2">test2</div>
  </>)
}