<template>
  <div class="app">
    <custom-params v-model="params" @stl-export="handleExport" />
    <div class="flex">
      <qrcodes-options class="a" v-model="params" />
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

const params = reactive(appParams);

//@TODO
const codes = ref(['printable']);

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

function handleExport() {
  const { exportGeometries } = useExports(params.content);
  exportGeometries(viewScene.value.scene, params.merge);
}
</script>

<style scoped>
.tweakpane {
  width: 250px;
  position: absolute;
  top: 10px;
  right: 10px;
}

.a {
  max-width: 290px;
  min-width: 290px;
  display: block;
}
.flex {
  display: flex;
}
.flex * {
  width: 100%;
}
</style>
