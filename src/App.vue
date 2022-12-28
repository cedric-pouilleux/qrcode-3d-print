<template>
  <div class="app">
    <input
      type="text"
      :value="valueContent"
      @input="handleChange"
      placeholder="Write your qrcode string content"
    />
    <div class="bottom-actions">
      <button @click="handleExportSTL">Export .STL format</button>
      <button @click="handleExportGITF">Export .GITF format</button>
    </div>
    <div id="canvas" ref="canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import * as exportSTL from 'threejs-export-stl';
import { use3DQrcode } from './composables/use3DQrcode';
import { SceneManager } from './classes/SceneManager';
import { saveAs } from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

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

function handleExportSTL() {
  try {
    const isFileSaverSupported = !!new Blob();
    //HERE = Add plan export with second stl
    const buffer = exportSTL.fromMesh(mesh.value);
    saveAs(
      new Blob([buffer], { type: exportSTL.mimeType }),
      `3D-print-${valueContent.value.trim()}-qrcode.stl`
    );
  } catch (e) {
    console.error(e);
  }
}

function handleExportGITF() {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene.getScene(),
    (gltf) => {
      //TODO => Try fix export gltf
      var file = new Blob([gltf], { type: 'text/plain' });
      saveAs(file, `3D-print-${valueContent.value.trim()}-qrcode.gltf`);
    },
    (error) => {
      console.error('An error happened');
    }
  );
}
</script>
