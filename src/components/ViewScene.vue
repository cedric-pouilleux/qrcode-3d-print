<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { integer, number, instanceOf, bool, array } from 'vue-types';
import { useGeometryBuilder } from '../composables/useGeometryBuilder';
import { Qrcodes } from './types';

const {
  generateGrid,
  generatePlan,
  generateQrcode,
  generateCamera,
  generateLight,
} = useGeometryBuilder();

const props = defineProps({
  qrcode: instanceOf(Uint8Array).isRequired,
  qrcodes: array<Qrcodes>(),
  qrcodeSize: number().isRequired,
  meshsMerge: bool().def(true),
  planColor: number(),
  meshColor: number(),
  meshArray: number().def(1),
  isArray: bool().def(false),
});

const emits = defineEmits<{
  (e: 'edit-printable', value: Array<any>): void;
}>();

const canvas = ref(null);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = generateCamera();
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0xcccccc);
const pointLight = generateLight();
scene.add(camera);

onMounted(() => {
  canvas.value.appendChild(renderer.domElement);
  animate();
  refresh();
  resize();
  window.addEventListener('resize', () => resize());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => resize());
});

function clearSceneMeshs() {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

const grid = computed(() => generateGrid(props.qrcodeSize));

function qrcode(qrcode: Qrcodes): THREE.Mesh {
  const mesh = generateQrcode({
    qrcode: qrcode.data,
    size: qrcode.size,
    color: props.meshColor,
  });
  return mesh;
}

function prepareQrcodeGroup(qrcodes, size) {
  const group = new THREE.Group();
  let row = 0;
  let col = 0;
  const margin = 3;
  const count = qrcodes.length;
  for (let index = 0; index < count; index++) {
    const innerGroup = new THREE.Group();
    if (index) {
      if (index % Math.sqrt(count) === 0) {
        col++;
        row = 0;
      } else {
        row++;
      }
    }
    innerGroup.add(qrcode(qrcodes[index]));
    innerGroup.add(
      generatePlan({
        size,
        color: 0xffffff,
      })
    );
    innerGroup.position.x = col * (size + margin);
    innerGroup.position.y = row * (size + margin);
    group.add(innerGroup);
  }
  return group;
}

const duplicateQrcodes = computed(() =>
  new Array(props.meshArray).fill(undefined).map((_) => props.qrcodes[0])
);

const generateQrcodes = computed((): THREE.Group => {
  const group = prepareQrcodeGroup(
    props.isArray ? duplicateQrcodes.value : props.qrcodes,
    props.qrcodeSize
  );
  const boundingBox = new THREE.Box3().setFromObject(group);
  group.position.sub(boundingBox.getCenter(new THREE.Vector3()));
  return group;
});

function refresh(params: RefreshPayload): void {
  clearSceneMeshs();
  generateScene();
  scene.add(generateQrcodes.value);
}

function generateScene(): void {
  scene.add(light);
  scene.add(grid.value);
  scene.add(pointLight);
}

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function resize(): void {
  console.log(canvas.value.clientHeight, canvas.value.clientWidth);
  camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight);
}

watch(() => props, refresh, { deep: true });

defineExpose({
  scene,
});
</script>
