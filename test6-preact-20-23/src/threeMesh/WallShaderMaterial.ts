import * as THREE from "three";

export default function WallShaderMaterial(panarama: any) {
  let point = panarama.point[0];
  console.log(point.panoramaUrl);
  let panaramaTexture = new THREE.TextureLoader().load(point.panoramaUrl);
  panaramaTexture.flipY = false;
  panaramaTexture.wrapS = THREE.RepeatWrapping;
  panaramaTexture.wrapT = THREE.RepeatWrapping;
  panaramaTexture.magFilter = THREE.NearestFilter;
  panaramaTexture.minFilter = THREE.NearestFilter;
  let center = new THREE.Vector3(point.x / 100, point.z / 100, point.y / 100);
  return new THREE.ShaderMaterial({
    uniforms: {
      uPanorama: { value: panaramaTexture },
      uCenter: { value: center },
    },
    vertexShader: `
        varying vec2 vUv;
        uniform vec3 uCenter;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vec4 modelpos = modelMatrix * vec4(position, 1.0);
            vPosition = modelpos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uPanorama;
        uniform vec3 uCenter;
        varying vec3 vPosition;
        const float PI = 3.14159265359;
        
        void main() {

            vec3 nPos = normalize(vPosition - uCenter);
            float theta = acos(nPos.y)/PI;
            float phi = 0.0;
            phi = (atan(nPos.z, nPos.x)+PI)/(2.0*PI);
            phi += 0.75;
            vec4 pColor = texture2D(uPanorama, vec2(phi, theta));
            
            gl_FragColor = pColor;
            if(nPos.z<0.003&&nPos.z>-0.003 && nPos.x<0.0){
                phi = (atan(0.003, nPos.x)+PI)/(2.0*PI);
                phi += 0.75;
                gl_FragColor = texture2D(uPanorama, vec2(phi, theta));
            }

        }
    `,
  });
}
