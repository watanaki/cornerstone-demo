import { init as initCore } from '@cornerstonejs/core';
import { init as initDicomImageLoader } from '@cornerstonejs/dicom-image-loader';
import { init as initTools } from '@cornerstonejs/tools'
import { initVolumeLoader } from './initVolumeLoader';

interface InitOptions {
  initVolumeLoader?: boolean;
  initTools?: boolean;
}

let isInited = false;

export const initCornerstone = async (options?: InitOptions) => {

  if (isInited) return;

  console.log('> Init Cornerstone Core......');
  await initCore();

  console.log('> Init DICOM Loader......');
  await initDicomImageLoader();

  if (options?.initVolumeLoader) {
    console.log('> Init Volume Loader......');
    initVolumeLoader();
  }

  if (options?.initTools) {
    console.log('> Init Tools......');
    await initTools();
  }

  console.log('Cornerstone 初始化完成');
  isInited = true;
}