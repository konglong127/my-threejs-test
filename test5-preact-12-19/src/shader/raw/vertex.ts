export default `
precision lowp float;
attribute vec3 position; // 接收传入变量
attribute vec2 uv;


//定义,外部传入变量
uniform mat4 modelMatrix; 
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
// 通过vertex.glsl传给fragment.glsl
varying vec2 vUv;
varying float vElevation; // 保存z坐标,计算颜色深度,传给fragment.glsl


void main(){
    vUv = uv;
    // 移动坐标
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    // modelPosition.x+=1.0;
    // modelPosition.y+=1.0;
    modelPosition.z = sin((modelPosition.x+uTime) * 1000.0)*0.1;
    modelPosition.z += sin((modelPosition.y+uTime)  * 1000.0)*0.1;
    vElevation = modelPosition.z; 
    // project,view,model同步坐标
    gl_Position = projectionMatrix * viewMatrix * modelPosition ;
}`