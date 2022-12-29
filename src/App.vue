<template>
  <div class="app">
    <custom-params
      v-model="params"
      @update:modelValue="handleUpdateParams"
      @stl-export="handleExport"
    />
    <view-scene
      :qrcode="generatedQrcode.data"
      :qrcode-size="generatedQrcode.size"
      :plan-color="params.planColor"
      :mesh-color="params.color"
      :meshs-merge="params.mergeGeometry"
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
import ViewScene from './components/ViewScene.vue';

const params = reactive(appParams);

const printableObjects = ref<Array<Mesh>>([]);

const generatedQrcode = computed(
  (): BitMatrix =>
    create(params.content, {
      errorCorrectionLevel: params.errorCorrectionLevel,
      maskPattern: params.maskPattern,
    }).modules
);

const { exportGeometry, exportPlan } = useExports(params.content);

function handleExport() {
  const qrcodeMesh = printableObjects.value[0];
  exportGeometry(qrcodeMesh);
  if (!params.mergeGeometry) {
    const planMesh = printableObjects.value[1];
    exportPlan(planMesh);
  }
}

function handleUpdateParams(event: Use3DQrcodeParams) {
  Object.assign(params, event);
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
