import {
  Enums,
  type Types,
} from '@cornerstonejs/core';
import { useEffect, useRef } from 'react';
import { getRenderEngine, initCornerstone } from '../tools';
import DemoWrapper from './DemoWrapper';
const { ViewportType } = Enums;

// 先测试单个图像
const imageIds = [
  "wadouri:http://192.168.1.47:3011/receive/1.3.46.670589.11.78269.5.0.7288.2024032116291871610/IMG-0004-00022.dcm"
];

const viewportId = 'CT_AXIAL_STACK';

import { init as initCore } from '@cornerstonejs/core';
import { init as initDicomImageLoader } from '@cornerstonejs/dicom-image-loader';


import { getRenderingEngine, RenderingEngine } from "@cornerstonejs/core";



const StackDemo = () => {
  const a = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const init = async () => {
  //     await initCornerstone();
  //     const renderingEngine = getRenderEngine();

  //     if (!a.current) {
  //       console.error('容器元素未找到');
  //       return;
  //     }
  //     const viewportInput = {
  //       viewportId,
  //       element: a.current,
  //       type: ViewportType.STACK,
  //     };

  //     console.log('设置 viewport...');
  //     renderingEngine.enableElement(viewportInput)

  //     const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

  //     viewport.setStack(imageIds);

  //     // 等待图像加载后再渲染
  //     setTimeout(() => {
  //       viewport.resetCamera(); // 重置相机让图像适配视口
  //       viewport.render();
  //       console.log('✅ 图像渲染完成!');
  //     }, 100);
  //   }

  //   init();
  // }, []);
  useEffect(() => {
    const init = async () => {
      await initCore();
      await initDicomImageLoader();
      const renderingEngineId = 'myRenderingEngine';
      const renderingEngine = new RenderingEngine(renderingEngineId);
      const viewportId = 'CT_AXIAL_STACK';

      if (!a.current) return;

      const viewportInput = {
        viewportId,
        element: a.current,
        type: Enums.ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

      viewport.setStack(imageIds);

      viewport.render();
    }
    init();
  }, []);
  return (
    <DemoWrapper>
      <div className='flex flex-col gap-4'>
        <div className="text-center">DICOM 单图像查看器</div>
        <div className='flex gap-4'>
          <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
        </div>
      </div>
    </DemoWrapper>
  );
}

export default StackDemo;