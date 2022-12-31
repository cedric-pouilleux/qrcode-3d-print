<template>
  <v-tweakpane
    class="tweakpane"
    :pane="{ title: 'Configurations' }"
    @on-pane-created="handlePaneCreated"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VTweakpane } from 'v-tweakpane';
import { object } from 'vue-types';

const props = defineProps({
  modelValue: object<Use3DQrcodeParams>().isRequired,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: Object): void;
  (e: 'stl-export'): void;
}>();

const state = computed({
  set(value) {
    emits('update:modelValue', value);
  },
  get() {
    return props.modelValue;
  },
});

function handlePaneCreated(pane: Pane): void {
  const qrcodePane = pane.addFolder({
    title: 'QR Code',
  });

  qrcodePane.addInput(state.value, 'maskPattern', {
    label: 'Mask pattern',
    min: 0,
    max: 9,
    step: 1,
  });

  qrcodePane.addInput(state.value, 'errorCorrectionLevel', {
    label: 'Correction',
    options: {
      Low: 'L',
      Medium: 'M',
      Quartile: 'Q',
      High: 'H',
    },
  });

  const exportPane = pane.addFolder({
    title: 'Pritn export',
  });

  exportPane.addInput(state.value, 'mergeGeometry', {
    label: 'Merge geometry',
  });

  exportPane
    .addButton({
      title: 'Extract STL File',
      label: 'STL',
    })
    .on('click', () => emits('stl-export'));

  const cloneArrayPane = pane.addFolder({
    title: 'Print duplication',
  });

  cloneArrayPane.addInput(state.value, 'isArray', {
    label: 'Duplicate',
  });

  const content = cloneArrayPane.addInput(state.value, 'content', {
    label: 'qrcode',
  });

  cloneArrayPane.addInput(state.value, 'meshArray', {
    label: 'Array by',
    options: {
      ['Per 4']: 4,
      ['Per 9']: 9,
      ['Per 16']: 16,
      ['Per 25']: 25,
    },
  });

  const goemetryPane = pane.addFolder({
    title: 'Visualisation',
  });

  goemetryPane.addInput(state.value, 'color', {
    label: 'Color',
    view: 'color',
  });

  goemetryPane.addInput(state.value, 'planColor', {
    label: 'Plan Color',
    view: 'color',
  });
}
</script>
