import { Units } from '../models/Table';
import { downloadBlob } from '../lib/download';

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
    <>
    <div className="inline-block p-1.5">
    <button
      className="text-white block bg-pink-400 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
      onClick={handleDownload}>
      Download SVG
    </button>
    <a
      className="block font-medium text-blue-600 dark:text-blue-500 hover:underline"
      href="https://github.com/3ach/table/issues"
    >
      Report a bug or request a feature
    </a>
    </div>
    </>
  );
};
