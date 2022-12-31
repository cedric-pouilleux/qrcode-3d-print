import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type GeneratePlanPayload = {
  size: number;
  color: number;
  geometryOnly: boolean;
};

type GenerateMeshQrcodePayload = {
  qrcode: Uint8Array;
  size: number;
  color: number;
};

type GenerateBufferGeometryPayload = {
  qrcode: Uint8Array;
  size: number;
};

interface IUseGeometry {
  generateGrid(): THREE.GridHelper;
  generatePlan(payload: GeneratePlanPayload): THREE.Mesh;
  generateQrcode(payload: GenerateMeshQrcodePayload): THREE.Mesh;
  generateCamera(startPosition: number): THREE.PerspectiveCamera;
  generateLight(): THREE.PointLight;
  generateBufferGeometry(
    payload: GenerateBufferGeometryPayload
  ): Array<THREE.BufferGeometry>;
}

export function useGeometryBuilder(): IUseGeometry {
  function generateGrid(): THREE.GridHelper {
    const gridHelper = new THREE.GridHelper(130, 50, '#ccc', '#333');
    gridHelper.rotation.x = 1.5708; //90deg
    gridHelper.position.z = -2;
    return gridHelper;
  }

  function generatePlan(
    payload: GeneratePlanPayload
  ): THREE.BoxGeometry | THREE.Mesh {
    const corrected = payload.size + 2;
    const plan = new THREE.Mesh(
      new THREE.BoxGeometry(corrected, corrected, 1),
      new THREE.MeshStandardMaterial({ color: payload.color })
    );
    plan.position.z = -1.5;
    plan.name = 'plan';
    return plan;
  }

  function generateQrcode(payload: GenerateMeshQrcodePayload): THREE.Mesh {
    const buffer = generateBufferGeometry({
      qrcode: payload.qrcode,
      size: payload.size,
    });
    const mesh = new THREE.Mesh(
      BufferGeometryUtils.mergeBufferGeometries(buffer),
      new THREE.MeshStandardMaterial({
        color: payload.color,
      })
    );
    mesh.position.set(0, 0, 0);
    mesh.name = 'qrcode';
    mesh.geometry.center();
    return mesh;
  }

  function generateLight(): THREE.PointLight {
    const pointLight = new THREE.PointLight(0xffffff, 15, 50);
    pointLight.position.set(1, 1, 10);
    return pointLight;
  }

  function generateCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.z = 1000;
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
    generateGrid,
    generatePlan,
    generateQrcode,
    generateCamera,
    generateLight,
    generateBufferGeometry,
  };
}
