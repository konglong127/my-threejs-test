import { Link } from "react-router-dom";

export default function App() {
  return (<>
    <div className="App">
      <h1>
        three study stage 12~19
      </h1>
      <div className="line">
        <Link to="/test1">test1, gsap, 和tween相似</Link>
      </div>
      <div className="line">
        <Link to="/test2">test2, shaderMaterial 着色器</Link>
      </div>
      <div className="line">
        <Link to="/test3">test3, 孔明灯</Link>
      </div>
      <div className="line">
        <Link to="/test4">test4, water</Link>
      </div>
      <div className="line">
        <Link to="/test5">test5, 白天有太阳的海面</Link>
      </div>
      <div className="line">
        <Link to="/test6">test6, 浴缸</Link>
      </div>
      <div className="line">
        <Link to="/test7">test7, 点材质着色器</Link>
      </div>
      <div className="line">
        <Link to="/test8">test8, 烟花</Link>
      </div>
      <div className="line">
        <Link to="/test9">test9, 修改已有材质着色器</Link>
      </div>
      <div className="line">
        <Link to="/test10">test10, 修改已有材质着色器2</Link>
      </div>
      <div className="line">
        <Link to="/test11">test11, EffectComposer合成效果</Link>
      </div>
      <div className="line">
        <Link to="/test12">test12, EffectComposer合成效果2</Link>
      </div>
      <div className="line">
        <Link to="/test13">test13, EffectComposer合成效果3</Link>
      </div>
    </div>
  </>)
}