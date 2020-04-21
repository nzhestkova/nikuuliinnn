import { Component, OnInit } from "@angular/core";
import * as dat from "dat.gui";
import {
  AxesHelper, BoxGeometry, CircleGeometry, Color, Fog, Mesh, MeshPhongMaterial, MeshStandardMaterial,
  PerspectiveCamera, PointLight, Scene, SphereGeometry, Vector3, WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball } from "./ball";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent implements OnInit {
  camera: PerspectiveCamera;
  light: PointLight;
  ground: Mesh;
  orbitControls: OrbitControls;
  renderer: WebGLRenderer;
  scene: Scene;
  axes: AxesHelper;
  webGLOutput: HTMLCanvasElement;

  colors = [
    "brown",
    "bisque",
    "blueviolet",
    "darkorange",
    "darkolivegreen",
    "firebrick",
    "red",
    "orange",
    "yellow",
    "green",
    "blue"];

  controls: {
    startAngle: number;
    horizontalAngle: number;
    startSpeed: number;
    startPosition: Vector3;
    speedRecoveryCoefficient: number;
    airResistance: number;
    timeline: number;
    wallDepth: number;
    wallLength: number;
    wallFar: number;
    ballGeneratingSpeed: number;
  };

  ballRadius: number;
  balls: Ball[];
  ballsIDCounter: number;

  groundInit(): void {
    const circleGeometry = new CircleGeometry(window.innerWidth);
    const circleMaterial = new MeshPhongMaterial({color: 0x554C3A});
    this.ground = new Mesh(circleGeometry, circleMaterial);
    this.ground.rotation.x = -0.5 * Math.PI;
    this.ground.position.x = 0;
    this.ground.position.y = -5;
    this.ground.position.z = 0;
    this.ground.castShadow = true;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  lightInit(): void {
    this.light = new PointLight(0xADA9A1, 1.7, Infinity);
    this.light.position.set(0, 200, 0);
    this.light.receiveShadow = true;
    this.light.castShadow = true;
    this.scene.add(this.light);
  }

  orbitControlsInit(): void {
    this.orbitControls.target = new Vector3(100, 0, 0);
    this.orbitControls.update();
  }

  resizeRendererToDisplaySize(): boolean {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  init(): void {
    this.scene = new Scene();
    this.scene.fog = new Fog(0xCBCBCB, 200, 700);
    this.scene.background = new Color(0xCBCBCB);
    this.camera = new PerspectiveCamera(45,
      window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.x = 100;
    this.camera.position.y = 30;
    this.camera.position.z = 200;
    this.axes = new AxesHelper(1000);
    // this.scene.add(this.axes);
    this.webGLOutput = <HTMLCanvasElement> document.getElementById("WebGL-Output");
    this.renderer = new WebGLRenderer({canvas: this.webGLOutput});
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0xEEEEEE);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  animate(): void {
    if (this.resizeRendererToDisplaySize()) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    const wall = this.scene.getObjectByName(`wall`);
    wall.position.x = this.controls.wallFar;
    this.balls.forEach((ball) => {
      ball.collision(new Vector3(wall.position.x - 2, wall.position.y - this.controls.wallLength, wall.position.z - this.controls.wallDepth),
        new Vector3(wall.position.x + 2, wall.position.y + this.controls.wallLength, wall.position.z + this.controls.wallDepth));
      ball.animate();
    });

    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  randomInteger(min: number, max: number): number {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  createBall(startSpeed: number,
             startAngle: number,
             horizontalAngle: number,
             startPosition: Vector3,
             speedRecoveryCoefficient: number): void {
    const sphereGeometry = new SphereGeometry(this.ballRadius, 50, 50);
    const sphereMaterial = new MeshStandardMaterial({color: this.colors[this.randomInteger(0, 5)]});
    const sphere = new Mesh(sphereGeometry, sphereMaterial);
    sphere.name = `ball`;
    this.ballsIDCounter += 1;
    sphere.castShadow = true;
    const ball = new Ball(this.ballsIDCounter, this.ballRadius,
      startSpeed, startAngle, startPosition, speedRecoveryCoefficient,
      this.controls.airResistance, sphere, this.scene, horizontalAngle);
    this.scene.add(sphere);
    this.balls.push(ball);
    setTimeout(() => {
      this.balls.splice(this.balls.indexOf(ball), 1);
      this.scene.remove(sphere);
    }, this.controls.ballGeneratingSpeed);
  }

  start(): void {
    this.createBall(this.controls.startSpeed,
      this.controls.startAngle,
      this.controls.horizontalAngle,
      new Vector3(0, 0, 0),
      this.controls.speedRecoveryCoefficient);
  }

  ngOnInit(): void {
    this.init();
    this.groundInit();
    this.lightInit();
    this.orbitControlsInit();

    this.balls = [];
    this.ballsIDCounter = 0;
    this.ballRadius = 5;

    this.controls = {
      startPosition: new Vector3(0, this.ballRadius, 0),
      startAngle: 50,
      horizontalAngle: 5,
      startSpeed: 30,
      speedRecoveryCoefficient: 1,
      airResistance: 0.6,
      timeline: 0,
      wallDepth: 40,
      wallLength: 25,
      wallFar: 150,
      ballGeneratingSpeed: 10 * 1000,
    };

    const startGeometry = new CircleGeometry(this.ballRadius + 5, 50);
    const startMaterial = new MeshStandardMaterial({ color: 0x2C2316 });
    const startPoint = new Mesh(startGeometry, startMaterial);
    startPoint.receiveShadow = true;
    startPoint.rotateX(-Math.PI / 2);
    startPoint.position.y = -4.9;
    this.scene.add(startPoint);

    const wallGeometry = new BoxGeometry(this.controls.wallLength * 2, 4, this.controls.wallDepth * 2, 50);
    const wallMaterial = new MeshStandardMaterial({color: this.colors[this.randomInteger(0, 5)]});
    const wall = new Mesh(wallGeometry, wallMaterial);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.position.x = this.controls.wallFar;
    wall.position.y = this.controls.wallLength - 5;
    wall.rotateZ(Math.PI / 2);
    wall.name = "wall";
    this.scene.add(wall);

    const gui = new dat.GUI();
    gui.add(this.controls, "startAngle", 0, 180).name("угол наклона");
    gui.add(this.controls, "startSpeed", 0, 100).name("начальная скорость");
    gui.add(this.controls, "speedRecoveryCoefficient", 0, 1).name("коэффициент восстановления");
    gui.add(this.controls, "airResistance", 0, 2).name("сопротивление воздуха");
    gui.add(this.controls, "horizontalAngle", -90, 90).name("угол поворота");
    gui.add(this.controls, "wallFar", 30, 200).name("близость стены");
    this.start();

    setInterval(this.start.bind(this), this.controls.ballGeneratingSpeed);
    // setInterval(() => {
    //   wall.position.x = this.controls.wallFar;
    //   this.balls.forEach((ball) => {
    //     ball.collision(new Vector3(wall.position.x - 2, wall.position.y - this.controls.wallLength, wall.position.z - this.controls.wallDepth),
    //       new Vector3(wall.position.x + 2, wall.position.y + this.controls.wallLength, wall.position.z + this.controls.wallDepth));
    //     ball.animate();
    //   });
    // }, 10);



    this.renderer.render(this.scene, this.camera);
    this.animate();
  }
}
