import { init as initCore } from '@cornerstonejs/core';
import { init as initDicomImageLoader } from '@cornerstonejs/dicom-image-loader';
import { init as initTools } from '@cornerstonejs/tools'
import { getRenderEngine } from './createRenderEngine';
import { initVolumeLoader } from './initVolumeLoader';

interface InitOptions {
  initVolumeLoader?: boolean;
  initTools?: boolean;
}

export const initCornerstone = async (options?: InitOptions) => {
  console.log('> Init Cornerstone Core......');
  await initCore();

  console.log('> Init DICOM Loader......');
  await initDicomImageLoader();

  console.log("> Create Rendering Engine......");
  getRenderEngine();

  if (options?.initVolumeLoader) {
    console.log('> Init Volume Loader......');
    initVolumeLoader();
  }

  if (options?.initTools) {
    console.log('> Init Tools......');
    await initTools();
  }

  console.log('Cornerstone 初始化完成');
}