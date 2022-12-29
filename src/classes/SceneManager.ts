import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Mesh,
  PCFSoftShadowMap,
  BoxGeometry,
  MeshStandardMaterial,
  GridHelper,
  PointLight,
  AmbientLight,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ISceneManager {
  addRenderer(): void;
  addPlan(size: number): void;
  addControls(): void;
  addCamera(): void;
  addLights(): void;
  addGrid(): void;
  refresh(mesh: Mesh, size: number): void;
  resize(): void;
  getScene(): Scene;
  init(canvas: HTMLCanvasElement): void;
}

interface RefreshPayload {
  mesh: Mesh;
  size: number;
  merge: boolean;
  planColor: number;
}

export class SceneManager implements ISceneManager {
  scene = new Scene();
  renderer = new WebGLRenderer();
  controls: OrbitControls;
  camera: PerspectiveCamera;
  gridHelper: GridHelper;
  plan: Mesh;

  public getScene(): Scene {
    return this.scene;
  }

  public addRenderer(): this {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    return this;
  }

  public addPlan(size: number, color: number = 0x333333): this {
    this.plan = new Mesh(
      new BoxGeometry(size + 2, size + 2, 1),
      new MeshStandardMaterial({ color })
    );
    this.plan.castShadow = true;
    this.plan.receiveShadow = true;
    this.plan.position.z = -1.5;
    this.plan.name = 'plan';
    this.scene.add(this.plan);
    return this;
  }

  public addControls(): this {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    return this;
  }

  public addGrid(size: number = 25): this {
    this.gridHelper = new GridHelper(size + 5, size + 5, '#ccc', '#333');
    this.gridHelper.rotation.x = 1.5708; //90deg
    this.gridHelper.position.z = -2;
    this.gridHelper.name = 'grid';
    this.scene.add(this.gridHelper);
    return this;
  }

  public addCamera(): this {
    const params = [50, window.innerWidth / window.innerHeight, 0.1, 1000];
    this.camera = new PerspectiveCamera(...params);
    this.camera.position.z = 50;
    this.scene.add(this.camera);
    return this;
  }

  public addLights(): this {
    const light = new AmbientLight(0xffffff, 0.3);
    const pointLight = new PointLight(0xffffff, 15, 50);
    pointLight.position.set(1, 1, 10);
    this.scene.add(pointLight);
    this.scene.add(light);
    return this;
  }

  private clearAll(): void {
    this.scene.remove(this.scene.getObjectByName('qrcode'));
    this.scene.remove(this.scene.getObjectByName('plan'));
    this.scene.remove(this.scene.getObjectByName('grid'));
  }

  public refresh(params: RefreshPayload): this {
    this.clearAll();
    this.scene.add(params.mesh);
    this.addGrid(params.size);
    if (!params.merge) {
      this.addPlan(params.size as number, params.planColor);
    }
    return this;
  }

  public init(canvas: HTMLCanvasElement): this {
    canvas.appendChild(this.renderer.domElement);
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
