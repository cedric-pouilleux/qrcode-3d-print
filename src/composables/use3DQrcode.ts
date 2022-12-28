import { computed, ComputedRef, reactive } from 'vue';
import {
  create,
  BitMatrix,
  QRCodeErrorCorrectionLevel,
  QRCodeMaskPattern,
} from 'qrcode';
import { BufferGeometry, BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Use3DQrcodeParams {
  content: string;
  errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  maskPattern: QRCodeMaskPattern;
  mergeGeometry: boolean;
}

interface IUse3DQrcode {
  mesh: ComputedRef<Mesh>;
  size: ComputedRef<number>;
  params: Use3DQrcodeParams;
}

export function use3DQrcode(): IUse3DQrcode {
  const params = reactive<Use3DQrcodeParams>({
    content: 'Start writing',
    errorCorrectionLevel: 'M',
    maskPattern: 0,
    mergeGeometry: true,
  });

  const getContent = computed(
    (): BitMatrix =>
      create(params.content, {
        errorCorrectionLevel: params.errorCorrectionLevel,
        maskPattern: params.maskPattern,
      }).modules
  );
  const size = computed((): number => getContent.value.size);

  const generatePlan = computed((): BoxGeometry => {
    const plan = new BoxGeometry(
      getContent.value.size + 2,
      getContent.value.size + 2,
      1
    );
    plan.translate(
      Math.round(getContent.value.size / 2) - 1,
      Math.round(getContent.value.size / 2) - 1,
      -2
    );
    return plan;
  });

  const geometryArray = computed((): Array<BufferGeometry> => {
    const bufferGeometryArray: BufferGeometry[] = [];
    if (params.mergeGeometry) {
      bufferGeometryArray.push(generatePlan.value);
    }
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
        const box = new BoxGeometry(1, 1, 3);
        box.translate(col, row, 0);
        bufferGeometryArray.push(box);
      }
    });
    return bufferGeometryArray;
  });

  function conbinateMesh(): Mesh {
    return new Mesh(
      BufferGeometryUtils.mergeBufferGeometries(geometryArray.value),
      new MeshStandardMaterial({ color: 0xffffff })
    );
  }

  const mesh = computed((): Mesh => {
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
