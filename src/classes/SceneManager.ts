import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ISceneManager {
  addRenderer(): void;
  setPlan(size: number): void;
  addControls(): void;
  addCamera(): void;
  addLights(): void;
  addQRCode(mesh: THREE.Mesh, size: number): void;
  resize(): void;
  getScene(): THREE.Scene;
  init(canvas: HTMLCanvasElement): void;
}

export class SceneManager implements ISceneManager {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  controls: OrbitControls;
  camera: THREE.PerspectiveCamera;

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public addRenderer(): this {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    return this;
  }

  public setPlan(size: number): this {
    const plan = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, 1),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    plan.position.z = -1;
    plan.name = 'plan';
    this.scene.add(plan);
    return this;
  }

  public addControls(): this {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    return this;
  }

  public addGrid(): this {
    const size = 25;
    const gridHelper = new THREE.GridHelper(size, size, '#ccc', '#333');
    gridHelper.rotation.x = 1.5708; //90deg
    gridHelper.position.z = -1;
    this.scene.add(gridHelper);
    return this;
  }

  public addCamera(): this {
    const params = [50, window.innerWidth / window.innerHeight, 0.1, 1000];
    this.camera = new THREE.PerspectiveCamera(...params);
    this.camera.position.z = 50;
    this.scene.add(this.camera);
    return this;
  }

  public addLights(): this {
    const light = new THREE.AmbientLight(0xffffff, 0.3);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(1, 1, 10);
    this.scene.add(pointLight);
    this.scene.add(light);
    return this;
  }

  public addQRCode(mesh: THREE.Mesh, size: number): this {
    this.scene.remove(this.scene.getObjectByName('qrcode'));
    this.scene.remove(this.scene.getObjectByName('plan'));
    this.scene.add(mesh);
    this.setPlan(size + 2);
    return this;
  }

  public init(canvas: HTMLCanvasElement): this {
    canvas.appendChild(this.renderer.domElement);
    this.setPlan(23);
    this.animate();
    return this;
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
