<template>
  <div class="qrcode-panel">
    <h2>3D Print QR Code</h2>
    <div class="menu">
      <button
        :class="{ active: currentTab === 'randomise' }"
        @click="currentTab = 'randomise'"
      >
        Randomise
      </button>
      <button
        :class="{ active: currentTab === 'duplicate' }"
        @click="currentTab = 'duplicate'"
      >
        Duplicate
      </button>
      <button
        :class="{ active: currentTab === 'manual' }"
        @click="currentTab = 'manual'"
      >
        Manual
      </button>
    </div>
    <div class="randomise" v-if="currentTab === 'randomise'">
      <div class="label">Qrcode count</div>
      <input type="text" class="count" placeholder="1" value="1" />
    </div>
    <div class="randomise" v-if="currentTab === 'duplicate'">
      <input
        type="text"
        placeholder="Enter your qrcode"
        v-model="state.content"
      />
      <input
        type="text"
        class="count"
        placeholder="1"
        v-model.number="state.meshArray"
      />
    </div>
    <div class="randomise" v-if="currentTab === 'manual'">
      <div class="label">#1</div>
      <input type="text" placeholder="Enter your qrcode" />
      <div class="icon">
        <button>x</button>
      </div>
    </div>

    <div class="separator"></div>

    <section class="options-section">
      <h3>Qrcodes options</h3>
      <div class="randomise">
        <div class="label-sized">Mask pattern</div>
        <slider
          v-model="state.maskPattern"
          color="#000"
          width="100%"
          :max="9"
          :min="0"
          alwaysShowHandle
          track-color="#222"
          :tooltip="true"
        />
      </div>
      <div class="randomise">
        <div class="label-sized">Correction</div>
        <select v-model="state.errorCorrectionLevel">
          <option value="L">Low</option>
          <option value="M">Medium</option>
          <option value="Q">Quartile</option>
          <option value="H">High</option>
        </select>
      </div>
    </section>

    <section class="options-section">
      <h3>Export options</h3>
      <div class="randomise">
        <div class="label-sized">Export separate geometry</div>
        <div>
          <Toggle
            v-model="state.mergeGeometry"
            on-label="Yes"
            off-label="No"
            class="toggle-grey"
          />
        </div>
      </div>
    </section>

    <div class="separator"></div>

    <div class="actions">
      <button>Export STL file</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { VTweakpane } from 'v-tweakpane';
import { object } from 'vue-types';
import slider from 'vue3-slider';
import Toggle from '@vueform/toggle';

const props = defineProps({
  modelValue: object<any>().isRequired,
});

const currentTab = ref('randomise');

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
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped>
select {
  color: #fff;
  background-color: #000;
  padding: 6px;
  border-radius: 4px;
  border: 0;
  width: 100%;
}

.toggle-grey {
  --toggle-bg-on: #666;
  --toggle-border-on: #777;
}

h3 {
  font-size: 0.7em;
  color: #777;
  font-weight: 400;
}

.actions {
  display: flex;
}

.actions button {
  width: 100%;
  background-color: #333;
  color: #fff;
  border: 0;
  font-weight: 700;
  height: 60px;
}
.flex {
  display: flex;
}

.count {
  width: 30px;
}

.separator {
  height: 2px;
  background-color: #222;
  margin: 20px 0;
}

input {
  color: #fff;
  background-color: #000;
  padding: 6px;
  border-radius: 4px;
  border: 0;
}

button {
  height: auto;
}

.menu {
  display: flex;
  border-bottom: 1px solid #555;
  height: 36px;
  margin-bottom: 12px;
}

.menu button {
  order: 1;
  font-size: 0.8em;
  background-color: #333;
  color: #fff;
  border: 0;
  border: 1;
  flex-grow: 1;
}

input {
  max-width: 100%;
}
.menu button:hover,
.menu button.active {
  background-color: #555;
}

.randomise {
  display: flex;
  align-items: center;
  font-size: 0.8em;
  background-color: #333;
  margin: 8px 0;
  column-gap: 10px;
  justify-content: space-between;
}

.randomise .label-sized {
  width: 200px;
}

.randomise button {
  background-color: #444;
  border-radius: 4px;
  font-size: 0.7em;
  color: #fff;
  border: 0;
}
.randomise input {
  flex-grow: 1;
}

.qrcode-panel {
  height: 100vh;
  background-color: #333;
  width: 300px;
  color: #fff;
  padding: 10px;
}
</style>
