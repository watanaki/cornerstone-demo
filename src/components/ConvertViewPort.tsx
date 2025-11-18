import {
  Enums,
  RenderingEngine,
  setVolumesForViewports,
  type Types,
  volumeLoader,
} from '@cornerstonejs/core';
import { useCallback, useEffect, useRef } from 'react';
import { getRenderEngine, initCornerstone, imageIds } from '../tools';
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

  let viewportInput = [{
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

      await viewport.setStack(imageIds, 13);
      viewport.resetCamera();
      viewport.render();
    }
    init();
  }, []);

  const convertViewport = useCallback((type: 'stack' | 'volume') => {
    if (!renderingEngine.current) {
      return console.warn("No renderEngine!");
    }

    const viewport = renderingEngine.current.getViewport(viewportId);

    if (type === 'volume') {
      // Stack -> Volume
      if (viewport.type === Enums.ViewportType.VOLUME_3D) {
        return console.warn("Already Volume viewport");
      }
      stack2Volume(renderingEngine.current, viewport as IStackViewport, 'sss');
    } else {
      // Volume -> Stack
      if (viewport.type === Enums.ViewportType.STACK) {
        return console.warn("Already Stack viewport");
      }
      console.log("转换为 Stack（待实现）");
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