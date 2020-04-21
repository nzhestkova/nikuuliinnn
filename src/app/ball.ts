import { Object3D, Scene, Vector3 } from "three";

export class Ball {
  degToRad = Math.PI / 180;
  step = 0.1;
  weight = 100;
  id: number;
  radius: number;
  startSpeed: number;
  startAngle: number;
  horizontalAngle: number;
  startPosition: Vector3;
  speedRecoveryCoefficient: number;
  airResistance: number;
  onGround: boolean;
  timeline: number;
  object3D: Object3D;

  scene: Scene;

  constructor(id: number, radius: number, startSpeed: number, startAngle: number,
              startPosition: Vector3, speedRecoveryCoefficient: number, airResistance: number,
              object3D: Object3D, scene: Scene, horizontalAngle: number) {
    this.id = id;
    this.radius = radius;
    this.startSpeed = startSpeed;
    this.startAngle = startAngle;
    this.startPosition = startPosition;
    this.speedRecoveryCoefficient = speedRecoveryCoefficient;
    this.airResistance = airResistance;
    this.object3D = object3D;
    this.scene = scene;
    this.horizontalAngle = horizontalAngle;
    this.timeline = 0;

  }

  animate(): void {
    this.onGround = this.object3D.position.y < 0;
    if (!this.onGround) {
      this.move();
      return;
    }
    this.startSpeed *= this.speedRecoveryCoefficient;
    if (this.startSpeed > 0 && this.startSpeed < 5 && this.speedRecoveryCoefficient !== 1) {
      this.startSpeed -= this.startSpeed * this.speedRecoveryCoefficient;
    }
    this.startAngle = this.startAngle > 0 ? this.startAngle : -this.startAngle;
    this.object3D.position.set(this.object3D.position.x, this.object3D.position.y + Math.abs(0 - this.object3D.position.y), this.object3D.position.z);
    this.move();
  }

  checkCollision(leftBorder: Vector3, rightBorder: Vector3): boolean {
    const onX = this.object3D.position.x >= leftBorder.x - this.radius && this.object3D.position.x <= rightBorder.x;
    const onY = this.object3D.position.y >= leftBorder.y && this.object3D.position.y <= rightBorder.y;
    const onZ = this.object3D.position.z >= leftBorder.z - this.radius && this.object3D.position.z <= rightBorder.z;
    return onX && onY && onZ;
  }

  collision(leftBorder: Vector3, rightBorder: Vector3): void {
    console.log(this.object3D.position);
    if (this.checkCollision(leftBorder, rightBorder)) {
      this.startSpeed *= this.speedRecoveryCoefficient;
      this.horizontalAngle = -this.horizontalAngle;
      this.startAngle = Math.sign(this.startAngle) * (180 - Math.abs(this.startAngle));
      this.startPosition = new Vector3(
        this.object3D.position.x - Math.abs(this.object3D.position.x - leftBorder.x) - 0.1,
        this.object3D.position.y,
        this.object3D.position.z,
      );
      this.timeline = 0;
      this.move();
    }
  }

  newPosition(): Vector3 {
    return new Vector3(
      this.object3D.position.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.step
      - (this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
      this.object3D.position.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.step
      - (9.81 + this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.sin(this.startAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
      this.object3D.position.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.step
      - (this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
    );
  }

  newAngle(nextPosition: Vector3): number {
    const deltaXp = nextPosition.x - this.object3D.position.x;
    const deltaY = nextPosition.y - this.object3D.position.y;
    const deltaZ = nextPosition.z - this.object3D.position.z;
    const deltaX = Math.sign(deltaXp) * Math.sqrt(Math.pow(deltaXp, 2) + Math.pow(deltaZ, 2));
    return Math.sign(deltaX) < 0 ? Math.sign(deltaY) * (Math.PI - Math.atan(Math.abs(deltaY / deltaX))) : Math.sign(deltaY) * Math.atan(Math.abs(deltaY / deltaX));
  }

  newSpeed(): number {
    const newVx = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad)
      - this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.step;

    const newVy = this.startSpeed * Math.sin(this.startAngle * this.degToRad)
      - (9.81 + this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.sin(this.startAngle * this.degToRad)) * this.step;

    const newVz = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad)
      - this.airResistance / this.weight * this.startSpeed * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.step;

    return Math.sqrt(Math.pow(newVx, 2) + Math.pow(newVy, 2) + Math.pow(newVz, 2));
  }

  move(): void {
    const newPos = this.newPosition();
    this.startAngle = this.newAngle(newPos) / this.degToRad;
    this.startSpeed = this.newSpeed();

    this.object3D.position.set(newPos.x, newPos.y, newPos.z);
  }
}
