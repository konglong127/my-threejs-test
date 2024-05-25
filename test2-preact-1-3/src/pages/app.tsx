import { Link } from "react-router-dom";

export default function App() {
  return (<>
    <div className="App">
      <h1>
        one study stage 1~3
      </h1>
      <div className="line">
        <Link to="/test1">test1, window resize, box geometry, axes helper, gui</Link>
      </div>
      <div className="line">
        <Link to="/test2">test2, buffer geometry</Link>
      </div>
      <div className="line">
        <Link to="/test3">test3, colorful box geometry </Link>
      </div>
      <div className="line">
        <Link to="/test4">test4, texture </Link>
      </div>
      <div className="line">
        <Link to="/test5">test5, fog, loader </Link>
      </div>
      <div className="line">
        <Link to="/test6">test6, light, ball, click event, tween动画 </Link>
      </div>
      <div className="line">
        <Link to="/test7">test7, uv, buffer geometry </Link>
      </div>
      <div className="line">
        <Link to="/test8">test8, bounding box, bounding sphere </Link>
      </div>
      <div className="line">
        <Link to="/test9">test9, compose bounding box </Link>
      </div>
      <div className="line">
        <Link to="/test10">test10, edge geometry, line geometry </Link>
      </div>
    </div>
  </>)
}