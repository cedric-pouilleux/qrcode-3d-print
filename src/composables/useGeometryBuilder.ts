import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type GenerateMeshPlanPayload = {
  size: number;
  color: number;
  geometryOnly: boolean;
};

type GenerateMeshQrcodePayload = {
  buffer: THREE.BufferGeometry;
  size: number;
  color: number;
};

type GenerateBufferGeometryPayload = {
  qrcode: Uint8Array;
  size: number;
};

interface IUseGeometry {
  gridHelper(size: number): THREE.GridHelper;
  generateMeshPlan(payload: GenerateMeshPlanPayload): THREE.Mesh;
  generateMeshQrcode(payload: GenerateMeshQrcodePayload): THREE.Mesh;
  generateCamera(startPosition: number): THREE.PerspectiveCamera;
  generateLight(): THREE.PointLight;
  generateBufferGeometry(
    payload: GenerateBufferGeometryPayload
  ): Array<THREE.BufferGeometry>;
}

export function useGeometryBuilder(): IUseGeometry {
  function gridHelper(size: number): THREE.GridHelper {
    const gridHelper = new THREE.GridHelper(size + 5, size + 5, '#ccc', '#333');
    gridHelper.rotation.x = 1.5708; //90deg
    gridHelper.position.z = -2;
    return gridHelper;
  }

  function generateMeshPlan(
    payload: GenerateMeshPlanPayload
  ): THREE.BoxGeometry | THREE.Mesh {
    let plan: THREE.BoxGeometry | THREE.Mesh;
    const corrected = payload.size + 2;
    if (payload.geometryOnly) {
      plan = new THREE.BoxGeometry(corrected, corrected, 1);
      const rounded = Math.round(payload.size / 2);
      plan.translate(rounded - 1, rounded - 1, -1.5);
    } else {
      plan = new THREE.Mesh(
        new THREE.BoxGeometry(corrected, corrected, 1),
        new THREE.MeshStandardMaterial({ color: payload.color })
      );
      plan.position.z = -1.5;
    }
    plan.name = 'plan';
    return plan;
  }

  function generateMeshQrcode(payload: GenerateMeshQrcodePayload): THREE.Mesh {
    const mesh = new THREE.Mesh(
      BufferGeometryUtils.mergeBufferGeometries(payload.buffer),
      new THREE.MeshStandardMaterial({
        color: payload.color,
      })
    );
    const positions = Math.round(-payload.size / 2);
    mesh.position.set(positions, positions, 0);
    mesh.name = 'qrcode';
    return mesh;
  }

  function generateLight(): THREE.PointLight {
    const pointLight = new THREE.PointLight(0xffffff, 15, 50);
    pointLight.position.set(1, 1, 10);
    return pointLight;
  }

  function generateCamera(startPosition: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = startPosition;
    return camera;
  }

  function generateCube(col: number, row: number): THREE.BoxGeometry {
    const box = new THREE.BoxGeometry(1, 1, 3);
    box.translate(col, row, 0);
    return box;
  }

  function generateBufferGeometry(
    payload: GenerateBufferGeometryPayload
  ): Array<THREE.BufferGeometry> {
    const bufferGeometryArray: THREE.BufferGeometry[] = [];
    let row = 0;
    let col = 0;
    payload.qrcode.forEach((item: number | boolean, index: number) => {
      if (index) {
        if (index % payload.size === 0) {
          col++;
          row = 0;
        } else {
          row++;
        }
      }
      item && bufferGeometryArray.push(generateCube(col, row));
    });
    return bufferGeometryArray;
  }

  return {
    gridHelper,
    generateMeshPlan,
    generateMeshQrcode,
    generateCamera,
    generateLight,
    generateBufferGeometry,
  };
}
