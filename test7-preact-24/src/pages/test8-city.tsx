import * as THREE from "three";
import { DRACOLoader, GLTFLoader, FBXLoader, OrbitControls, RGBELoader, UnrealBloomPass, FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
import gsap from "gsap";
import { v4 as uuidv4 } from 'uuid';

export class City {
  scene: THREE.Scene;
  camera: THREE.Camera;
  preventFocusTag: boolean = false;
  meshColor: number = 0x1B3080;
  headColor: number = 0xffffff;
  height: number;
  time: number;
  obj: THREE.Mesh | null = null;
  // 绘制外边线计数
  lineCount: number = 0;
  lines: { [key: string]: THREE.LineSegments } = {};
  // 绘制雷达计数
  raderCount: number = 4;
  radars: { [key: string]: THREE.Mesh } = {};
  // 是否绘制光墙
  wall: THREE.Mesh | null = null;
  // 扩散圆盘
  cylinder: THREE.Mesh | null = null;
  // 扩散的半圆
  sphere: THREE.Mesh | null = null;
  // 四棱锥
  cone: THREE.Mesh | null = null;
  // 飞线
  fly: THREE.Points | null = null;
  // 移动的粒子
  move: THREE.Points | null = null;
  // 雪花
  snow: THREE.Points[] = [];
  stopSnow: boolean = true;
  // 下雨
  rain: THREE.Points[] = [];
  stopRain: boolean = true;
  // 烟雾
  smokes: { [key: string]: any }[] = [];
  stopSmoke: boolean = true;
  smoke: THREE.Points | null = null;
  geometry: THREE.BufferGeometry | null = null;
  // 控制器
  controls: OrbitControls;
  constructor(scene: THREE.Scene, camera: THREE.Camera, height: number, time: number, controls: OrbitControls) {
    this.height = height;
    this.time = time;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.preventFoucs();
    this.wheelEvent();
  }

  start() {

  }

  loadCity(url: string) {
    let fbxLoader = new FBXLoader();
    return new Promise((resolve, reject) => {
      fbxLoader.load(url, (obj) => {
        this.obj = obj as unknown as THREE.Mesh;
        obj.position.set(0, 1, 0);
        // 上升框线
        this.createUpLine();
        // 白色外框线
        obj.traverse((child) => {
          child.name = 'city';
          (child as any).uniqueId = uuidv4();
          this.createOutLine(child as THREE.Mesh);
        });
        // 雷达
        for (let i = 0; i < this.raderCount; ++i) {
          this.createRadar();
        }
        // 四棱锥
        this.createCone();
        // 添加文字
        this.createFont();
        // 添加雪花
        this.createSnow();
        // 添加雨滴
        this.createRain();
        // 烟雾
        this.createFog();
        this.scene.add(obj);
        resolve(obj);
      }, () => { }, (err) => {
        reject(err);
      });
    });
  }

  // 模型的上升扫描线
  createUpLine() {
    let obj = this.obj;
    if (!obj) return;
    obj.traverse((child) => {
      let tmp = child as THREE.Mesh;
      // console.log(tmp.geometry, tmp.children);
      let size = 100;
      if (tmp.geometry) {
        tmp.geometry.computeBoundingBox();
        tmp.geometry.computeBoundingSphere();
        const { max, min } = tmp.geometry.boundingBox as any;
        // console.log(max, min);
        // size = max.y - min.y;
      }
      if (tmp.isMesh) {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            u_height: {
              value: this.height
            },
            u_up_color: {
              value: new THREE.Color(0x5588aa)
            },
            u_city_color: {
              value: new THREE.Color(this.meshColor)
            },
            u_head_color: {
              value: new THREE.Color(this.headColor)
            },
            u_size: {
              value: size
            }
          },
          vertexShader: `
            varying vec3 v_position;
            void main() {
              v_position = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 v_position;
            uniform vec3 u_city_color;
            uniform vec3 u_head_color;
            uniform float u_size;
            uniform vec3 u_up_color;
            uniform float u_height;
            
            void main(){
              vec3 base_color = u_city_color;
              base_color = mix(base_color, u_head_color, v_position.z/u_size);
              // 上升线条的高度是多少
              if(u_height > v_position.z && u_height < v_position.z + 6.0){
                float f_index=(u_height - v_position.z)/3.0;
                base_color = mix(u_up_color,base_color,abs(f_index-1.0));
              }
              gl_FragColor = vec4(base_color, 1.0);
            }
          `
        });
        tmp.material = material;
        // // const material = new THREE.MeshBasicMaterial({ color: 0x1B3045 });
        // const mesh = new THREE.Mesh(tmp.geometry, material);
        // mesh.position.copy(tmp.position);
        // console.log(tmp.position);
        // mesh.rotation.copy(tmp.rotation);
        // mesh.scale.copy(tmp.scale);
        // mesh.position.set(0, 1, 0);
        // mesh.name = 'city';
        // this.scene.add(mesh);
      }
    });
  }

  // 模型外边线, 以及背景扫描线
  createOutLine(child: THREE.Mesh) {
    // 遍历
    let building = child as THREE.Mesh;

    let max = { y: 1, x: 0, z: 0 }, min = { y: 0, x: 0, z: 0 };
    if (building.geometry) {
      building.geometry.computeBoundingBox();
      building.geometry.computeBoundingSphere();
      const tmp = building.geometry.boundingBox as any;
      // console.log(tmp);
      max = tmp.max;
      min = tmp.min;
    }
    // console.log(max, min);

    let lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        line_color: {
          value: new THREE.Color(0x0000ff)
        },
        u_time: {
          value: this.time
        },
        u_max: {
          value: max,
        },
        u_min: {
          value: min
        },
        live_color: {
          value: new THREE.Color(0xffffff)
        }
      },
      vertexShader: `
        uniform float u_time;
        varying vec3 v_position;
        
        void main() {
          // 变化的时间 
          float uMax = 4.0;
        
          v_position = position;
          
          // 变化的比例
          float rate = u_time / uMax * 2.0;
          
          // 边界条件
          if (rate > 1.0) {
            rate = 1.0;
          }
          
          float z = position.z * rate;
        
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vec2(position), z, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 v_position;
        
        uniform vec3 u_city_color;
        uniform vec3 u_head_color;
        uniform float u_size;
        
        uniform vec3 u_up_color;
        uniform float u_height;
        
        void main() {
          vec3 base_color = u_city_color;
          base_color = mix(base_color, u_head_color, v_position.z / u_size);
        
          // 上升线条的高度是多少
          if (u_height > v_position.z && u_height < v_position.z + 6.0) {
            float f_index = (u_height - v_position.z) / 3.0;
            base_color = mix(u_up_color, base_color, abs(f_index - 1.0));
          }
        
          gl_FragColor = vec4(base_color, 1.0);
        }
      `,
    });

    // console.log('line====', this.lineCount);
    if (this.lineCount > 7) {
      // let geometry = (building as any).geometry;
      // let edgesGeometry = new THREE.EdgesGeometry(geometry);
      // building.geometry = edgesGeometry;
      // building.scale.copy(child.scale);
      // building.position.copy(child.position);
      // building.rotation.copy(child.rotation);
      // building.position.set(0, 1, 0);
      this.lines[(building as any).uniqueId].material = lineMaterial;
      // console.log(this.lines);
    } else {
      this.lineCount++;
      console.log('line in!!!!!!!!!!');
      // let building = gltf.scene.children[0];
      // let building = gltf.scene.getObjectByName("Plane045");
      // let building = gltf.scene.getObjectById(15);
      let geometry = (building as any).geometry;
      // 通过geometry模型,创建出边缘模型
      let edgesGeometry = new THREE.EdgesGeometry(geometry);
      // let edgesGeometry = new THREE.WireframeGeometry(geometry);
      // let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      // lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      let line = new THREE.LineSegments(edgesGeometry, lineMaterial);

      // 重叠, 方法二
      // building?.updateWorldMatrix(true, true);
      // line.matrix.copy((building as any)?.matrixWorld);
      // line.matrix.decompose(line.position, line.quaternion, line.scale);
      // 重叠, 方法一
      line.scale.copy(child.scale);
      line.position.copy(child.position);
      line.rotation.copy(child.rotation);
      line.position.set(0, 1, 0);
      this.lines[(building as any).uniqueId] = line;
      this.scene.add(line);
    }
  }

  // 雷达效果
  createRadar(id?: string) {
    let radius = 50;

    // const geometry = new THREE.BufferGeometry();
    // let vertices = new THREE.PlaneGeometry(radius * 2, radius * 2, 1, 1).attributes.position.array;
    // geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const geometry = new THREE.PlaneGeometry(radius * 2, radius * 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: {
          value: new THREE.Color(0xff8800)
        },
        u_radius: {
          value: radius
        },
        u_time: {
          value: this.time
        }
      },
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 v_position;
        
        void main() {
          v_position = vec2(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec2 v_position;
        
        uniform float u_time;
        uniform vec3 u_color;
        uniform float u_radius;
        
        void main() {
          float angle = atan(v_position.x, v_position.y);
          
          float new_angle = mod(angle + u_time, 3.1415926 * 2.0);
          
          // 计算距离
          float dis = distance(vec2(0.0,0.0), v_position);
          
          // 外层圆环的宽度
          float borderWidth = 2.0;
          
          float f_opacity = 0.0;
          
          // 在圆环上
          if (dis > u_radius - borderWidth) {
            f_opacity = 1.0;
          }
          
          // 雷达扫描的显示
          if (dis < u_radius - borderWidth) {
            f_opacity = 1.0 - new_angle;
          }
          
          // 处于雷达之外
          if (dis > u_radius) {
            f_opacity = 0.0;
          }
          
          gl_FragColor = vec4(u_color, f_opacity);
        }
      `
    });

    if (this.raderCount === Object.keys(this.radars).length && id) {
      this.radars[id].material = material;
    } else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2;
      this.radars[uuidv4()] = mesh;
      if (Object.keys(this.radars).length === 1) {
        mesh.position.set(300, 2, 0);
      } else if (Object.keys(this.radars).length === 2) {
        mesh.position.set(-300, 2, 0);
      } else if (Object.keys(this.radars).length === 3) {
        mesh.position.set(0, 2, 300);
      } else if (Object.keys(this.radars).length === 4) {
        mesh.position.set(0, 2, -300);
      }
      this.scene.add(mesh);
    }
    // console.log(this.radars);
  }

  // 光墙效果
  createWall() {
    let radius = 300;
    let height = 50;

    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
    geometry.translate(0, height / 2, 0);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: true, // 被建筑物遮挡的问题
      uniforms: {
        u_color: { value: new THREE.Color(0x00ff00) },
        u_height: { value: 50 },
        u_opacity: { value: 0.6 },
        u_speed: { value: 3.0 },
        u_time: { value: this.time },
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_height;
        uniform float u_speed;
        
        varying float v_opacity;
        
        void main() {
          vec3 v_position = position * mod(u_time / u_speed, 1.0);
          
          v_opacity = mix(1.0, 0.0, position.y / u_height);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_opacity;
        
        varying float v_opacity;
        
        void main() {
          gl_FragColor = vec4(u_color, u_opacity * v_opacity);
        }
      `
    });
    if (this.wall) {
      this.wall.material = material;
    } else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 1, 0);
      this.wall = mesh;
      this.scene.add(mesh);
    }

  }

  // 扩散圆盘效果
  createCylinder() {
    const geometry = new THREE.CylinderGeometry(
      100,
      100,
      10,
      32,
      1,
      false,
    )

    // geometry.translate(0, 10 / 2, 0);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: new THREE.Color(0xff00ff) },
        u_height: { value: 10 },
        u_opacity: { value: 0.6 },
        u_speed: { value: 2.0 },
        u_time: { value: this.time },
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_height;
        uniform float u_speed;
        
        varying float v_opacity;
        
        void main() {
          vec3 v_position = position * mod(u_time / u_speed, 1.0);
          
          v_opacity = mix(1.0, 0.0, position.y / u_height);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_opacity;
        
        varying float v_opacity;
        
        void main() {
          gl_FragColor = vec4(u_color, u_opacity * v_opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide, // 解决只显示一半的问题
      depthTest: false, // 被建筑物遮挡的问题
    })

    if (this.cylinder) {
      this.cylinder.material = material;
    } else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-300, 1, 300);
      this.cylinder = mesh;
      this.scene.add(mesh);
    }
  }

  // 扩散半球
  createHalfSphere() {
    const geometry = new THREE.SphereGeometry(
      50, 32, 32, Math.PI / 2, Math.PI * 2, 0, Math.PI / 2
    );

    // geometry.translate(0, 60 / 2, 0);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: new THREE.Color(0xffff00) },
        u_height: { value: 120 },
        u_opacity: { value: 0.6 },
        u_speed: { value: 2.0 },
        u_time: { value: this.time },
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_height;
        uniform float u_speed;
        
        varying float v_opacity;
        
        void main() {
          vec3 v_position = position * mod(u_time / u_speed, 1.0);
          
          v_opacity = mix(1.0, 0.0, position.y / u_height);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_opacity;
        
        varying float v_opacity;
        
        void main() {
          gl_FragColor = vec4(u_color, u_opacity * v_opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide, // 解决只显示一半的问题
      depthTest: false, // 被建筑物遮挡的问题
    });

    if (this.sphere) {
      this.sphere.material = material;
    } else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-300, 1, -300);
      this.sphere = mesh;
      this.scene.add(mesh);
    }
  }

  // 四棱锥
  createCone() {
    // 四棱锥
    const geometry = new THREE.ConeGeometry(10, 15, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cone = new THREE.Mesh(geometry, material);

    // 外线框
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    let edgesGeometry = new THREE.EdgesGeometry(geometry);
    let line = new THREE.LineSegments(edgesGeometry, lineMaterial);
    line.scale.copy(cone.scale);
    line.position.copy(cone.position);
    line.rotation.copy(cone.rotation);

    cone.add(line);
    cone.position.set(0, 60, 0);
    cone.rotation.x = Math.PI;
    this.cone = cone;
    this.scene.add(cone);

    // new TWEEN.Tween(cone.position)
    //   .to({ x: 0, y: 80, z: 0, }, 2000)
    //   .repeat(Infinity)
    //   .yoyo(true)
    //   .easing(TWEEN.Easing.Cubic.InOut)
    //   .start();

    // new TWEEN.Tween(cone.rotation)
    //   .to({ x: cone.rotation.x, y: Math.PI * 2, z: cone.rotation.z, }, 2000)
    //   .repeat(Infinity)
    //   .start();

    gsap.to(cone.position, {
      x: 0,  // x运动到5
      y: 80,
      z: 0,
      duration: 1, // 2s一次
      repeat: -1, // 无限循环
      yoyo: true, // 往返运动
      // ease: "back.out(1.7)",
      ease: 'linear'
    });

    gsap.to(cone.rotation, {
      y: Math.PI * 2,
      duration: 2, // 2s一次
      repeat: -1,
      ease: 'linear'
    });
  }

  // 创建飞线 
  createFly() {
    let source = new THREE.Vector3(300, 0, -200);
    let target = new THREE.Vector3(-500, 0, -240);
    let range = 200;
    let height = 300;
    let color = new THREE.Color(0xcccccc);
    let size = 30;
    // 通过起始点和终止点来计算中心位置
    const center = target.clone().lerp(source, 0.5);
    // 设置中心位置的高度
    center.y += height;
    // 起点到终点的距离
    const len = Math.floor(source.distanceTo(target));
    // 添加好了贝塞尔曲线运动
    const curve = new THREE.QuadraticBezierCurve3(source, center, target);
    // 获取粒子
    const points = curve.getPoints(len);

    const positions = [];
    const aPositions = [];
    for (let i in points) {
      positions.push(points[i].x, points[i].y, points[i].z);
      aPositions.push(i as unknown as number);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('a_position', new THREE.Float32BufferAttribute(aPositions, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: color },
        u_range: { value: range },
        u_size: { value: size },
        u_total: { value: len },
        u_time: { value: this.time },
      },
      vertexShader: `
        attribute float a_position;
        
        uniform float u_time;
        uniform float u_size;
        uniform float u_range;
        uniform float u_total;
      
        varying float v_opacity;
        
        void main() {
          float size = u_size;
          float total_number = u_total * mod(u_time / 2.0, 1.0);
          
          if (total_number > a_position && total_number < a_position + u_range) {
          
            // 拖尾效果
            float index = (a_position + u_range - total_number) / u_range;
            size *= index;
            
            v_opacity = 1.0;
          } else {
            v_opacity = 0.0;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size / 10.0;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_opacity;
        
        void main() {
          gl_FragColor = vec4(u_color, v_opacity);
        }
      `,
      transparent: true,
    });

    if (this.fly) {
      this.fly.material = material;
    } else {
      // material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const point = new THREE.Points(geometry, material);
      this.fly = point;
      this.scene.add(point);
    }
  }

  // 地面移动的粒子
  createMove() {
    let source = new THREE.Vector3(300, 0, -200);
    // 终止点
    let target = new THREE.Vector3(-500, 0, -240);
    let range = 200;
    let height = 300;
    let color = new THREE.Color(0xffff00);
    let size = 30;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-320, 0, 160),
      new THREE.Vector3(-150, 0, -40),
      new THREE.Vector3(-10, 0, -35),
      new THREE.Vector3(40, 0, 40),
      new THREE.Vector3(30, 0, 150),
      new THREE.Vector3(-100, 0, 310),
    ]);

    // 获取粒子
    const points = curve.getPoints(400);

    const positions = [];
    const aPositions = [];
    for (let i in points) {
      positions.push(points[i].x, points[i].y, points[i].z);
      aPositions.push(i as unknown as number);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('a_position', new THREE.Float32BufferAttribute(aPositions, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: color },
        u_range: { value: range },
        u_size: { value: size },
        u_total: { value: 400 },
        u_time: { value: this.time },
      },
      vertexShader: `
        attribute float a_position;
        
        uniform float u_time;
        uniform float u_size;
        uniform float u_range;
        uniform float u_total;
      
        varying float v_opacity;
        
        void main() {
          float size = u_size;
          float total_number = u_total * mod(u_time / 2.0, 1.0);
          
          if (total_number > a_position && total_number < a_position + u_range) {
          
            // 拖尾效果
            float index = (a_position + u_range - total_number) / u_range;
            size *= index;
            
            v_opacity = 1.0;
          } else {
            v_opacity = 0.0;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size / 10.0;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_opacity;
        
        void main() {
          gl_FragColor = vec4(u_color, v_opacity);
        }
      `,
      transparent: true,
    });

    if (this.move) {
      this.move.material = material;
    } else {
      const point = new THREE.Points(geometry, material);
      point.position.set(0, 2, 0);
      this.move = point;
      this.scene.add(point);
    }
  }

  // 添加文字
  createFont() {
    new FontLoader().load('../../public/fonts/chinese-font.json', (font) => {

      [
        {
          text: '最高的楼',
          size: 10,
          position: {
            x: -60,
            y: 130,
            z: 380,
          },
          rotate: Math.PI / 1.3,
          color: '#ffffff'
        },
        {
          text: '第二高',
          size: 10,
          position: {
            x: 160,
            y: 110,
            z: -100,
          },
          rotate: Math.PI / 2,
          color: '#ffffff'
        },
      ].forEach(item => {
        let materials = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00, flatShading: false });

        const textGeo = new TextGeometry(item.text, {
          font: font,
          size: item.size,  // 文字大小
          depth: 0.6,  // 文字厚度
          curveSegments: 10, // 分段数，越多越圆滑
          bevelEnabled: true,
          bevelThickness: 0.6, // 文字厚度
          bevelSize: 0.06, // 粗细
          bevelSegments: 4, // 分段数，越多越圆滑
        });

        textGeo.computeBoundingBox();

        let textMesh1 = new THREE.Mesh(textGeo, materials);

        // textMesh1.position.x = centerOffset;
        // textMesh1.position.y = hover;
        // textMesh1.position.z = 0;

        // textMesh1.rotation.x = 0;
        // textMesh1.rotation.y = Math.PI * 2;
        // textMesh1.scale.set(0.2, 0.2, 0.2);
        textMesh1.position.set(item.position.x, item.position.y, item.position.z);

        this.scene.add(textMesh1);
      });

    });
  }

  // 下雪
  createSnow() {
    for (let j = 0; j < 2; ++j) {
      const vertices = [];
      const colors = [];
      for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(1600);
        let y = Math.random() * 1000;
        const z = THREE.MathUtils.randFloatSpread(1600);
        vertices.push(x, y, z);
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();
        colors.push(r, g, b);
      }

      const geometry = new THREE.BufferGeometry();
      // float32BufferAttribute 3个为一组
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      // 纹理
      const textureLoader = new THREE.TextureLoader();
      let type = Math.random() * 90;
      let texture = textureLoader.load('../../public/texture/points/14.png');
      if (type < 30) {
        texture = textureLoader.load('../../public/texture/points/xh.png');
      } else if (type < 60) {
        texture = textureLoader.load('../../public/texture/points/snow.png');
      } else {
        texture = textureLoader.load('../../public/texture/points/14.png');
      }
      // 点材质
      const material = new THREE.PointsMaterial({
        size: 4,
        // color: 0xfff000,
        alphaMap: texture, // 可透明纹理贴图
        transparent: true,
        depthWrite: false, // 去除黑色部分产生的白色阴影
        blending: THREE.AdditiveBlending, // 点光源叠加,发光
        vertexColors: true, // 开起顶点颜色设置
      });
      const points = new THREE.Points(geometry, material);
      // points.scale.set(1, 1, 1);
      if (j === 1) {
        points.position.y += 1000;
      }
      console.log(points.position);
      points.visible = false;
      this.snow.push(points);
      this.scene.add(points);
    }
  }

  updateSnow() {
    if (this.snow.length == 2) {
      // console.log(this.snow[0].position.y, this.snow[1].position.y);
      for (let i = 0; i < 2; ++i) {
        let type = Math.random() * 10;
        if (type < 5) {
          this.snow[i].position.x -= 0.02;
          this.snow[i].position.z -= 0.02;
        } else {
          this.snow[i].position.x += 0.02;
          this.snow[i].position.z += 0.02;
        }
        this.snow[i].position.y -= 0.2;
        if (this.snow[i].position.y <= -1000) {
          this.snow[i].position.y = 1000;
          this.snow[i].position.x = 0;
          this.snow[i].position.z = 0;
        }
      }
    }
  }

  // 下雨
  createRain() {
    for (let j = 0; j < 2; ++j) {
      const vertices = [];
      const colors = [];
      for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(1600);
        let y = Math.random() * 1000;
        const z = THREE.MathUtils.randFloatSpread(1600);
        vertices.push(x, y, z);
        colors.push(0.1, 0.1, 0.4);
      }

      const geometry = new THREE.BufferGeometry();
      // float32BufferAttribute 3个为一组
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      // 纹理
      const textureLoader = new THREE.TextureLoader();
      let texture = textureLoader.load('../../public/texture/points/rain.png');
      // 点材质
      const material = new THREE.PointsMaterial({
        size: 4,
        // color: 0xfff000,
        alphaMap: texture, // 可透明纹理贴图
        transparent: true,
        depthWrite: false, // 去除黑色部分产生的白色阴影
        blending: THREE.AdditiveBlending, // 点光源叠加,发光
        vertexColors: true, // 开起顶点颜色设置
      });
      const points = new THREE.Points(geometry, material);
      // points.scale.set(1, 1, 1);
      if (j === 1) {
        points.position.y += 1000;
      }
      console.log(points.position);
      points.visible = false;
      this.rain.push(points);
      this.scene.add(points);
    }
  }

  updateRain() {
    if (this.rain.length == 2) {
      for (let i = 0; i < 2; ++i) {
        this.rain[i].position.y -= 1.5;
        if (this.rain[i].position.y <= -1000) {
          this.rain[i].position.y = 1000;
          this.rain[i].position.x = 0;
          this.rain[i].position.z = 0;
        }
      }
    }
  }

  // 烟雾报警
  createFog() {
    // 粒子初始化 空的缓冲几何体
    this.geometry = new THREE.BufferGeometry();

    let material = new THREE.PointsMaterial({
      size: 40,
      map: new THREE.TextureLoader().load('../../public/smoke.png'),
      transparent: true,
      depthWrite: false, // 禁止深度写入
    });

    material.onBeforeCompile = function (shader) {
      const vertex1 = `
        attribute float a_opacity;
        attribute float a_size;
        attribute float a_scale;
        varying float v_opacity;
        
        void main() {
          v_opacity = a_opacity;
      `;

      const glPosition = `
        gl_PointSize = a_size * a_scale;
      `;

      shader.vertexShader = shader.vertexShader.replace('void main() {', vertex1);
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size', glPosition);

      const fragment1 = `
        varying float v_opacity;
      
        void main() {
      `;
      const fragment2 = `
        gl_FragColor = vec4(outgoingLight, diffuseColor.a * v_opacity);
      `;

      shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragment1);
      shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4(outgoingLight, diffuseColor.a);', fragment2);
    }

    if (this.geometry) {
      let points = new THREE.Points(this.geometry, material);
      this.smoke = points;
      this.scene.add(points);
    }

  }

  createFogPoint() {
    this.smokes.push({
      size: 40,
      opacity: 1,
      x: 0,
      y: 0,
      z: 0,
      speed: {
        x: Math.random(),
        y: Math.random() + 0.3,
        z: Math.random()
      },
      scale: 1,
    });
  }

  updateFog() {
    if (!this.geometry) return;

    const positionList: number[] = [];
    const sizeList: number[] = [];
    const scaleList: number[] = [];
    const opacityList: number[] = [];
    this.smokes = this.smokes.filter(item => {
      // 如果说达到某一个条件，就抛弃当前的粒子。 opacity <= 0
      if (item.opacity < 0) {
        return false;
      }
      item.opacity -= 0.01;

      item.x = item.x + item.speed.x
      item.y = item.y + item.speed.y
      item.z = item.z + item.speed.z

      item.scale += 0.008;

      positionList.push(item.x, item.y, item.z);
      sizeList.push(item.size);
      scaleList.push(item.scale);
      opacityList.push(item.opacity);

      return true;
    });

    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionList), 3))
    this.geometry.setAttribute('a_opacity', new THREE.BufferAttribute(new Float32Array(opacityList), 1))
    this.geometry.setAttribute('a_size', new THREE.BufferAttribute(new Float32Array(sizeList), 1))
    this.geometry.setAttribute('a_scale', new THREE.BufferAttribute(new Float32Array(scaleList), 1))
  }

  // 点击聚焦
  clickEvent(evt: MouseEvent) {
    if (this.preventFocusTag) return;
    // 创建射线
    const raycaster = new THREE.Raycaster();
    // 创建鼠标向量
    const mouse = new THREE.Vector2();
    // 归一化，-1~1
    mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse.x, mouse.y);
    // 通过鼠标和相机位置更新射线
    raycaster.setFromCamera(mouse, this.camera);
    // 计算物体和射线的交点,能获取到点击的图形
    // const intersects = raycaster.intersectObjects(scene.children);
    const intersects = raycaster.intersectObjects(this.scene.children);

    // console.log(intersects);

    if (Array.isArray(intersects) && intersects.length && intersects[0].object.name === 'city') {

      console.log(intersects[0].point);

      new TWEEN.Tween(this.camera.position).to({
        x: intersects[0].point.x * 1.2,
        y: intersects[0].point.y * 2,
        z: intersects[0].point.z * 1.2,
      }, 1000).start();
      new TWEEN.Tween(this.camera.rotation).to({
        x: this.camera.rotation.x,
        y: this.camera.rotation.y,
        z: this.camera.rotation.z,
      }, 1000).start();
    }
  }

  // 滚动滚轮时根据鼠标位置进行缩放
  wheelEvent() {
    const body = document.body as HTMLDivElement;
    (body as any).onmousewheel = (evt: MouseEvent) => {
      console.log('wheel!!!!!!!!!!');
      const value = 30;

      // 鼠标当前的坐标信息
      const x = (evt.clientX / window.innerWidth) * 2 - 1;
      const y = -(evt.clientY / window.innerHeight) * 2 + 1;

      const vector = new THREE.Vector3(x, y, 0.5);

      vector.unproject(this.camera)
      vector.sub(this.camera.position).normalize()

      if ((evt as any).wheelDelta > 0) {
        // console.log(this.camera.position);
        this.camera.position.x += vector.x * value;
        this.camera.position.y += vector.y * value;
        this.camera.position.z += vector.z * value;

        this.controls.target.x += vector.x * value;
        this.controls.target.y += vector.y * value;
        this.controls.target.z += vector.z * value;
      } else {
        this.camera.position.x -= vector.x * value;
        this.camera.position.y -= vector.y * value;
        this.camera.position.z -= vector.z * value;

        this.controls.target.x -= vector.x * value;
        this.controls.target.y -= vector.y * value;
        this.controls.target.z -= vector.z * value;
      }
    }
  }

  // 防止滑动时点击聚焦
  preventFoucs() {
    document.onmousedown = () => {
      // console.log(this);
      this.preventFocusTag = false;
      document.onmousemove = () => {
        this.preventFocusTag = true;
      }
    }
  }
}
