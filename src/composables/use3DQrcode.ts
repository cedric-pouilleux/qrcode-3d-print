import { computed, ref, Ref, ComputedRef, reactive } from 'vue';
import {
  create,
  BitMatrix,
  QRCodeErrorCorrectionLevel,
  QRCodeMaskPattern,
} from 'qrcode';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Use3DQrcodeParams {
  content: string;
  errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  maskPattern: QRCodeMaskPattern;
}

interface IUse3DQrcode {
  mesh: ComputedRef<THREE.Mesh>;
  size: ComputedRef<number>;
  params: Use3DQrcodeParams;
}

export function use3DQrcode(): IUse3DQrcode {
  const params = reactive<Use3DQrcodeParams>({
    content: 'Start writing',
    errorCorrectionLevel: 'M',
    maskPattern: 0,
  });

  const getContent = computed(
    (): BitMatrix =>
      create(params.content, {
        errorCorrectionLevel: params.errorCorrectionLevel,
        maskPattern: params.maskPattern,
      }).modules
  );
  const size = computed((): number => getContent.value.size);

  const geometryArray = computed((): Array<THREE.BufferGeometry> => {
    const bufferGeometryArray: THREE.BufferGeometry[] = [];
    let row = 0;
    let col = 0;
    getContent.value.data.forEach((item: number | boolean, index: number) => {
      if (index) {
        if (index % getContent.value.size === 0) {
          col++;
          row = 0;
        } else {
          row++;
        }
      }
      if (item) {
        const box = new THREE.BoxGeometry(1, 1, 3);
        box.translate(col, row, 0);
        bufferGeometryArray.push(box);
      }
    });
    return bufferGeometryArray;
  });

  function conbinateMesh(): THREE.Mesh {
    return new THREE.Mesh(
      BufferGeometryUtils.mergeBufferGeometries(geometryArray.value),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
  }

  const mesh = computed((): THREE.Mesh => {
    const mesh = conbinateMesh();
    const positions = Math.round(-getContent.value.size / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(positions, positions, 1);
    mesh.name = 'qrcode';
    return mesh;
  });

  return {
    mesh,
    params,
    size,
  };
}
