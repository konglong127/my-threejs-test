import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import vertexShader from "../shader/point/galaxy/vertex";
import fragmentShader from "../shader/point/galaxy/fragment";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test7() {
  const test7 = useRef<HTMLDivElement | null>(null);
  const { scene, renderer, ambientLight, camera, ResizeWindow } = init();
  const stats = new Stats(); // 帧数
  const controls = new OrbitControls(camera, renderer.domElement); // control
  const gui = new GUI(); // 调试

  const textureLoader = new THREE.TextureLoader();
  const texture: Array<THREE.Texture> = [];
  for (let i = 1; i < 12; i++) {
    texture.push(textureLoader.load(`textures/particles/${i}.png`));
  }

  let geometry: THREE.BufferGeometry | null = null;
  let points: THREE.Points | null = null;

  // 设置星系的参数
  const params = {
    count: 2000,
    size: 0.1,
    radius: 5,
    branches: 4,
    spin: 0.5,
    color: "#ff6030",
    outColor: "#1b3984",
  };

  // GalaxyColor
  let galaxyColor = new THREE.Color(params.color);
  let outGalaxyColor = new THREE.Color(params.outColor);
  let material: THREE.ShaderMaterial | null = null;
  const generateGalaxy = () => {
    // 如果已经存在这些顶点，那么先释放内存，在删除顶点数据
    if (points !== null && geometry && material) {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    }
    // 生成顶点几何
    geometry = new THREE.BufferGeometry();
    //   随机生成位置
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);

    const scales = new Float32Array(params.count);

    //图案属性
    const imgIndex = new Float32Array(params.count)

    //   循环生成点
    for (let i = 0; i < params.count; i++) {
      const current = i * 3;

      // 计算分支的角度 = (计算当前的点在第几个分支)*(2*Math.PI/多少个分支)
      const branchAngel =
        (i % params.branches) * ((2 * Math.PI) / params.branches);

      const radius = Math.random() * params.radius;
      // 距离圆心越远，旋转的度数就越大
      // const spinAngle = radius * params.spin;

      // 随机设置x/y/z偏移值
      const randomX =
        Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;
      const randomY =
        Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;
      const randomZ =
        Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;

      // 设置当前点x值坐标
      positions[current] = Math.cos(branchAngel) * radius + randomX;
      // 设置当前点y值坐标
      positions[current + 1] = randomY;
      // 设置当前点z值坐标
      positions[current + 2] = Math.sin(branchAngel) * radius + randomZ;

      const mixColor = galaxyColor.clone();
      mixColor.lerp(outGalaxyColor, radius / params.radius);

      //   设置颜色
      colors[current] = mixColor.r;
      colors[current + 1] = mixColor.g;
      colors[current + 2] = mixColor.b;

      // 顶点的大小
      scales[current] = Math.random();

      // 根据索引值设置不同的图案；
      imgIndex[current] = i % 3;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("imgIndex", new THREE.BufferAttribute(imgIndex, 1));

    //   设置点材质
    //   material = new THREE.PointsMaterial({
    //     color: new THREE.Color(0xffffff),
    //     size: params.size,
    //     sizeAttenuation: true,
    //     depthWrite: false,
    //     blending: THREE.AdditiveBlending,
    //     map: particlesTexture,
    //     alphaMap: particlesTexture,
    //     transparent: true,
    //     vertexColors: true,
    //   });

    //   设置点的着色器材质
    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uTexture: {
          value: texture[0]
        },
        uTexture1: {
          value: texture[1]
        },
        uTexture2: {
          value: texture[2]
        },
        uColor: {
          value: galaxyColor
        }

      },
    });

    //   生成点
    points = new THREE.Points(geometry, material);
    scene.add(points);
    console.log(points);
    //   console.log(123);
  };

  // 加载场景背景
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync("../../public/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

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

  let lightFolder = gui.addFolder('灯光');
  lightFolder.add(ambientLight, 'intensity', 0, 1).step(0.1).name('环境光亮度');

  const clock = new THREE.Clock();
  function animate() {
    // const elapsedTime = clock.getElapsedTime();
    const elapsedTime = clock.getElapsedTime();
    if (material) material.uniforms.uTime.value = elapsedTime;

    stats.update();
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (test7.current) {
      test7.current.appendChild(stats.dom);
      test7.current.appendChild(renderer.domElement);
      window.addEventListener('resize', ResizeWindow);
      animate();
      generateGalaxy();
    }
    return () => {
      window.removeEventListener('resize', ResizeWindow);
    }
  });

  return (<>
    <div ref={test7}></div>
  </>);
}

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true; //开启阴影
  renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射toneMapping
  renderer.toneMappingExposure = 1; // 通过曝光数值控制灯光
  renderer.setSize(window.innerWidth, window.innerHeight);

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
  }

  scene.add(new THREE.AxesHelper(60));

  let gridHelper = new THREE.GridHelper(50, 50);
  gridHelper.material.opacity = 0.3;
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
  // let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight
  //   .position
  //   .set(20, 20, 20)
  // // .normalize()
  // // .multiplyScalar(- 200);
  // // 修改照射目标位置
  // directionalLight.target.position.set(0, 0, 0);
  // // 平行光可以投射阴影
  // directionalLight.castShadow = true;
  // scene.add(directionalLight);
  // // 平行光阴影范围
  // directionalLight.shadow.camera.left = -20;//默认-5
  // directionalLight.shadow.camera.right = 20;//默认-5
  // directionalLight.shadow.camera.top = 20;//默认-5,远处
  // directionalLight.shadow.camera.bottom = -20;//默认-5
  // directionalLight.shadow.camera.near = 0.1;//默认0.5
  // directionalLight.shadow.camera.far = 200;//默认50,多远
  // directionalLight.shadow.mapSize.width = 1024;//默认512
  // directionalLight.shadow.mapSize.height = 1024;//默认512
  // directionalLight.shadow.bias = -0.01; // 去除模糊
  // // 平行光辅助器
  // let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  // scene.add(directionalLightHelper);

  // scene.background = new THREE.Color(0xcccccc);

  return { scene, renderer, camera, ambientLight, ResizeWindow };
}
