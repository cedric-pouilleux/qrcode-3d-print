<template>
  <v-tweakpane
    class="tweakpane"
    :pane="{ title: 'Select Qrcodes' }"
    @on-pane-created="handlePaneCreated"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { VTweakpane } from 'v-tweakpane';
import { array } from 'vue-types';

const props = defineProps({
  modelValue: array<any>().isRequired,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: array<any>): void;
}>();

const state = computed({
  set(value) {
    emits('update:modelValue', value);
  },
  get() {
    return props.modelValue;
  },
});

let pane: Pane;

function refresh() {
  state.value.forEach((item, index) => {
    pane.addInput(state.value, index, {
      label: `qrcode #${index}`,
    });
  });
}

function handlePaneCreated(pPane: Pane): void {
  pane = pPane;
  refresh();
  const newQrcodeBtn = pane
    .addButton({
      title: 'Add',
      label: 'Add QRcode',
    })
    .on('click', () => {
      state.value.push('New qrcodee');
    });
}
</script>

<style scoped>
.tweakpane {
  left: 8px;
}
</style>
