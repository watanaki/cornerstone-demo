import { getRenderEngine, initCornerstone, imageIds } from "@/tools";
import { Enums, volumeLoader, type Types, imageLoader, metaData } from "@cornerstonejs/core";
import { ViewportType } from "@cornerstonejs/core/enums";
import { useEffect, useRef } from "react";
import DemoWrapper from "./DemoWrapper";
import { addTool, StackScrollTool, ToolGroupManager } from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";

// const { ViewportType } = Enums;
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

const VolumeDemo = () => {
  const a = useRef<HTMLDivElement>(null);

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
          orientation: Enums.OrientationAxis.AXIAL,
          background: [0.2, 0, 0.2] as Types.Point3,
        },
      };
      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;

      try {
        /** console.log(`🔄 预加载并排序图像...`);

        // 预加载所有图像并获取Z轴位置
        const imagesWithPosition = await Promise.all(
          imageIds.map(async (imageId) => {
            await imageLoader.loadAndCacheImage(imageId);
            const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
            return {
              imageId,
              position: imagePlaneModule?.imagePositionPatient?.[2] || 0,
            };
          })
        );

        // 按Z轴位置排序
        imagesWithPosition.sort((a, b) => a.position - b.position);
        const sortedImageIds = imagesWithPosition.map(item => item.imageId);

        console.log('✅ 图像已按位置排序');
        console.log('Z轴位置范围:', {
          min: imagesWithPosition[0].position,
          max: imagesWithPosition[imagesWithPosition.length - 1].position,
        }); */

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

  return (
    <DemoWrapper>
      <div className="text-center">Volume Demo</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
      </div>
      <div>

      </div>
    </DemoWrapper>
  );
}

// const VolumeDemo = () => {
//   return <div>TEST</div>
// }

export default VolumeDemo;