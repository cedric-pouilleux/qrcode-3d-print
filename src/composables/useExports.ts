import { Mesh } from 'three';
import { saveAs } from 'file-saver';
import * as exportSTL from 'threejs-export-stl';

interface IUseExports {
  exportGeometry(mesh: Mesh): void;
  exportPlan(plan: Mesh): void;
}

export function useExports(content: string): IUseExports {
  try {
    !!new Blob();
  } catch (e) {
    console.error(e);
  }

  function exportGeometry(mesh: Mesh) {
    const buffer = exportSTL.fromMesh(mesh);
    saveAs(
      new Blob([buffer], { type: exportSTL.mimeType }),
      `3D-print-${content.trim()}-qrcode.stl`
    );
  }

  function exportPlan(plan: Mesh) {
    const planBuffer = exportSTL.fromMesh(plan);
    saveAs(
      new Blob([planBuffer], { type: exportSTL.mimeType }),
      `3D-print-${content.trim()}-qrcode-plan.stl`
    );
  }

  return {
    exportGeometry,
    exportPlan,
  };
}
