import {
  Enums,
  type Types,
} from '@cornerstonejs/core';
import { useEffect, useRef } from 'react';
import { getRenderEngine, initCornerstone, imageIds } from '../tools';
import DemoWrapper from './DemoWrapper';

const viewportId = 'CT_AXIAL_STACK';

const StackDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const init = async () => {
      await initCornerstone();
      const renderingEngine = getRenderEngine();

      if (!a.current) return;

      const viewportInput = {
        viewportId,
        element: a.current,
        type: Enums.ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

      await viewport.setStack(imageIds, 20);
      viewport.resetCamera();
      viewport.render();
    }
    init();
  }, []);
  return (
    <DemoWrapper>
      <div className='flex flex-col gap-4'>
        <div className="text-center">stack单图像查看器</div>
        <div className='flex gap-4'>
          <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
        </div>
      </div>
    </DemoWrapper>
  );
}

export default StackDemo;