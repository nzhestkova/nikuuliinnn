import { Object3D, Scene, Vector3 } from "three";

export class Ball {
  degToRad = Math.PI / 180;
  step = 0.1;
  id: number;
  radius: number;
  startSpeed: number;
  startAngle: number;
  horizontalAngle: number;
  startPosition: Vector3;
  speedRecoveryCoefficient: number;
  onGround: boolean;
  timeline: number;
  object3D: Object3D;

  scene: Scene;

  constructor(id: number, radius: number, startSpeed: number, startAngle: number,
              startPosition: Vector3, speedRecoveryCoefficient: number,
              object3D: Object3D, scene: Scene, horizontalAngle: number) {
    this.id = id;
    this.radius = radius;
    this.startSpeed = startSpeed;
    this.startAngle = startAngle;
    this.startPosition = startPosition;
    this.speedRecoveryCoefficient = speedRecoveryCoefficient;
    this.object3D = object3D;
    this.scene = scene;
    this.horizontalAngle = horizontalAngle;
    this.timeline = 0;
  }

  getCurrentAngle(): number {
    const currentPos = this.object3D.position;
    const nextPos = new Vector3(
      this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * (this.timeline + this.step),
      this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * (this.timeline + this.step) - (9.81 * Math.pow((this.timeline + this.step), 2) / 2),
      this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * (this.timeline + this.step),
    );
    const deltaX = nextPos.x - currentPos.x;
    const deltaY = nextPos.y - currentPos.y;
    return deltaX >= 0 ? Math.atan(deltaY / deltaX) : Math.PI - Math.atan(deltaY / deltaX) ;
  }

  animate(): void {
    this.onGround = this.object3D.position.y < 0;
    if (!this.onGround) {
      this.move();
      return;
    }
    const currentAngle = this.getCurrentAngle() / this.degToRad;
    this.startAngle  = currentAngle > 0 ? currentAngle : -currentAngle;
    this.startSpeed *= this.speedRecoveryCoefficient;
    this.startPosition = new Vector3(this.object3D.position.x, this.object3D.position.y + Math.abs(0 - this.object3D.position.y), this.object3D.position.z);
    this.timeline = 0;
    this.move();
  }

  checkCollision(leftBorder: Vector3, rightBorder: Vector3): boolean {
    const onX = this.object3D.position.x >= leftBorder.x - this.radius && this.object3D.position.x <= rightBorder.x;
    const onY = this.object3D.position.y >= leftBorder.y + this.radius && this.object3D.position.y <= rightBorder.y;
    const onZ = this.object3D.position.z >= leftBorder.z - this.radius && this.object3D.position.z <= rightBorder.z;
    return onX && onY && onZ;
  }

  collision(leftBorder: Vector3, rightBorder: Vector3): void {
    const angle = this.getCurrentAngle();
    if (this.checkCollision(leftBorder, rightBorder)) {
      this.horizontalAngle = -this.horizontalAngle;
      this.startAngle = Math.sign(angle) * (Math.PI - Math.abs(angle)) / this.degToRad;
      this.startSpeed *= this.speedRecoveryCoefficient;
      this.startPosition = new Vector3(
        this.object3D.position.x - Math.abs(this.object3D.position.x - leftBorder.x),
        this.object3D.position.y,
        this.object3D.position.z,
      );
      this.timeline = 0;
      this.move();
    }
  }

  move(): void {
    this.object3D.position.x = this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.timeline;
    this.object3D.position.y = this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.timeline - (9.81 * Math.pow(this.timeline, 2) / 2);
    this.object3D.position.z = this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.timeline;
    this.timeline += this.step;
  }
}
