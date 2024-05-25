import { Link } from "react-router-dom";

export default function App() {
  return (<>
    <div className="App">
      <h1>
        three study stage 20~
      </h1>
      <div className="line">
        <Link to="/test1">test1, 组合html,css</Link>
      </div>
      <div className="line">
        <Link to="/test2">test2, 曲线, 相机运动</Link>
      </div>
      <div className="line">
        <Link to="/test3">test3, 变形动画 22 fail!</Link>
      </div>
      <div className="line">
        <Link to="/test4">test4, 全景看房</Link>
      </div>
      <div className="line">
        <Link to="/test5">test5, 图片生成房屋结构</Link>
      </div>
    </div>
  </>)
}