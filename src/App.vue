<template>
  <div class="app">
    <custom-params v-model="params" @stl-export="handleExport" />
    <qrcodes-options v-model="codes" />
    <view-scene
      ref="viewScene"
      :qrcode="generatedQrcode.data"
      :qrcodes="parsedCodes"
      :qrcode-size="generatedQrcode.size"
      :plan-color="params.planColor"
      :mesh-color="params.color"
      :meshs-merge="params.mergeGeometry"
      :mesh-array="params.meshArray"
      :is-array="params.isArray"
      @edit-printable="printableObjects = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { use3DQrcode } from './composables/use3DQrcode';
import { useExports } from './composables/useExports';
import { appParams } from './params';
import { create, BitMatrix } from 'qrcode';
import CustomParams from './components/CustomParams.vue';
import QrcodesOptions from './components/QrcodesOptions.vue';
import ViewScene from './components/ViewScene.vue';
import { Qrcodes } from './types';

import * as exportSTL from 'threejs-export-stl';

const params = reactive(appParams);

//@TODO
const codes = ref([
  'printable',
  'ViewScene',
  'Customsd',
  'nexestes',
  'tchuslol',
]);

const printableObjects = ref<Array<Mesh>>([]);

const viewScene = ref(null);

const parsedCodes = computed((): Qrcodes => {
  return codes.value.map((code: string) => {
    const { modules } = create(code, {
      errorCorrectionLevel: params.errorCorrectionLevel,
      maskPattern: params.maskPattern,
    });
    return {
      content: code,
      data: modules.data,
      size: modules.size,
    };
  });
});

const generatedQrcode = computed(
  (): BitMatrix =>
    create(params.content, {
      errorCorrectionLevel: params.errorCorrectionLevel,
      maskPattern: params.maskPattern,
    }).modules
);

const { exportGeometries } = useExports(params.content);

function handleExport() {
  exportGeometries(viewScene.value.scene, params.merge);

  /**

  const qrcodeMesh = printableObjects.value[0];
  exportGeometry(qrcodeMesh);
  if (!params.mergeGeometry) {
    const planMesh = printableObjects.value[1];
    exportPlan(planMesh);
  }**/
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
