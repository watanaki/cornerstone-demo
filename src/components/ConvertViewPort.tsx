import {
  Enums,
  RenderingEngine,
  setVolumesForViewports,
  utilities,
  volumeLoader,
} from '@cornerstonejs/core';
import type { Types } from '@cornerstonejs/core'
import { useCallback, useEffect, useRef } from 'react';
import { getRenderEngine, initCornerstone, fetchImageIds } from '../tools';
import DemoWrapper from './DemoWrapper';
import type { IStackViewport, IVolumeViewport } from '@cornerstonejs/core/types';

const viewportId = 'CT_AXIAL_STACK';

const stack2Volume = async (
  renderingEngine: RenderingEngine,
  viewport: IStackViewport,
  volumeId: string
) => {
  const { id, element } = viewport;
  // 直接使用原始的 imageIds，不需要修改 scheme
  const imageIds = viewport.getImageIds();

  const viewportInput = [{
    viewportId: id,
    type: Enums.ViewportType.ORTHOGRAPHIC,
    element,
  }];

  renderingEngine.setViewports(viewportInput);

  const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds, });
  await volume.load();
  const volumeViewport = renderingEngine.getViewport(id) as IVolumeViewport;
  setVolumesForViewports(
    renderingEngine,
    [{ volumeId, },],
    [id]
  );

  volumeViewport.resetCamera();
  volumeViewport.render();
}

const volume2Stack = () => {

}

const ConvertViewportDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  const renderingEngine = useRef<RenderingEngine | null>(null);

  useEffect(() => {
    const init = async () => {
      await initCornerstone({ initVolumeLoader: true });
      renderingEngine.current = getRenderEngine();

      if (!a.current) return;

      const viewportInput = {
        viewportId,
        element: a.current,
        type: Enums.ViewportType.STACK,
      };

      renderingEngine.current.enableElement(viewportInput);

      const viewport = renderingEngine.current.getViewport(viewportId) as Types.IStackViewport;

      const imageIds = await fetchImageIds("1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561");

      await viewport.setStack(imageIds, 13);
      viewport.resetCamera();
      viewport.render();
    }
    init();
  }, []);

  const convertViewport = useCallback(async (type: 'stack' | 'volume') => {
    if (!renderingEngine.current) {
      return console.warn("No renderEngine!");
    }

    const viewport = renderingEngine.current.getViewport(viewportId);

    let newViewport;
    if (type === 'volume') {
      // Stack -> Volume
      if (viewport.type === Enums.ViewportType.ORTHOGRAPHIC) {
        return console.warn("Already Volume viewport");
      }

      console.log('开始转换 Stack -> Volume...');
      try {
        newViewport = await utilities.convertStackToVolumeViewport({
          viewport: viewport as Types.IStackViewport,
          options: {
            volumeId: "cornerstoneStreamingImageVolume:convert_volume",
            background: [0, 0.4, 0] as Types.Point3,
          }
        });

        if (newViewport) {
          newViewport.setOrientation(Enums.OrientationAxis.SAGITTAL);
          newViewport.resetCamera();
          newViewport.render();
        }
        console.log('✅ 转换成功');
      } catch (err) {
        console.error('❌ 转换失败:', err);
      }
      // stack2Volume(renderingEngine.current, viewport as IStackViewport, 'sss');
    } else {
      // Volume -> Stack
      if (viewport.type === Enums.ViewportType.STACK) {
        return console.warn("Already Stack viewport");
      }
      newViewport = await utilities.convertVolumeToStackViewport({
        viewport: viewport as Types.IVolumeViewport,
        options: {
          background: [0.4, 0.0, 0.4],
        },
      });
    }
  }, []);

  return (
    <DemoWrapper>
      <div className='flex flex-col gap-4'>
        <div className="text-center">Viewport 互转</div>
        <div className='flex gap-4'>
          <div className="flex flex-col gap-4">
            <button className='baseBtn' onClick={() => convertViewport('stack')}>To Stack</button>
            <button className='baseBtn' onClick={() => convertViewport('volume')}>To Volume</button>
          </div>
          <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
        </div>
      </div>
    </DemoWrapper>
  );
}

export default ConvertViewportDemo;