import { init as initCore } from '@cornerstonejs/core';
import { init as initDicomImageLoader } from '@cornerstonejs/dicom-image-loader';
import { getRenderEngine } from './createRenderEngine';
import { initVolumeLoader } from './initVolumeLoader';

interface InitOptions {
  initVolumeLoader?: boolean;
}

export const initCornerstone = async (options?: InitOptions) => {
  console.log('> Init Cornerstone Core......');
  await initCore();

  console.log('> Init DICOM Loader......');
  await initDicomImageLoader();

  console.log("> Create Rendering Engine......");
  getRenderEngine();

  if (options?.initVolumeLoader) {
    initVolumeLoader();
  }

  console.log('Cornerstone 初始化完成');
}