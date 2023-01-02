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
        v-model:codes="codes"
        v-model:display="display"
        @stl-export="handleExport"
        @remove="handleRemoveManual"
        @add="handleAddManual"
      />
    </div>

    <div class="footer">
      Mnz 2022 <CopyLeft /><a
        href="https://github.com/cedric-pouilleux/qrcode-3d-print"
        ><Github
      /></a>
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
import CopyLeft from '~icons/mdi/copyleft';
import Github from '~icons/mdi/github';

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

const manual = computed((): Array<Qrcodes> => {
  const { modules } = create(params.content, {
    errorCorrectionLevel: params.errorCorrectionLevel,
    maskPattern: params.maskPattern,
  });
  return codes.value.map((item) => {
    const { modules } = create(item, {
      errorCorrectionLevel: params.errorCorrectionLevel,
      maskPattern: params.maskPattern,
    });
    return {
      content: item,
      data: modules.data,
      size: modules.size,
    };
  });
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
      return manual.value;
  }
});

function handleRemoveManual(id: number) {
  codes.value.splice(id, 1);
}

function handleAddManual(value: string) {
  codes.value.push(value);
}

function handleExport() {
  const { exportGeometries } = useExports(params.content);
  exportGeometries(viewScene.value.scene, params.merge);
}
</script>

<style scoped lang="scss">
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
  display: flex;
  padding: 6px 18px;
  font-size: 0.8em;
  align-items: center;
  color: #fff;
  position: absolute;
  bottom: 0;
  a {
    display: flex;
  }
}

.header {
  padding: 18px;
  position: absolute;
}

.gold {
  color: orange;
}
</style>
