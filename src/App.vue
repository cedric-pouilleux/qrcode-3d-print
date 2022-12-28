<template>
  <div class="app">
    <input
      type="text"
      :value="valueContent"
      @input="handleChange"
      placeholder="Write your qrcode string content"
    />
    <button @click="handleExport">Export .STL format for 3D print</button>
    <div id="canvas" ref="canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as exportSTL from 'threejs-export-stl';
import { use3DQrcode } from './composables/use3DQrcode';
import { SceneManager } from './classes/SceneManager';

const canvas = ref();
const valueContent = ref('QRCODE#TEXT');

const { mesh, size, content } = use3DQrcode(valueContent.value);
const scene = new SceneManager();

onMounted(() => {
  scene
    .addRenderer()
    .addGrid()
    .addCamera()
    .addControls()
    .addLights()
    .init(canvas.value)
    .addQRCode(mesh.value, size.value);
  window.addEventListener('resize', () => scene.resize());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', scene.resize);
});

function handleChange(event: Event) {
  content.value = event.target.value;
  scene.addQRCode(mesh.value, size.value);
}

async function handleExport() {
  const buffer = exportSTL.fromMesh(mesh.value);
  const blob = new Blob([buffer], { type: exportSTL.mimeType });
  alert(buffer);
}
</script>
