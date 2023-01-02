<template>
  <div class="app">
    <div class="header">
      <span class="gold"> 3D Print Qrcode generator </span>
    </div>

    <div class="flex">
      <view-scene
        ref="viewScene"
        :params="params"
        :qrcodes="parsedCodes"
        @edit-printable="printableObjects = $event"
      />
      <qrcodes-options
        class="a"
        v-model="params"
        v-model:display="display"
        @stl-export="handleExport"
      />
    </div>

    <div class="footer">
      <span> Mnz 2022 </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { use3DQrcode } from './composables/use3DQrcode';
import { useExports } from './composables/useExports';
import { appParams } from './params';
import { create, BitMatrix } from 'qrcode';
import QrcodesOptions from './components/QrcodesOptions.vue';
import ViewScene from './components/ViewScene.vue';
import { Qrcodes } from './types';
import { v4 as uuidv4 } from 'uuid';

const params = reactive(appParams);
const codes = ref(['printable']);
const display = ref('randomise');

const printableObjects = ref<Array<Mesh>>([]);

const viewScene = ref(null);

const randomise = computed((): Array<Qrcodes> => {
  const id = uuidv4();
  return new Array(params.qrcodeDisplay).fill(undefined).map((_) => {
    const id = uuidv4();
    const { modules } = create(id, {
      errorCorrectionLevel: params.errorCorrectionLevel,
      maskPattern: params.maskPattern,
    });
    return {
      content: uuidv4(),
      data: modules.data,
      size: modules.size,
    };
  });
});

const duplicate = computed((): Array<Qrcodes> => {
  const { modules } = create(params.content, {
    errorCorrectionLevel: params.errorCorrectionLevel,
    maskPattern: params.maskPattern,
  });
  return new Array(params.qrcodeDisplay).fill(undefined).map((_) => ({
    content: params.content,
    data: modules.data,
    size: modules.size,
  }));
});

const parsedCodes = computed((): Qrcodes => {
  switch (display.value) {
    case 'randomise':
      return randomise.value;
    case 'duplicate':
      if (!params.content) {
        return;
      }
      return duplicate.value;
    case 'manual':
  }
});

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

.footer {
  height: 30px;
  padding: 6px 18px;
  font-size: 0.8em;
  color: #fff;
  position: absolute;
  bottom: 0;
}

.header {
  padding: 18px;
  position: absolute;
}

.gold {
  color: orange;
}
</style>
