<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { integer, number, instanceOf, bool, array } from 'vue-types';
import { useGeometryBuilder } from '../composables/useGeometryBuilder';

const {
  gridHelper,
  generateMeshPlan,
  generateMeshQrcode,
  generateCamera,
  generateLight,
  generateBufferGeometry,
} = useGeometryBuilder();

const props = defineProps({
  qrcode: instanceOf(Uint8Array).isRequired,
  qrcodeSize: number().isRequired,
  meshsMerge: bool().def(true),
  planColor: number(),
  meshColor: number(),
});

const emits = defineEmits<{
  (e: 'edit-printable', value: Array<any>): void;
}>();

const canvas = ref(null);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = generateCamera(50);
const controls = new OrbitControls(camera, renderer.domElement);

scene.add(generateLight());
scene.add(camera);

onMounted(() => {
  canvas.value.appendChild(renderer.domElement);
  animate();
  refresh();
  window.addEventListener('resize', () => resize());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => resize());
});

function clearSceneMeshs() {
  scene.children.forEach((item) => {
    if (item.type === 'Mesh') {
      scene.remove(item);
    }
  });
}

const grid = computed(() => gridHelper(props.qrcodeSize));

function refresh(params: RefreshPayload): void {
  clearSceneMeshs();
  const exposePrintableMesh = [qrcode.value];
  scene.add(qrcode.value);
  scene.add(grid.value);
  if (!props.meshsMerge) {
    const plan = generateMeshPlan({
      size: props.qrcodeSize,
      color: props.planColor,
    });
    exposePrintableMesh.push(plan);
    scene.add(plan);
  }
  emits('edit-printable', exposePrintableMesh);
}

const qrcode = computed((): THREE.Mesh => {
  const buffer = generateBufferGeometry({
    qrcode: props.qrcode,
    size: props.qrcodeSize,
  });
  if (props.meshsMerge) {
    buffer.push(
      generateMeshPlan({
        size: props.qrcodeSize,
        color: props.planColor,
        geometryOnly: true,
      })
    );
  }
  return generateMeshQrcode({
    buffer,
    size: props.qrcodeSize,
    color: props.meshColor,
  });
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function resize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

watch(() => props, refresh, { deep: true });
</script>
