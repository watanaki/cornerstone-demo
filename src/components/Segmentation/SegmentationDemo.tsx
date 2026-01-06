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
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchImageIds, type BodyPart } from "./fetchImageIds";
import DemoWrapper from '../DemoWrapper';
import { MouseBindings } from '@cornerstonejs/tools/enums';
import { twMerge } from 'tailwind-merge';

const renderingEngineId = "segmentation";
const toolGroupId = "segGroup";

const viewportId1 = 'CT_AXIAL_STACK';
const viewportId2 = 'CT_SAGITTAL_STACK';
const viewportId3 = 'CT_CORONAL_STACK';

const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';
const segmentationId = "segmentationToolTest";

const getImageIds = async () => {
  const fn = "1767508064559";
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

// @ts-expect-error for test
window.seg = segmentation;

type SegInput = { imageIds: string[], segVolumeId: string, segmentationId: string }

const enableSegmentation = async ({ segVolumeId, imageIds, segmentationId }: SegInput) => {
  console.log("染色");

  if (!segmentation.state.getSegmentation(segmentationId)) {
    console.log(`首次染色`);
    const segmentationVolume = await volumeLoader.createAndCacheVolume(segVolumeId, { imageIds });

    await segmentationVolume.load();

    await segmentation.addSegmentations([{
      segmentationId,
      representation: {
        type: csToolEnums.SegmentationRepresentations.Labelmap,
        data: { volumeId: segVolumeId }
      }
    }]);
  }

  // await segmentation.addLabelmapRepresentationToViewport({
  //   [viewportId1]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap }],
  //   [viewportId2]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap }],
  //   [viewportId3]: [{ segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap }]
  // });

  [viewportId1, viewportId2, viewportId3].forEach(viewportId => {
    segmentation.addLabelmapRepresentationToViewport(viewportId, [{ segmentationId }]);

    segmentation.config.color.setSegmentIndexColor(viewportId, segmentationId, 118, [255, 0, 0, 255]);
    segmentation.config.color.setSegmentIndexColor(viewportId, segmentationId, 121, [0, 255, 0, 255]);
    segmentation.config.color.setSegmentIndexColor(viewportId, segmentationId, 120, [0, 0, 255, 255]);
  });
}

const disableSegmentation = async (segmentationId: string) => {
  console.log("取消染色");
  console.log(segmentationId);

  segmentation.removeSegmentationRepresentation(viewportId1, { segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap });
  segmentation.removeSegmentationRepresentation(viewportId2, { segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap });
  segmentation.removeSegmentationRepresentation(viewportId3, { segmentationId, type: csToolEnums.SegmentationRepresentations.Labelmap });
}

const segs: BodyPart[] = ["abdomen", "back", "bone", "gluteus", "liver"];

const SegmentationDemo = () => {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  document.addEventListener('contextmenu', (e) => { e.preventDefault(); });
  // const d = useRef<HTMLDivElement>(null);
  // const e = useRef<HTMLDivElement>(null);
  // const f = useRef<HTMLDivElement>(null);
  const [segStates, setSegStates] = useState<Record<BodyPart, boolean>>({
    abdomen: false,
    back: false,
    bone: false,
    gluteus: false,
    liver: false,
  });

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
            // images will be pale without this
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

  const toggleSegmentation = useCallback(async (bodyPart: BodyPart) => {
    if (!bodyPart) return;
    const { abdomenIds, backIds, boneIds, gluteusIds, liverIds } = await getImageIds();

    const segs: Record<BodyPart, { imageIds: string[], segVolumeId: string, segmentationId: string }> = {
      abdomen: { imageIds: abdomenIds, segVolumeId: 'abdomen_volume', segmentationId: "abdomen_volume" },
      back: { imageIds: backIds, segVolumeId: 'back_volume', segmentationId: "back_volume" },
      bone: { imageIds: boneIds, segVolumeId: 'bone_volume', segmentationId: "bone_volume" },
      gluteus: { imageIds: gluteusIds, segVolumeId: 'gluteus_volume', segmentationId: "gluteus_volume" },
      liver: { imageIds: liverIds, segVolumeId: 'liver_volume', segmentationId: "liver_volume" },
    };

    if (!segStates[bodyPart])
      enableSegmentation(segs[bodyPart]);
    else
      disableSegmentation(segs[bodyPart].segmentationId);

    setSegStates(prev => ({
      ...prev,
      [bodyPart]: !prev[bodyPart]
    }));
  }, [segStates]);

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

        {
          segs.map(bodyPart => (<button
            key={bodyPart}
            className={twMerge("baseBtn", segStates[bodyPart] ? "bg-amber-400" : "")}
            onClick={() => toggleSegmentation(bodyPart)}
          >
            {bodyPart}染色
          </button>))
        }
      </div>
    </DemoWrapper>
  );
}

export default SegmentationDemo;