import { useRef, useEffect } from "preact/hooks";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, SMAAPass, GlitchPass, UnrealBloomPass, EffectComposer, RenderPass, ShaderPass, DotScreenShader, RGBShiftShader, OutputPass } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// import { Water } from 'three/addons/objects/Water2.js';
// import { Water } from 'three/addons/objects/Water.js';
// import * as CANNON from "cannon-es";
// import gsap from "gsap";

export default function Test12() {
  const test12 = useRef<HTMLDivElement | null>(null);

  let camera, renderer, composer;
  let object;

  useEffect(() => {
    init();
    animate();
  }, []);

  function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    test12.current.appendChild(renderer.domElement);

    //

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    const scene = new THREE.Scene();
    // scene.fog = new THREE.Fog(0x000000, 1, 1000);

    object = new THREE.Object3D();
    scene.add(object);

    const geometry = new THREE.SphereGeometry(1, 4, 4);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });

    for (let i = 0; i < 100; i++) {

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      mesh.position.multiplyScalar(Math.random() * 400);
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
      object.add(mesh);

    }

    scene.add(new THREE.AmbientLight(0xcccccc));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1, 1, 1);
    scene.add(light);

    // postprocessing

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const effect1 = new ShaderPass(DotScreenShader);
    effect1.uniforms['scale'].value = 4;
    composer.addPass(effect1);

    const effect2 = new ShaderPass(RGBShiftShader);
    effect2.uniforms['amount'].value = 0.0015;
    composer.addPass(effect2);

    const effect3 = new OutputPass();
    composer.addPass(effect3);

    // 抗锯齿
    const smaaPass = new SMAAPass(100, 100);
    composer.addPass(smaaPass);

    // 屏幕闪动
    const glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    // 发光效果
    const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0, 1);
    composer.addPass(unrealBloomPass);

    window.addEventListener('resize', onWindowResize);

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

  }

  function animate() {

    requestAnimationFrame(animate);

    object.rotation.x += 0.005;
    object.rotation.y += 0.01;

    composer.render();

  }

  return (<>
    <div ref={test12}></div>
  </>);
}


