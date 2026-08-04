import { Units } from '../models/Table';
import { downloadBlob } from '../lib/download';
import { buttonClasses } from '../lib/styles';

export default function SVGDownloadButton(props: {className: string, units: Units}) {
  const handleDownload = () => {
    // Find the container holding the on-screen SVG.
    const container = document.getElementById(props.className);

    if (!container) {
      console.error('SVG element not found');
      return;
    }

    const svg = container.querySelector('svg');

    if (!svg) {
      console.error('SVG element not found');
      return;
    }

    // Clone so we can give the exported file a real-world size without
    // touching the responsive on-screen version. Setting width/height with
    // the unit suffix makes 1 user unit = 1 unit of length, so drawings
    // exported in mm come out at 1px = 1mm.
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const viewBox = clone.getAttribute('viewBox');
    if (viewBox) {
      const [, , width, height] = viewBox.split(/\s+/).map(Number);
      clone.setAttribute('width', `${width}${props.units}`);
      clone.setAttribute('height', `${height}${props.units}`);
    }
    clone.removeAttribute('class');

    // Serialize the cleaned-up SVG.
    const svgContent = new XMLSerializer().serializeToString(clone);

    downloadBlob(new Blob([svgContent], { type: 'image/svg+xml' }), 'layout.svg');
  };

  return (
    <button className={buttonClasses} onClick={handleDownload}>
      Download SVG
    </button>
  );
};
