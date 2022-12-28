<template>
  <div class="app">
    {{ errorCorrectionLevel }}
    <v-tweakpane
      class="tweakpane"
      :pane="{ title: 'Configurations' }"
      @on-pane-created="handlePaneCreated"
    />
    <div class="bottom-actions">
      <button @click="handleExportSTL">Export .STL format</button>
      <button @click="handleExportGITF">Export .GITF format</button>
    </div>
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
import { VTweakpane } from 'v-tweakpane';

const canvas = ref();

const { mesh, size, content, errorCorrectionLevel } = use3DQrcode();
const scene = new SceneManager();

const params = reactive({
  content,
  errorCorrectionLevel,
});

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
  window.removeEventListener('resize', () => scene.resize());
});

watch(
  params,
  () => {
    scene.addQRCode(mesh.value, size.value);
  },
  { deep: true }
);

function handlePaneCreated(pane: Pane) {
  const qrcodePane = pane.addFolder({
    title: 'QR Code',
  });
  qrcodePane.addInput(params, 'content', { label: 'Value' });
  qrcodePane.addInput(params, 'errorCorrectionLevel', {
    label: 'Correction',
    options: {
      Low: 'L',
      Medium: 'M',
      Quartile: 'Q',
      High: 'H',
    },
  });
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

<style scoped>
.tweakpane {
  width: 300px;
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
