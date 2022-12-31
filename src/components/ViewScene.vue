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
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer';

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

defineExpose({
  scene,
});

const renderer = new THREE.WebGLRenderer();
const camera = generateCamera(50);
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0xcccccc); // soft white light
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const labelDiv = document.createElement('div');
labelDiv.className = 'label';
labelDiv.style.marginTop = '-1em';
const label = new CSS2DObject(labelDiv);
labelRenderer.render(scene, camera);

const pointLight = generateLight();

renderer.setSize(window.innerWidth, window.innerHeight);
scene.add(camera);
scene.add(label);

onMounted(() => {
  canvas.value.appendChild(renderer.domElement);
  animate();
  refresh();
  scene.add(grid.value);
  window.addEventListener('resize', () => resize());
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => resize());
});

function clearSceneMeshs() {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

const grid = computed(() => gridHelper(props.qrcodeSize));

function qrcode(): THREE.Mesh {
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
  const mesh = generateMeshQrcode({
    buffer,
    size: props.qrcodeSize,
    color: props.meshColor,
  });
  mesh.name = 'qrcode';
  mesh.geometry.center();
  return mesh;
}

function qrcodes(selectedQrcode): THREE.Mesh {
  const buffer = generateBufferGeometry({
    qrcode: selectedQrcode.data,
    size: selectedQrcode.size,
  });
  if (props.meshsMerge) {
    buffer.push(
      generateMeshPlan({
        size: selectedQrcode.size,
        color: props.planColor,
        geometryOnly: true,
      })
    );
  }
  const mesh = generateMeshQrcode({
    buffer,
    size: selectedQrcode.size,
    color: props.meshColor,
  });
  mesh.geometry.center();
  return mesh;
}

function generateGroupOfQrcode() {
  let row = 0;
  let col = 0;
  const group = new THREE.Group();
  const margin = 3;
  const rowCount = Math.round(Math.sqrt(props.meshArray));
  for (let index = 0; index < props.meshArray; index++) {
    const innerGroup = new THREE.Group();
    if (index) {
      if (index % rowCount === 0) {
        col++;
        row = 0;
      } else {
        row++;
      }
    }
    const added = qrcode();
    innerGroup.add(added);
    if (!props.meshsMerge) {
      const plan = generateMeshPlan({
        size: props.qrcodeSize,
        color: props.planColor,
      });
      innerGroup.add(plan);
    }
    innerGroup.position.x = col * (props.qrcodeSize + margin);
    innerGroup.position.y = row * (props.qrcodeSize + margin);
    group.add(innerGroup);
  }
  const boundingBox = new THREE.Box3().setFromObject(group);
  group.position.sub(boundingBox.getCenter(new THREE.Vector3()));
  return group;
}

function generateGroupOfQrcodes() {
  let row = 0;
  let col = 0;
  const group = new THREE.Group();
  const margin = 3;
  const rowCount = Math.round(Math.sqrt(props.qrcodes.length));
  for (let index = 0; index < props.qrcodes.length; index++) {
    const innerGroup = new THREE.Group();
    if (index) {
      if (index % rowCount === 0) {
        col++;
        row = 0;
      } else {
        row++;
      }
    }
    const added = qrcodes(props.qrcodes[index]);
    innerGroup.add(added);
    if (!props.meshsMerge) {
      const plan = generateMeshPlan({
        size: props.qrcodeSize,
        color: props.planColor,
      });
      //exposePrintableMesh.push(plan);
      innerGroup.add(plan);
    }
    innerGroup.position.x = col * (props.qrcodeSize + margin);
    innerGroup.position.y = row * (props.qrcodeSize + margin);
    group.add(innerGroup);
  }

  const boundingBox = new THREE.Box3().setFromObject(group);
  group.position.sub(boundingBox.getCenter(new THREE.Vector3()));
  return group;
}

/**
 * Refresh actions
 **/
function refresh(params: RefreshPayload): void {
  clearSceneMeshs();
  generateScene();

  if (props.isArray) {
    const group = generateGroupOfQrcode();
    scene.add(group);
  } else if (props.qrcodes) {
    const group = generateGroupOfQrcodes();
    scene.add(group);
  } else {
    const added = qrcode();
    if (!props.meshsMerge) {
      scene.add(
        generateMeshPlan({
          size: props.qrcodeSize,
          color: props.planColor,
        })
      );
    }
    scene.add(added);
  }
}

function generateScene() {
  scene.add(light);
  scene.add(grid.value);
  scene.add(pointLight);
}

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  raycaster.setFromCamera(mouse, camera);
  const [hovered] = raycaster.intersectObjects(scene.children);
  if (hovered) {
    renderer.domElement.className = 'hovered';
    label.visible = true;
    labelDiv.textContent = hovered.object.id;
    const offset = new THREE.Vector3();
    new THREE.Box3().setFromObject(hovered.object).getSize(offset);
    label.position.set(
      hovered.object.position.x,
      offset.y / 2,
      hovered.object.position.x
    );
  } else {
    renderer.domElement.className = '';
    label.visible = false;
    labelDiv.textContent = '';
  }

  renderer.render(scene, camera);
}

function resize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

watch(() => props, refresh, { deep: true });
</script>
