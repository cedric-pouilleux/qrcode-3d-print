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
  generateBufferGeometry,
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
const camera = generateCamera(50);
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0xcccccc);
const pointLight = generateLight();
renderer.setSize(window.innerWidth, window.innerHeight);
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
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

const grid = computed(() => generateGrid(props.qrcodeSize));

function qrcode(qrcode: Qrcodes): THREE.Mesh {
  const buffer = generateBufferGeometry({
    qrcode: qrcode.data,
    size: qrcode.size,
  });
  const mesh = generateQrcode({
    buffer,
    size: qrcode.size,
    color: props.meshColor,
  });
  mesh.geometry.center();
  return mesh;
}

function prepareQrcodeGroup(qrcodes) {
  const group = new THREE.Group();
  let row = 0;
  let col = 0;
  const margin = 3;
  const count = qrcodes.length;
  const rowCount = Math.round(Math.sqrt(count));
  for (let index = 0; index < count; index++) {
    const innerGroup = new THREE.Group();
    if (index) {
      if (index % rowCount === 0) {
        col++;
        row = 0;
      } else {
        row++;
      }
    }
    innerGroup.add(qrcode(qrcodes[index]));
    innerGroup.add(
      generatePlan({
        size: props.qrcodeSize,
        color: 0xffffff,
      })
    );
    innerGroup.position.x = col * (props.qrcodeSize + margin);
    innerGroup.position.y = row * (props.qrcodeSize + margin);
    group.add(innerGroup);
  }
  return group;
}

const duplicateQrcodes = computed(() =>
  new Array(props.meshArray).fill(undefined).map((_) => props.qrcodes[0])
);

function generateQrcodes() {
  const group = prepareQrcodeGroup(
    props.isArray ? duplicateQrcodes.value : props.qrcodes
  );
  const boundingBox = new THREE.Box3().setFromObject(group);
  group.position.sub(boundingBox.getCenter(new THREE.Vector3()));
  return group;
}

function refresh(params: RefreshPayload): void {
  clearSceneMeshs();
  generateScene();
  scene.add(generateQrcodes());
}

function generateScene() {
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

watch(() => props, refresh, { deep: true });

defineExpose({
  scene,
});
</script>
