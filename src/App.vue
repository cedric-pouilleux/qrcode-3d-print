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
import * as THREE from 'three';
import * as exportSTL from 'threejs-export-stl';
import { use3DQrcode } from './composables/use3DQrcode';
import { SceneManager } from './classes/SceneManager';
import { saveAs } from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import CustomParams from './components/CustomParams.vue';

const canvas = ref();
const { mesh, size, params } = use3DQrcode();
const scene = new SceneManager();

function handleUpdate(value) {
  console.log('update');
  Object.assign(params, value);
  scene.addQRCode(mesh.value, !params.mergeGeometry && size.value);
}

onMounted(() => {
  scene
    .addRenderer()
    .addGrid()
    .addCamera()
    .addControls()
    .addLights()
    .init(canvas.value)
    .addQRCode(mesh.value, !params.mergeGeometry && size.value);
  window.addEventListener('resize', () => scene.resize());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => scene.resize());
});

function mergeGeometrySTLExport() {
  try {
    const isFileSaverSupported = !!new Blob();
    const buffer = exportSTL.fromMesh(mesh.value);
    saveAs(
      new Blob([buffer], { type: exportSTL.mimeType }),
      `3D-print-${params.content.trim()}-qrcode.stl`
    );
  } catch (e) {
    console.error(e);
  }
}

function handleExport() {
  try {
    const isFileSaverSupported = !!new Blob();
    const buffer = exportSTL.fromMesh(mesh.value);
    saveAs(
      new Blob([buffer], { type: exportSTL.mimeType }),
      `3D-print-${params.content.trim()}-qrcode.stl`
    );
  } catch (e) {
    console.error(e);
  }
}

/**
 * TODO => Try fix export gltf
  function handleExportGITF() {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene.getScene(),
      (gltf) => {
        var file = new Blob([gltf], { type: 'text/plain' });
        saveAs(file, `3D-print-${params.content.trim()}-qrcode.gltf`);
      },
      (error) => {
        console.error('An error happened');
      }
    );
  }
**/
</script>

<style scoped>
.tweakpane {
  width: 300px;
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
