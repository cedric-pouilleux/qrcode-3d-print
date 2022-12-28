<template>
  <div class="app">
    <custom-params
      v-model="params"
      @update:modelValue="handleUpdate"
      @export="handleExport"
    />
    <div id="canvas" ref="canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, reactive } from 'vue';
import { use3DQrcode } from './composables/use3DQrcode';
import { useExports } from './composables/useExports';
import { SceneManager } from './classes/SceneManager';
import CustomParams from './components/CustomParams.vue';

const canvas = ref();
const { mesh, size, params } = use3DQrcode();
const { exportGeometry, exportPlan } = useExports(params.content);

const scene = new SceneManager();

function handleUpdate(value) {
  Object.assign(params, value);
  scene.refresh({
    mesh: mesh.value,
    size: size.value,
    merge: params.mergeGeometry,
  });
}

onMounted(() => {
  scene
    .addRenderer()
    .addGrid()
    .addCamera()
    .addControls()
    .addLights()
    .init(canvas.value)
    .refresh({
      mesh: mesh.value,
      size: size.value,
      merge: params.mergeGeometry,
    });
  window.addEventListener('resize', () => scene.resize());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => scene.resize());
});

function handleExport() {
  exportGeometry(mesh.value);
  if (!params.mergeGeometry) {
    exportPlan(scene.plan);
  }
}
</script>

<style scoped>
.tweakpane {
  width: 300px;
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
