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
    if (!params.mergeGeometry) {
      const planBuffer = exportSTL.fromMesh(scene.plan);
      saveAs(
        new Blob([planBuffer], { type: exportSTL.mimeType }),
        `3D-print-${params.content.trim()}-qrcode-socle.stl`
      );
    }
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
