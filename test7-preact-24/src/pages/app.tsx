import { Link } from 'react-router-dom'

export default function App() {

  return (
    <div className="App">
      <h1>
        three study stage 24
      </h1>
      <div className="line">
        <Link to="/test1">test1, 几何体, 文字几何体, 阴影, 灯光</Link>
      </div>
      <div className="line">
        <Link to="/test2">test2, tween动画, 获取点击的几何体, objloader, mtlloader</Link>
      </div>
      <div className="line">
        <Link to="/test3">test3, bone动画 </Link>
      </div>
      <div className="line">
        <Link to="/test4">test4, texture, 反射环境贴图 </Link>
      </div>
      <div className="line">
        <Link to="/test5">test5, 闪亮发光, 效果合成器EffectComposer </Link>
      </div>
      <div className="line">
        <Link to="/test6">test6, 粒子效果, 粒子波浪 </Link>
      </div>
      <div className="line">
        <Link to="/test7">test7, 粒子正方体 </Link>
      </div>
      <div className="line">
        <Link to="/test8">test8, 智慧城市 </Link>
      </div>
      <div className="line">
        <Link to="/test9">test9, 着色器语言openGLES</Link>
      </div>
      <div className="line">
        <Link to="/test10">test10, 尝试fps?</Link>
      </div>
    </div>
  )
}
