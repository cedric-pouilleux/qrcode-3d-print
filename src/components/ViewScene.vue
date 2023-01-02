<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { integer, number, instanceOf, bool, object } from 'vue-types';
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
  qrcodes: object<Qrcodes>(),
  params: object<any>(),
});

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

const grid = computed(() => generateGrid(props.qrcodes[0].size));

function prepareQrcodeGroup(qrcodes) {
  const group = new THREE.Group();
  let row = 0;
  let col = 0;
  const margin = 3;
  const count = qrcodes.length;
  for (let index = 0; index < count; index++) {
    const innerGroup = new THREE.Group();
    if (index) {
      if (index % Math.round(Math.sqrt(count)) === 0) {
        col++;
        row = 0;
      } else {
        row++;
      }
    }
    innerGroup.add(
      generateQrcode({
        qrcode: qrcodes[index].data,
        size: qrcodes[index].size,
        color: props.params.color,
      })
    );
    innerGroup.add(
      generatePlan({
        size: qrcodes[index].size,
        color: 0xffffff,
      })
    );
    innerGroup.position.x = col * (qrcodes[index].size + margin);
    innerGroup.position.y = row * (qrcodes[index].size + margin);
    group.add(innerGroup);
  }
  return group;
}

const generateQrcodes = computed((): THREE.Group => {
  const group = prepareQrcodeGroup(props.qrcodes);
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
  camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight);
}

watch(
  () => props,
  () => !!props.qrcodes?.length && refresh(),
  { deep: true }
);

defineExpose({
  scene,
});
</script>
