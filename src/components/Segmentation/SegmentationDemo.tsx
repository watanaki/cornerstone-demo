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
import { initCornerstone } from '@tools';
import { useEffect, useRef } from 'react';
import { fetchImageIds, type BodyPart } from "./fetchImageIds";
import DemoWrapper from '../DemoWrapper';
import { MouseBindings } from '@cornerstonejs/tools/enums';

const renderingEngineId = "segmentation";
const toolGroupId = "segGroup";

const viewportId1 = 'CT_AXIAL_STACK';
const viewportId2 = 'CT_SAGITTAL_STACK';
const viewportId3 = 'CT_CORONAL_STACK';
const segmentationId = "segmentationTest";

const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';

const getImageIds = async () => {
  const fn = "1765864199882";
  const imageIds = await fetchImageIds(fn, null, true);
  const abdomenIds = await fetchImageIds(fn, "abdomen");
  const backIds = await fetchImageIds(fn, "back");
  const boneIds = await fetchImageIds(fn, "bone");
  const gluteusIds = await fetchImageIds(fn, "gluteus");
  const liverIds = await fetchImageIds(fn, "liver");

  return {
    imageIds,
    abdomenIds,
    backIds,
    boneIds,
    gluteusIds,
    liverIds,
  }
}

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

const addSegmentationTool = async () => {
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
    [viewportId1]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },],
    [viewportId2]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },],
    [viewportId3]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },]
  });
}

const addSegmentation = async (bodyPart: BodyPart) => {
  if (!bodyPart) return;
  const { abdomenIds, backIds, boneIds, gluteusIds, liverIds } = await getImageIds();
  const segs: Record<Exclude<BodyPart, null>, { imageIds: string[], segVolumeId: string, segmentationId: string }> = {
    abdomen: { imageIds: abdomenIds, segVolumeId: 'abdomen_volume', segmentationId: "abdomen_volume" },
    back: { imageIds: backIds, segVolumeId: 'back_volume', segmentationId: "back_volume" },
    bone: { imageIds: boneIds, segVolumeId: 'bone_volume', segmentationId: "bone_volume" },
    gluteus: { imageIds: gluteusIds, segVolumeId: 'gluteus_volume', segmentationId: "gluteus_volume" },
    liver: { imageIds: liverIds, segVolumeId: 'liver_volume', segmentationId: "liver_volume" },
  };

  const { segVolumeId, imageIds, segmentationId } = segs[bodyPart];

  const abdomenVolume = await volumeLoader.createAndCacheVolume(segVolumeId, { imageIds });

  await Promise.all([
    abdomenVolume.load(),
  ]);

  await segmentation.addSegmentations([{
    segmentationId,
    representation: {
      type: csToolEnums.SegmentationRepresentations.Labelmap,
      data: { volumeId: segVolumeId }
    }
  }]);

  // await segmentation.addSegmentationRepresentations(viewportId1, [{
  //   segmentationId,
  //   type: csToolEnums.SegmentationRepresentations.Labelmap,
  // }]);

  await segmentation.addLabelmapRepresentationToViewportMap({
    [viewportId1]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },],
    [viewportId2]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },],
    [viewportId3]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap },]
  });

  segmentation.config.color.setSegmentIndexColor(viewportId1, segmentationId, 118, [255, 0, 0, 255]);
  segmentation.config.color.setSegmentIndexColor(viewportId1, segmentationId, 121, [0, 255, 0, 255]);
  segmentation.config.color.setSegmentIndexColor(viewportId1, segmentationId, 120, [0, 0, 255, 255]);

  segmentation.config.style.setStyle({ type: csToolEnums.SegmentationRepresentations.Labelmap }, {
    fillAlpha: 0.5,
    renderOutline: false
  })

  // console.log('✅ Segmentation 已添加并设置颜色');
}

const SegmentationDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const d = useRef<HTMLDivElement>(null);
  const e = useRef<HTMLDivElement>(null);
  const f = useRef<HTMLDivElement>(null);

  document.addEventListener('contextmenu', (e) => { e.preventDefault(); });

  useEffect(() => {
    const init = async () => {
      await initCornerstone({ initVolumeLoader: true, initTools: true });
      const { imageIds } = await getImageIds();
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
    }
    init();
  }, []);

  return (
    <DemoWrapper>
      <div className="text-center">Segmentation Demo</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
        <div ref={b} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
        <div ref={c} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
      </div>
      {/* <div className='flex gap-4'>
        <div ref={d} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
        <div ref={e} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
        <div ref={f} className='h-80 w-80 border-2 border-gray-400 bg-black'></div>
      </div> */}
      <div className="flex gap-4 mt-4">
        <button className="baseBtn" onClick={() => addSegmentationTool()}>Segmentation工具</button>
        <button className="baseBtn" onClick={() => addSegmentation("abdomen")}>abdomen染色</button>
        <button className="baseBtn" onClick={() => addSegmentation("back")}>back染色</button>
        <button className="baseBtn" onClick={() => addSegmentation("bone")}>bone染色</button>
        <button className="baseBtn" onClick={() => addSegmentation("gluteus")}>gluteus染色</button>
        <button className="baseBtn" onClick={() => addSegmentation("liver")}>liver染色</button>
      </div>
    </DemoWrapper>
  );
}

export default SegmentationDemo;