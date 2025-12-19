import React, { useCallback, useEffect, useRef, useState } from 'react'
import DemoWrapper from '../DemoWrapper';
import { addTool, StackScrollTool, ToolGroupManager } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/enums';
import { BlendModes, OrientationAxis, ViewportType } from '@cornerstonejs/core/enums';
import { fetchImageIds, getRenderEngine, initCornerstone } from '@/tools';
import { volumeLoader, type Types } from '@cornerstonejs/core';
import type { IVolumeViewport } from '@cornerstonejs/core/types';
import { twMerge } from 'tailwind-merge';

const viewportId = 'myVolume';
const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';

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

const MIP = () => {
  const a = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState<OrientationAxis>(OrientationAxis.AXIAL);
  const [isMIPOn, setIsMIPOn] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initCornerstone({ initVolumeLoader: true, initTools: true });
      const renderingEngine = getRenderEngine();

      if (!a.current || !mounted) {
        console.error('容器元素未找到或组件已卸载');
        return;
      }

      const viewportInput = {
        viewportId,
        type: ViewportType.ORTHOGRAPHIC,
        element: a.current,
        defaultOptions: {
          // 可选值: AXIAL (轴位), SAGITTAL (矢状面), CORONAL (冠状面)
          orientation: axis,
          background: [0.2, 0, 0.2] as Types.Point3,
        },
      };

      const imageIds = await fetchImageIds("1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561");

      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;

      try {

        const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });

        console.log('🔄 开始加载图像数据...');
        await volume.load();
        console.log('✅ Volume 加载完成!');
        console.log(volume.dimensions);

        // Set the volume on the viewport
        await viewport.setVolumes([{ volumeId }]);
        console.log('✅ Volume 已设置到 viewport');

        // 重置相机以适配整个 volume
        viewport.resetCamera();
        console.log('✅ 相机已重置');

        setTools(renderingEngine.id);

        // Render the image
        viewport.render();
        console.log('✅ 渲染完成!');

      } catch (err) {
        console.error("❌ Volume 创建/加载失败:");
        console.error(err);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleOrientation = useCallback((orientation: OrientationAxis) => {
    if (axis === orientation) return;
    const renderEngine = getRenderEngine();
    const viewport = renderEngine.getViewport(viewportId) as IVolumeViewport;

    setAxis(orientation);
    viewport.setOrientation(orientation);
  }, [axis]);

  const toggleMIP = useCallback(() => {
    console.log("切换MIP");
    const renderEngine = getRenderEngine();
    const viewport = renderEngine.getViewport(viewportId) as IVolumeViewport;

    if (isMIPOn) {
      viewport.setBlendMode(BlendModes.AVERAGE_INTENSITY_BLEND);
      viewport.setSlabThickness(1);
    } else {
      const imageData = viewport.getImageData();
      if (!imageData) {
        console.warn("No image data");
        return;
      }
      // const { dimensions } = imageData;
      // const slabThickness = Math.sqrt(
      //   dimensions[0] ** 2 + dimensions[1] ** 2 + dimensions[2] ** 2
      // );
      viewport.setBlendMode(BlendModes.MAXIMUM_INTENSITY_BLEND);
      viewport.setSlabThickness(10);
    }
    viewport.render();
    setIsMIPOn(!isMIPOn);
  }, [isMIPOn]);

  return (
    <DemoWrapper>
      <div className="text-center">Volume Demo</div>
      <div className='flex gap-4 items-center'>
        <button className={twMerge("baseBtn h-24", isMIPOn ? "bg-amber-400" : "")} onClick={toggleMIP}>MIP</button>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="baseBtn" onClick={() => toggleOrientation(OrientationAxis.AXIAL)}>axial</button>
        <button className="baseBtn" onClick={() => toggleOrientation(OrientationAxis.CORONAL)}>coronal</button>
        <button className="baseBtn" onClick={() => toggleOrientation(OrientationAxis.SAGITTAL)}>sagittal</button>
      </div>
    </DemoWrapper>
  );
}

export default MIP;