import { computed, ref, Ref, ComputedRef } from 'vue';
import { create } from 'qrcode';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface IUse3DQrcode {
  mesh: ComputedRef<THREE.Mesh>;
  size: ComputedRef<number>;
  content: Ref<string>;
}

export function use3DQrcode(text: string): IUse3DQrcode {
  const content = ref(text);

  const getContent = computed(() => create(content.value).modules);
  const size = computed((): number => getContent.value.size);

  const geometryArray = computed((): Array<THREE.BufferGeometry> => {
    const bufferGeometryArray: THREE.BufferGeometry[] = [];
    let row = 0;
    let col = 0;
    getContent.value.data.forEach((item: boolean, index: number) => {
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
    content,
    size,
  };
}
