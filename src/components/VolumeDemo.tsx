import {
  init as coreInit,
  RenderingEngine,
  Enums,
  type Types,
  getRenderingEngine,
} from '@cornerstonejs/core';
// @ts-ignore
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { useEffect, useRef } from 'react';

// 先测试单个图像
const testImageId = "wadouri:http://192.168.1.47:3011/receive/1.3.46.670589.11.78269.5.0.7288.2024032116291871610/IMG-0004-00022.dcm";

// 使用唯一的渲染引擎ID
const renderingEngineId = 'myRenderingEngine_' + Date.now();
const { ViewportType } = Enums;

const VolumeDemo = () => {
  const a = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderingEngine: RenderingEngine | null = null;

    const initializeViewer = async () => {
      try {
        console.log('开始初始化 Cornerstone...');

        // 确保 DOM 元素已经准备好
        if (!a.current) {
          console.error('容器元素未找到');
          return;
        }

        await coreInit();
        await dicomImageLoaderInit();

        console.log('Cornerstone 初始化完成');
        console.log('创建渲染引擎...');

        // 先销毁可能存在的渲染引擎
        try {
          const existingEngine = getRenderingEngine(renderingEngineId);
          if (existingEngine) {
            existingEngine.destroy();
          }
        } catch (e) {
          // 忽略不存在的错误
        }

        renderingEngine = new RenderingEngine(renderingEngineId);

        // 先测试单个图像是否能加载
        console.log('测试单个图像加载...');
        try {
          const testResponse = await fetch(testImageId.replace('wadouri:', ''));
          console.log('图像请求状态:', testResponse.status);
          console.log('图像大小:', testResponse.headers.get('content-length'));

          if (!testResponse.ok) {
            throw new Error(`HTTP ${testResponse.status}`);
          }
        } catch (fetchError) {
          console.error('❌ 图像加载测试失败:', fetchError);
          return;
        }

        const viewportId = 'CT_STACK';

        const viewportInput = {
          viewportId: viewportId,
          element: a.current,
          type: ViewportType.STACK,
        };

        console.log('设置 viewport...');
        renderingEngine.enableElement(viewportInput)

        const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
        console.log('viewport:\n');
        console.log(viewport);

        console.log('设置图像堆栈...');
        await viewport.setStack([testImageId]);

        console.log('渲染图像...');
        viewport.render();

        console.log('✅ 图像渲染完成!');
      } catch (error) {
        console.error('❌ 初始化失败:', error);
      }
    };

    // 确保在下一个事件循环中执行
    const timer = setTimeout(initializeViewer, 0);

    return () => {
      clearTimeout(timer);
      // 清理渲染引擎
      if (renderingEngine) {
        try {
          renderingEngine.destroy();
        } catch (e) {
          console.log('清理渲染引擎时出错:', e);
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="">DICOM 单图像查看器</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
      </div>
    </div>
  );
}

export default VolumeDemo;