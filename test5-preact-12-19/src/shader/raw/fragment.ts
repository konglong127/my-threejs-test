export default `precision lowp float;
varying vec2 vUv;
varying float vElevation;

uniform sampler2D uTexture; 


void main(){
    float height = vElevation + 0.05 * 20.0;
    vec4 textureColor = texture2D(uTexture,vUv);
    textureColor.rgb*=height;
    gl_FragColor = textureColor;
    // 远近渐变色
    // gl_FragColor = vec4(1.0*(vElevation+0.05*10.0),0.0,0.0,1.0);
    // 通过vUv设置颜色
    // gl_FragColor = vec4(vUv,1.0,1.0); 
}`