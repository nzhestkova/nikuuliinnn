import { Object3D, Scene, Vector3 } from "three";

export class Ball {
  degToRad = Math.PI / 180;
  step = 0.1;
  weight = 10;
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

  getCurrentAngle(): number {
    const currentPos = this.object3D.position;
    const nextPos = new Vector3(
      this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * (this.timeline + this.step),
      this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * (this.timeline + this.step) - (9.81 * Math.pow(this.timeline + this.step, 2) / 2),
      this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * (this.timeline + this.step),
      // this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * (this.timeline + this.step)
      // - this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad), 2) * Math.pow(this.timeline + this.step, 2) / 2,
      // this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * (this.timeline + this.step)
      // - (9.81 + this.airResistance / this.weight * Math.pow(this.startSpeed * Math.sin(this.startAngle * this.degToRad), 2)) * Math.pow(this.timeline + this.step, 2) / 2,
      // this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * (this.timeline + this.step)
      // - this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad), 2) * Math.pow(this.timeline + this.step, 2) / 2,
    );
    const deltaX = nextPos.x - currentPos.x;
    const deltaY = nextPos.y - currentPos.y;
    // console.log(Math.atan(deltaY / deltaX) / this.degToRad);
    // return deltaX >= 0 ? Math.atan(deltaY / deltaX) : Math.PI - Math.atan(deltaY / deltaX);
    return Math.sign(deltaX) < 0 ? Math.sign(deltaY) * (Math.PI - Math.atan(Math.abs(deltaY / deltaX))) : Math.sign(deltaY) * Math.atan(Math.abs(deltaY / deltaX));
  }

  getCurrentSpeed(): number {
    const Vx = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad)
      + this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad), 2) * this.timeline;
    const Vy = this.startSpeed * Math.sin(this.startAngle * this.degToRad) - (9.81 + this.airResistance / this.weight * Math.pow(this.startSpeed * Math.sin(this.startAngle * this.degToRad), 2)) * this.timeline;
    const Vz = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad)
      + this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad), 2) * this.timeline;
    // const Vx = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad);
    // const Vy = this.startSpeed * Math.sin(this.startAngle * this.degToRad) - 9.81 * this.timeline;
    // const Vz = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad);
    // console.log(Math.sqrt(Math.pow(Vx, 2) + Math.pow(Vy, 2) + Math.pow(Vz, 2)));
    return Math.sqrt(Math.pow(Vx, 2) + Math.pow(Vy, 2) + Math.pow(Vz, 2));
  }

  animate(): void {
    this.onGround = this.object3D.position.y < 0;
    if (!this.onGround) {
      this.move();
      return;
    }
    this.startSpeed *= this.speedRecoveryCoefficient;
    this.startAngle = this.startAngle > 0 ? this.startAngle : -this.startAngle;
    this.object3D.position.set(this.object3D.position.x, this.object3D.position.y + Math.abs(0 - this.object3D.position.y), this.object3D.position.z);
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
    const angle = -((Math.sign(this.startAngle) * 180) - this.startAngle);
    return new Vector3(
      this.object3D.position.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.step
      - (this.airResistance / this.weight * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
      this.object3D.position.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.step
      - (9.81 + this.airResistance / this.weight * this.startSpeed * Math.sin(this.startAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
      this.object3D.position.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.step
      - (this.airResistance / this.weight * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) / 2) * Math.pow(this.step, 2),
    );
    // return new Vector3(
    //   this.object3D.position.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.step,
    //   this.object3D.position.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.step - 9.81 * Math.pow(this.step, 2) / 2,
    //   this.object3D.position.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.step,
    // );
  }

  newAngle(nextPosition: Vector3): number {
    const deltaX = nextPosition.x - this.object3D.position.x;
    const deltaY = nextPosition.y - this.object3D.position.y;
    return Math.sign(deltaX) < 0 ? Math.sign(deltaY) * (Math.PI - Math.atan(Math.abs(deltaY / deltaX))) : Math.sign(deltaY) * Math.atan(Math.abs(deltaY / deltaX));
  }

  newSpeed(): number {
    const angle = -((Math.sign(this.startAngle) * 180) - this.startAngle);
    const newVx = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad)
      - this.airResistance / this.weight * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad)
      * this.step;

    const newVy = this.startSpeed * Math.sin(this.startAngle * this.degToRad)
      - (9.81 + this.airResistance / this.weight * this.startSpeed * Math.sin(this.startAngle * this.degToRad)) * this.step;

    const newVz = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad)
      - this.airResistance / this.weight * this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad)
      * this.step;

    // console.log(newVx, newVy, newVz);
    return Math.sqrt(Math.pow(newVx, 2) + Math.pow(newVy, 2) + Math.pow(newVz, 2));
    // const newVx = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad);
    // const newVy = this.startSpeed * Math.sin(this.startAngle * this.degToRad) - 9.81  * this.step;
    // const newVz = this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad);
    // return Math.sqrt(Math.pow(newVx, 2) + Math.pow(newVy, 2) + Math.pow(newVz, 2));
  }

  move(): void {
    // this.object3D.position.x = this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.timeline;
    // this.object3D.position.y = this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.timeline - (9.81 * Math.pow(this.timeline, 2) / 2);
    // this.object3D.position.z = this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.timeline;
    // this.object3D.position.x = this.startPosition.x + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad) * this.timeline
    //   - this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.cos(this.horizontalAngle * this.degToRad), 2) * Math.pow(this.timeline, 2) / 2;
    // this.object3D.position.y = this.startPosition.y + this.startSpeed * Math.sin(this.startAngle * this.degToRad) * this.timeline
    //   - (9.81 + this.airResistance / this.weight * Math.pow(this.startSpeed * Math.sin(this.startAngle * this.degToRad), 2)) * Math.pow(this.timeline, 2) / 2;
    // this.object3D.position.z = this.startPosition.z + this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad) * this.timeline
    //   - this.airResistance / this.weight * Math.pow(this.startSpeed * Math.cos(this.startAngle * this.degToRad) * Math.sin(this.horizontalAngle * this.degToRad), 2) * Math.pow(this.timeline, 2) / 2;
    // console.log(this.startSpeed);
    const newPos = this.newPosition();
    this.startAngle = this.newAngle(newPos) / this.degToRad;
    console.log(this.startAngle);
    this.startSpeed = this.newSpeed();

    this.object3D.position.set(newPos.x, newPos.y, newPos.z);
    this.timeline += this.step;
  }
}
