<template>
  <div class="qrcode-panel">
    <div class="menu">
      <button :class="{ active: isRandomise }" @click="tab = 'randomise'">
        <ShuffleVariant /> Randomise
      </button>
      <button :class="{ active: isDuplicate }" @click="tab = 'duplicate'">
        <mdiContentCopy /> Duplicate
      </button>
      <button :class="{ active: isManual }" @click="tab = 'manual'">
        Manual
      </button>
    </div>

    <div class="separator"></div>
    <p class="infos">Make random qrcodes based on UUID</p>
    <div class="randomise" v-if="isRandomise">
      <div class="label-sized">Qrcode count</div>
      <input
        type="number"
        class="count"
        placeholder="Number"
        :min="0"
        :max="25"
        v-model.number="modelValue.qrcodeDisplay"
      />
    </div>

    <div class="randomise" v-if="isDuplicate">
      <input
        type="text"
        placeholder="Enter your qrcode"
        v-model="modelValue.content"
      />
      <input
        type="text"
        class="count"
        placeholder="Number"
        :min="0"
        :max="25"
        v-model.number="modelValue.qrcodeDisplay"
      />
    </div>

    <div class="inner" v-if="isManual">
      <div v-for="(code, index) in props.codes" class="randomise">
        <input
          type="text"
          placeholder="Enter your qrcode"
          v-model="props.codes[index]"
        />
        <div class="icon">
          <button @click="emits('remove', index)">
            <CloseThick style="font-size: 1.6em" />
          </button>
        </div>
      </div>
      <button class="add-qrcode" @click="emits('add', 'test')">
        <PlusThick /> Add Qrcode
      </button>
    </div>

    <div class="separator"></div>

    <section class="options-section">
      <h3 @click="qrcodesOpen = !qrcodesOpen">
        Qrcodes options
        <ChevronUp style="font-size: 1.8em" v-if="qrcodesOpen" /><ChevronDown
          style="font-size: 1.8em"
          v-else
        />
      </h3>
      <div class="inner" v-if="qrcodesOpen">
        <div class="randomise">
          <div class="label-sized">Mask pattern</div>
          <slider
            v-model="modelValue.maskPattern"
            color="#555"
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
          <select v-model="modelValue.errorCorrectionLevel">
            <option value="L">Low</option>
            <option value="M">Medium</option>
            <option value="Q">Quartile</option>
            <option value="H">High</option>
          </select>
        </div>
      </div>
    </section>

    <div class="separator"></div>
    <section class="options-section">
      <h3 @click="exportOpen = !exportOpen">
        Export options
        <ChevronUp style="font-size: 1.6em" v-if="exportOpen" /><ChevronDown
          style="font-size: 1.6em"
          v-else
        />
      </h3>
      <div class="randomise" v-if="exportOpen">
        <div class="label-sized">Export separate geometry</div>
        <div>
          <Toggle
            v-model="modelValue.mergeGeometry"
            on-label="Yes"
            off-label="No"
            class="toggle-grey"
          />
        </div>
      </div>
    </section>

    <div class="separator"></div>

    <div class="actions">
      <button @click="emits('export')">
        <FileDownload style="font-size: 1.2em" />Export STL file
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { VTweakpane } from 'v-tweakpane';
import { object, string, array } from 'vue-types';
import slider from 'vue3-slider';
import Toggle from '@vueform/toggle';
import mdiContentCopy from '~icons/mdi/content-copy';
import ShuffleVariant from '~icons/mdi/shuffle-variant';
import FileDownload from '~icons/mdi/file-download';
import ChevronUp from '~icons/mdi/chevron-up';
import ChevronDown from '~icons/mdi/chevron-down';
import CloseThick from '~icons/mdi/close-thick';
import PlusThick from '~icons/mdi/plus-thick';

type Tab = 'randomise' | 'manual' | 'duplicate';

const props = defineProps({
  modelValue: object<any>().isRequired,
  codes: array<string>(),
  display: string<Tab>().def('randomise'),
});

const emits = defineEmits<{
  (e: 'update:display', value): void;
  (e: 'remove', id: number): void;
  (e: 'add', id: string): void;
  (e: 'export', id: string): void;
}>();

const isRandomise = computed(() => props.display === 'randomise');
const isManual = computed(() => props.display === 'manual');
const isDuplicate = computed(() => props.display === 'duplicate');
const qrcodesOpen = ref(false);
const exportOpen = ref(false);

const tab = computed({
  set(value) {
    emits('update:display', value);
  },
  get() {
    return props.display;
  },
});
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped lang="scss">
.infos {
  font-size: 0.8em;
}

.options-section h3 {
  display: flex;
  font-size: 0.8em;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
select {
  color: #fff;
  background-color: #000;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #222;
  width: 100%;
}

.toggle-grey {
  --toggle-bg-on: #666;
  --toggle-border-on: #777;
}

h3 {
  cursor: pointer;
  font-size: 0.9em;
}
h3:hover {
  color: #ccc;
}
.label-sized {
  font-size: 0.9em;
  color: #777;
  font-weight: 400;
}

.actions {
  display: flex;
}

button.add-qrcode {
  background-color: #000;
  display: flex;
  cursor: pointer;
  column-gap: 6px;
  color: #ccc;
  text-decoration: underline;
  align-items: center;
}

button.add-qrcode:hover {
  color: orange;
}

.actions button {
  width: 100%;
  border-left: 1px solid #333;
  background-color: #000;
  color: orange;
  cursor: pointer;
  padding: 0 12px;
  display: flex;
  column-gap: 10px;
  align-items: center;
}

.actions button:hover {
  border-left-color: orange;
}

.flex {
  display: flex;
}

.count {
  width: 30px;
}

.separator {
  height: 1px;
  background-color: #111;
  margin: 14px 0;
}

input {
  color: #fff;
  background-color: #000;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #222;
}

button {
  height: auto;
}

.menu {
  display: flex;
  column-gap: 10px;
  height: 28px;
  overflow: hidden;
}

.menu button {
  order: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.8em;
  background-color: #000;
  color: #fff;
  border: 0;
  column-gap: 5px;
  justify-content: center;
  flex-grow: 1;
}

input {
  max-width: 100%;
}
.menu button:hover,
.menu button.active {
  color: orange;
}

.randomise {
  display: flex;
  align-items: center;
  font-size: 0.8em;
  margin: 8px 0;
  column-gap: 10px;
  justify-content: space-between;
}

.randomise .label {
}

.randomise .label-sized {
  width: 200px;
}

.randomise button {
  background-color: #000;
  border-radius: 4px;
  font-size: 0.7em;
  color: #fff;
  border: 0;
}
.randomise input {
  flex-grow: 1;
}
.qrcode-panel {
  background-color: #000;
  opacity: 0.9;
  height: 100vh;
  position: absolute;
  right: 0;
  box-sizing: border-box;
  padding: 16px;
  width: 300px;
  color: #fff;
}
</style>
