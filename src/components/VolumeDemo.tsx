// import { getRenderEngine, initCornerstone, initVolumeLoader, setCtTransferFunctionForVolumeActor } from '@/tools';
// import {
//   Enums,
//   type Types,
//   volumeLoader,
//   setVolumesForViewports,
// } from '@cornerstonejs/core';
// // @ts-ignore
// import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
// import { useEffect, useRef } from 'react';
// import DemoWrapper from './DemoWrapper';

const prefix = "wadouri";
const path = "http://192.168.1.47:3011/receive/1.3";
const names = [
  "IMG-0004-00022.dcm",
  "IMG-0004-00021.dcm",
  "IMG-0004-00020.dcm",
  "IMG-0004-00019.dcm",
  "IMG-0004-00018.dcm",
  "IMG-0004-00017.dcm",
  "IMG-0004-00016.dcm",
  "IMG-0004-00015.dcm",
  "IMG-0004-00014.dcm",
  "IMG-0004-00013.dcm",
  "IMG-0004-00012.dcm",
  "IMG-0004-00011.dcm",
  "IMG-0004-00010.dcm",
  "IMG-0004-00009.dcm",
  "IMG-0004-00008.dcm",
  "IMG-0004-00007.dcm"
];
const imageIds = names.map(name => `${prefix}:${path}/${name}`);

// const { ViewportType } = Enums;
const viewportId = 'CT_AXIAL_STACK';
const volumeId = 'cornerstoneStreamingImageVolume:VOLUME_NAME: 1.3.46.670589.11.78269.5.0.7288.2024032116291871610';

// const VolumeDemo = () => {
//   const a = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const init = async () => {
//       await initCornerstone();
//       initVolumeLoader();
//       const renderingEngine = getRenderEngine();

//       if (!a.current) {
//         console.error('容器元素未找到');
//         return;
//       }

//       const viewportInput = {
//         viewportId,
//         type: ViewportType.ORTHOGRAPHIC,
//         element: a.current,
//         defaultOptions: {
//           orientation: Enums.OrientationAxis.SAGITTAL,
//           background: [0.2, 0, 0.2] as Types.Point3,
//         },
//       };
//       renderingEngine.enableElement(viewportInput);

//       const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;

//       try {
//         const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds, });
//         volume.load();
//         console.log('✅ Volume创建完成!');
//         // Set the volume on the viewport
//         viewport.setVolumes([
//           { volumeId },
//         ]);

//         // Render the image
//         viewport.render();
//       } catch (err) {
//         console.error("createVolume失败:");
//         console.error(err);
//       }

//       // Set the volume to load

//     }

//     init();
//   }, []);

//   return (
//     <DemoWrapper>
//       <div className="text-center">Volume Demo</div>
//       <div className='flex gap-4'>
//         <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
//       </div>
//     </DemoWrapper>
//   );
// }

const VolumeDemo = () => {
  return <div>TEST</div>
}

export default VolumeDemo;