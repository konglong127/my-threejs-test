import * as THREE from "three";

type RoomShapePointsType = Array<{ x: number, y: number }>;

interface RoomType {
  areas: RoomShapePointsType;
  roomId: number,
  roomName: string,
  usageId: number
}

export default class RoomShapeMesh extends THREE.Mesh {
  room: RoomType;
  roomShapePoints: RoomShapePointsType;
  isTop: boolean;
  constructor(room: RoomType, isTop: boolean = false) {
    super();

    this.room = room;
    this.roomShapePoints = room.areas;
    this.isTop = isTop;
    this.init();
  }
  init() {
    // 通过点绘制成形状
    let roomShape = new THREE.Shape();
    // 生成房间形状
    for (let i = 0; i < this.roomShapePoints.length; i++) {
      let point = this.roomShapePoints[i];
      if (i === 0) {
        roomShape.moveTo(point.x / 100, point.y / 100);
      } else {
        roomShape.lineTo(point.x / 100, point.y / 100);
      }
    }
    // 生成房间形状的几何体
    let roomShapeGeometry = new THREE.ShapeGeometry(roomShape);
    // 旋转几何体顶点
    roomShapeGeometry.rotateX(Math.PI / 2);
    this.geometry = roomShapeGeometry;
    this.material = new THREE.MeshBasicMaterial({
      side: this.isTop ? THREE.FrontSide : THREE.DoubleSide,
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      transparent: true,
    });
    this.isTop ? (this.position.y = 2.8) : (this.position.y = 0);
  }
}
