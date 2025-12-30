import {
  Enums,
  volumeLoader,
  type Types,
  metaData,
  RenderingEngine,
  getRenderingEngine,
  setVolumesForViewports
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
  initCornerstone,
  fetchImageIds,
} from '@tools';
import { useCallback, useEffect, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { MouseBindings } from '@cornerstonejs/tools/enums';

const renderingEngineId = "segmentation";
const toolGroupId = "segGroup";

const viewportId1 = 'CT_AXIAL_STACK';
const viewportId2 = 'CT_SAGITTAL_STACK';
const viewportId3 = 'CT_CORONAL_STACK';
const segmentationId = "segmentationTest";

const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';
const imageIds = await fetchImageIds("1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561");

const setTools = (renderingEngineId: string) => {
  addTool(StackScrollTool);
  addTool(BrushTool);

  // 检查工具组是否已存在，避免重复创建
  let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  }

  toolGroup?.addTool(StackScrollTool.toolName);
  toolGroup?.addTool(BrushTool.toolName);

  toolGroup?.setToolActive(StackScrollTool.toolName, {
    bindings: [
      { mouseButton: MouseBindings.Wheel, },
      { mouseButton: MouseBindings.Secondary, },
    ],
  });

  toolGroup?.addViewport(viewportId1, renderingEngineId);
  toolGroup?.addViewport(viewportId2, renderingEngineId);
  toolGroup?.addViewport(viewportId3, renderingEngineId);
}

const addSegmentation = async () => {
  const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

  toolGroup?.setToolActive(BrushTool.toolName, {
    bindings: [{ mouseButton: MouseBindings.Primary, },],
  });

  volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, { volumeId: segmentationId });

  segmentation.addSegmentations([{
    segmentationId,
    representation: {
      type: csToolEnums.SegmentationRepresentations.Labelmap,
      data: { volumeId: segmentationId }
    }
  }]);

  await segmentation.addLabelmapRepresentationToViewportMap({
    [viewportId1]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap, },],
    [viewportId2]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap, },],
    [viewportId3]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap, },]
  });
}

const SegmentationDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      await initCornerstone({ initVolumeLoader: true, initTools: true });
      const renderingEngine = new RenderingEngine(renderingEngineId);

      let volume;
      try {
        console.log('🔄 创建 Volume...');
        volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
      } catch (err) {
        console.error("❌ Volume 创建失败:");
        console.error(err);
        return;
      }

      console.log('🔄 开始加载图像数据...');
      await volume.load();

      const viewportInput = [
        {
          viewportId: viewportId1,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: a.current!,
          defaultOptions: { orientation: Enums.OrientationAxis.AXIAL, background: [0.2, 0, 0.2] as Types.Point3, },
        },
        {
          viewportId: viewportId2,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: b.current!,
          defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL, background: [0.2, 0, 0.2] as Types.Point3, },
        },
        {
          viewportId: viewportId3,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: c.current!,
          defaultOptions: { orientation: Enums.OrientationAxis.CORONAL, background: [0.2, 0, 0.2] as Types.Point3, },
        }
      ];

      renderingEngine.setViewports(viewportInput);

      setTools(renderingEngine.id);
      console.log('✅ 工具已设置');

      await setVolumesForViewports(
        renderingEngine,
        [{
          volumeId,
          callback: ({ volumeActor }) => {
            // set the windowLevel after the volumeActor is created
            volumeActor.getProperty().getRGBTransferFunction(0).setMappingRange(-180, 220);
          }
        }],
        [viewportId1, viewportId2, viewportId3]
      );
      console.log('✅ Volume 已设置到 viewport');

      renderingEngine.render();

      // ============================Segmentation========================================
      // try {
      //   console.log('🔄 创建 Segmentation Volume...');
      //   volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, { volumeId: segmentationId });
      //   console.log('✅ Segmentation Volume 创建完成');

      //   segmentation.addSegmentations([{
      //     segmentationId,
      //     representation: {
      //       type: csToolEnums.SegmentationRepresentations.Labelmap,
      //       data: { volumeId: segmentationId }
      //     }
      //   }]);
      //   console.log('✅ Segmentation 已添加');
      // } catch (error) {
      //   console.error(error);
      // }
      // ============================Segmentation========================================



      // ============================Segmentation========================================
      // segmentation.addLabelmapRepresentationToViewport(viewportId, [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap }]);
      // console.log('✅ Segmentation 表示已添加到 Viewport');
      // ============================Segmentation========================================
    }
    init();
  }, []);

  return (
    <DemoWrapper>
      <div className="text-center">Segmentation Demo</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
        <div ref={b} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
        <div ref={c} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="baseBtn" onClick={() => { addSegmentation() }}>Segmentation</button>
      </div>
    </DemoWrapper>
  );
}

export default SegmentationDemo;