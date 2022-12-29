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

const emits = defineEmits<{
  (e: 'update:modelValue', value: Object): void;
  (e: 'edit'): void;
  (e: 'exportSeperateStl'): void;
  (e: 'exportMergeStl'): void;
}>();

const state = computed({
  set(value) {
    emits('update:modelValue', value);
  },
  get() {
    return props.modelValue;
  },
});

function handlePaneCreated(pane: Pane) {
  pane.on('change', () => {
    console.log('t');
    emits('update:modelValue', state.value);
  });

  const qrcodePane = pane.addFolder({
    title: 'QR Code',
  });

  const content = qrcodePane.addInput(state.value, 'content', {
    label: 'Value',
  });

  content.element.addEventListener('input', (event: Event) => {
    state.value = { ...state.value, content: event.target.value };
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
    title: 'Export',
  });

  exportPane
    .addInput(state.value, 'mergeGeometry', {
      label: 'Merge geometry',
    })
    .on('change', () => {
      emits('update:modelValue', state.value);
    });

  exportPane
    .addButton({
      title: 'Extract STL File',
      label: 'STL',
    })
    .on('click', () => emits('export'));

  const goemetryPane = pane.addFolder({
    title: 'Geometry',
  });

  goemetryPane.addInput(state.value, 'color', {
    label: 'Color',
    view: 'color',
  });

  goemetryPane.addInput(state.value, 'planColor', {
    label: 'Plan Color',
    view: 'color',
  });

  /**
  goemetryPane.addInput(state.value, 'height', {
    label: 'Mask pattern',
    min: 3,
    max: 40,
    step: 1,
  });**/
}
</script>
