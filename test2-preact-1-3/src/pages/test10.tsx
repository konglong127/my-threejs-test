import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";

export default function Test10() {
  const test10 = useRef<HTMLDivElement>(null);
  const { camera, scene, renderer } = init();
  const controls = new OrbitControls(camera, renderer.domElement);

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
      // gltf.scene.position.set(0,0,0);
      console.log(gltf.scene);
      gltf.scene.traverse(child => {
        // 遍历
        let building = child as THREE.Mesh;
        // let building = gltf.scene.children[0];
        // let building = gltf.scene.getObjectByName("Plane045");
        // let building = gltf.scene.getObjectById(15);
        let geometry = (building as any).geometry;
        /*  
        scene.add(gltf.scene);
  
        // 加一个包围盒
        geometry.computeBoundingBox(); // 计算包围盒
        let box = geometry.boundingBox; // 获取包围盒
        building?.updateWorldMatrix(true, true); // 更新世界矩阵
        box.applyMatrix4(building?.matrixWorld); // 将包围盒应用到世界矩阵
        let boxHelper = new THREE.Box3Helper(box, 0xffff00); // 创建包围盒辅助器
        scene.add(boxHelper);
        */

        // 通过geometry模型,创建出边缘模型
        // let edgesGeometry = new THREE.EdgesGeometry(geometry);
        let edgesGeometry = new THREE.WireframeGeometry(geometry);
        let lineMesh = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.LineSegments(edgesGeometry, lineMesh);
        scene.add(line);

        // 重叠
        building?.updateWorldMatrix(true, true);
        line.matrix.copy((building as any)?.matrixWorld);
        line.matrix.decompose(line.position, line.quaternion, line.scale);
      });
    }
  );

  scene.add(new THREE.AxesHelper(10));
  scene.add(new THREE.GridHelper(10, 10));
  scene.background = new THREE.Color(0xffeeee);

  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('../../public/Alex_Hart-Nature_Lab_Bones_2k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;
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
    if (test10.current) {
      test10.current.appendChild(renderer.domElement);
      animate();
    }
    window.addEventListener("resize", ResizeWindow);
    return () => {
      window.removeEventListener("resize", ResizeWindow);
    }
  });

  return (<>
    <div ref={test10}></div>
  </>);
}

const init = () => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(0, 10, 10);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}