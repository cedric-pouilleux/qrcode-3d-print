import * as THREE from 'three';
import { computed } from 'vue';
import { saveAs } from 'file-saver';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

interface IUseExports {
  exportGeometries(scene: THREE.Scene, merge: Boolean): void;
}

export function useExports(content: string): IUseExports {
  function exportPlans(scene: THREE.Scene): THREE.Group {
    const group = new THREE.Group();
    scene.traverseVisible((item: any) => {
      if (item.name === 'plan') {
        group.add(item.clone());
      }
    });
    return group;
  }

  function exportMeshs(scene: THREE.Scene): THREE.Group {
    const group = new THREE.Group();
    scene.traverseVisible((item: any) => {
      if (item.name === 'qrcode') {
        group.add(item.clone());
      }
    });
    return group;
  }

  function exportGeometries(scene: THREE.Scene, merge: boolean): void {
    const exporter = new STLExporter();
    if (merge) {
      const buffer = exporter.parse(scene);
      saveAs(
        new Blob([buffer], { type: STLExporter.mimeType }),
        `3D-print-${content.trim()}-qrcode-all.stl`
      );
    } else {
      const plans = exportPlans(scene);
      const plansBuffer = exporter.parse(plans);
      saveAs(
        new Blob([plansBuffer], { type: STLExporter.mimeType }),
        `3D-print-${content.trim()}-qrcode-plan.stl`
      );
      const meshs = exportMeshs(scene);
      const meshsBuffer = exporter.parse(meshs);
      saveAs(
        new Blob([meshsBuffer], { type: STLExporter.mimeType }),
        `3D-print-${content.trim()}-qrcode-plan.stl`
      );
    }
  }

  return {
    exportGeometries,
  };
}
