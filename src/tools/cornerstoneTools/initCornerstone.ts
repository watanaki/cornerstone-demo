import {
  init as coreInit,
} from '@cornerstonejs/core';
import { initCornerstoneDICOMImageLoader } from './initDICOMImgLoader';
import { getRenderEngine } from './createRenderEngine';

export const initCornerstone = async () => {
  console.log('Init Cornerstone Core...');
  await coreInit();
  console.log('Init DICOM Loader...');
  initCornerstoneDICOMImageLoader();
  console.log("Create Rendering Engine...");
  getRenderEngine();

}