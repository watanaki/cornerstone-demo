import {
  Enums,
  volumeLoader,
  type Types,
} from '@cornerstonejs/core';
import {
  addTool,
  BrushTool,
  StackScrollTool,
  ToolGroupManager,
  segmentation,
  Enums as csToolEnums,
} from '@cornerstonejs/tools';
import {
  getRenderEngine,
  initCornerstone,
  fetchImageIds,
} from '@tools';
import { useCallback, useEffect, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { MouseBindings } from '@cornerstonejs/tools/enums';

const viewportId = 'CT_AXIAL_STACK';
const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';


const setTools = (renderingEngineId: string) => {
  addTool(StackScrollTool);
  addTool(BrushTool);

  const toolGroupId = "myToolGroup";

  // 检查工具组是否已存在，避免重复创建
  let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  }

  toolGroup?.addTool(StackScrollTool.toolName);
  toolGroup?.addTool(BrushTool.name);

  toolGroup?.addViewport(viewportId, renderingEngineId);

  toolGroup?.setToolActive(StackScrollTool.toolName, {
    bindings: [
      { mouseButton: MouseBindings.Wheel, },
      { mouseButton: MouseBindings.Primary, },
    ],
  });

  const segmentationId = "test";

  segmentation.addSegmentations([{
    segmentationId,
    representation: {
      type: csToolEnums.SegmentationRepresentations.Labelmap,
      data: { volumeId: segmentationId }
    }
  }]);
}

const SegmentationDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  const [orientationAxis, setOrientationAxis] = useState<Enums.OrientationAxis>(Enums.OrientationAxis.SAGITTAL);

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
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: a.current,
        defaultOptions: {
          // 可选值: AXIAL (轴位), SAGITTAL (矢状面), CORONAL (冠状面)
          orientation: orientationAxis,
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
        console.log('📊 Volume 信息:', {
          dimensions: volume.dimensions,
          spacing: volume.spacing,
          direction: volume.direction,
          numSlices: imageIds.length
        });

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

        // 检查画布状态
        const canvas = viewport.canvas;
        console.log('🖼️ Canvas 状态:', {
          width: canvas.width,
          height: canvas.height,
          style: canvas.style.cssText,
        });
      } catch (err) {
        console.error("❌ Volume 创建/加载失败:");
        console.error(err);
      }

      // Set the volume to load

    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleOrientation = useCallback((orientation: Enums.OrientationAxis) => {
    const renderEngine = getRenderEngine();
    const viewport = renderEngine.getViewport(viewportId) as Types.IVolumeViewport;

    viewport.setOrientation(orientation);
  }, []);

  return (
    <DemoWrapper>
      <div className="text-center">Volume Demo</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="baseBtn" onClick={() => { toggleOrientation(Enums.OrientationAxis.AXIAL) }}>axial</button>
        <button className="baseBtn" onClick={() => { toggleOrientation(Enums.OrientationAxis.CORONAL) }}>coronal</button>
        <button className="baseBtn" onClick={() => { toggleOrientation(Enums.OrientationAxis.SAGITTAL) }}>sagittal</button>
      </div>
    </DemoWrapper>
  );
}

export default SegmentationDemo;