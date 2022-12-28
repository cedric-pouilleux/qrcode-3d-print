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

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const state = computed({
  set(value) {
    console.log(value);
    emits('update:modelValue', value);
  },
  get() {
    return props.modelValue;
  },
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: Object): void;
  (e: 'edit');
  (e: 'exportSeperateStl');
  (e: 'exportMergeStl');
}>();

function handlePaneCreated(pane: Pane) {
  const qrcodePane = pane.addFolder({
    title: 'QR Code',
  });

  qrcodePane.on('change', () => {
    emits('edit');
  });

  qrcodePane.addInput(state.value, 'content', { label: 'Value' });

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
    title: 'Export',
  });

  const mergeGeometryBtn = exportPane.addButton({
    title: 'One geometry',
    label: 'STL',
  });
  const separateGeometryBtn = exportPane.addButton({
    title: 'Separate geometry',
    label: '',
  });

  mergeGeometryBtn.on('click', () => emits('exportMergeStl'));
  separateGeometryBtn.on('click', () => emits('exportSeperateStl'));
}
</script>
