import {
  Enums,
  type Types,
} from '@cornerstonejs/core';
import { useEffect, useRef } from 'react';
import { getRenderEngine, initCornerstone, imageIds } from '../tools';
import DemoWrapper from './DemoWrapper';
import { addTool, StackScrollTool, ToolGroupManager } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/enums';

const viewportId = 'CT_AXIAL_STACK';


const setTools = (renderingEngineId: string) => {
  addTool(StackScrollTool);

  const toolGroupId = "myToolGroup";

  // 检查工具组是否已存在，避免重复创建
  let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  }

  toolGroup?.addTool(StackScrollTool.toolName);

  toolGroup?.addViewport(viewportId, renderingEngineId);

  toolGroup?.setToolActive(StackScrollTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Wheel,
      },
    ],
  });
}

const StackDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const init = async () => {
      await initCornerstone({ initTools: true });
      const renderingEngine = getRenderEngine();

      if (!a.current) return;

      const viewportInput = {
        viewportId,
        element: a.current,
        type: Enums.ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

      await viewport.setStack(imageIds);
      viewport.resetCamera();
      viewport.render();

      setTools(renderingEngine.id);
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