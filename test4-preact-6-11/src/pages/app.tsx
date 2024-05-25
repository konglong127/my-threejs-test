import { Link } from "react-router-dom";

export default function App() {
  return (<>
    <div className="App">
      <h1>
        three study stage 6~11
      </h1>
      <div className="line">
        <Link to="/test1">test1, gsap, 和tween相似</Link>
      </div>
      <div className="line">
        <Link to="/test2">test2, directional light, shadow, 平行光, 阴影, 四棱锥型光源</Link>
      </div>
      <div className="line">
        <Link to="/test3">test3, spot light, 聚光灯, 圆锥型光源</Link>
      </div>
      <div className="line">
        <Link to="/test4">test4, point light, 点光灯, 球形光源</Link>
      </div>
      <div className="line">
        <Link to="/test5">test5, 家具编辑器</Link>
      </div>
      <div className="line">
        <Link to="/test6">test6, 播放模型动画</Link>
      </div>
      <div className="line">
        <Link to="/test7">test7, 自己肝一个模型动画, 动画帧</Link>
      </div>
      <div className="line">
        <Link to="/test8">test8, 模型动画切换</Link>
      </div>
      <div className="line">
        <Link to="/test9">test9, point geometry, point material</Link>
      </div>
      <div className="line">
        <Link to="/test10">test10, 星空!!!</Link>
      </div>
      <div className="line">
        <Link to="/test11">test11, 雪花效果</Link>
      </div>
      <div className="line">
        <Link to="/test12">test12, 雪花效果</Link>
      </div>
      <div className="line">
        <Link to="/test13">test13, 星系</Link>
      </div>
      <div className="line">
        <Link to="/test14">test14, 获取点击图形</Link>
      </div>
      <div className="line">
        <Link to="/test15">test15, 3d页面</Link>
      </div>
      <div className="line">
        <Link to="/test16">test16, 混乱三角形</Link>
      </div>
    </div>
  </>)
}