import * as THREE from 'three';
import { saveAs } from 'file-saver';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

interface IUseExports {
  exportGeometries(scene: THREE.Scene, merge: Boolean): void;
}

export function useExports(): IUseExports {
  function selectExportable(
    scene: THREE.Scene,
    type: 'plan' | 'qrcode'
  ): THREE.Group {
    const group = new THREE.Group();
    scene.traverseVisible((item: any) => {
      if (item.name === type) {
        group.add(item.clone());
      }
    });
    return group;
  }

  function save(buffer: string, fileName: string) {
    saveAs(
      new Blob([buffer], { type: STLExporter.mimeType }),
      fileName + 'stl'
    );
  }

  function exportGeometries(scene: THREE.Scene, merge: boolean): void {
    const exporter = new STLExporter();
    if (merge) {
      save(exporter.parse(scene), '3D-print-qrcode-all');
    } else {
      const plans = selectExportable(scene, 'plan');
      save(exporter.parse(plans), '3D-print-qrcode-plan');
      const meshs = selectExportable(scene, 'qrcode');
      save(exporter.parse(meshs), '3D-print-qrcode-mesh');
    }
  }

  return {
    exportGeometries,
  };
}
