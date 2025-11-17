import { getRenderEngine, initCornerstone } from "@/tools";
import { Enums, volumeLoader, type Types } from "@cornerstonejs/core";
import { ViewportType } from "@cornerstonejs/core/enums";
import { useEffect, useRef } from "react";
import DemoWrapper from "./DemoWrapper";

const prefix = "wadouri";
const path = "http://192.168.1.47:3011/receive/1.3";
const names = [
  "IMG-0004-00007.dcm",
  "IMG-0004-00008.dcm",
  "IMG-0004-00009.dcm",
  "IMG-0004-00010.dcm",
  "IMG-0004-00011.dcm",
  "IMG-0004-00012.dcm",
  "IMG-0004-00013.dcm",
  "IMG-0004-00014.dcm",
  "IMG-0004-00015.dcm",
  "IMG-0004-00016.dcm",
  "IMG-0004-00017.dcm",
  "IMG-0004-00018.dcm",
  "IMG-0004-00019.dcm",
  "IMG-0004-00020.dcm",
  "IMG-0004-00021.dcm",
  "IMG-0004-00022.dcm"
];
const imageIds = names.map(name => `${prefix}:${path}/${name}`);

// const { ViewportType } = Enums;
const viewportId = 'myVolume';
const volumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME_001';

const VolumeDemo = () => {
  const a = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      await initCornerstone({ initVolumeLoader: true });
      const renderingEngine = getRenderEngine();

      if (!a.current) {
        console.error('容器元素未找到');
        return;
      }

      const viewportInput = {
        viewportId,
        type: ViewportType.ORTHOGRAPHIC,
        element: a.current,
        defaultOptions: {
          // 可选值: AXIAL (轴位), SAGITTAL (矢状面), CORONAL (冠状面)
          orientation: Enums.OrientationAxis.CORONAL,
          // background: [0.2, 0, 0.2] as Types.Point3,
        },
      };
      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;

      try {
        console.log('🔄 开始创建 Volume，共 ${imageIds.length} 张图像...');
        const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });

        console.log('🔄 开始加载图像数据...');
        volume.load();
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

        // Render the image
        viewport.render();
        console.log('✅ 渲染完成!');
      } catch (err) {
        console.error("❌ Volume 创建/加载失败:");
        console.error(err);
      }

      // Set the volume to load

    }

    init();
  }, []);

  return (
    <DemoWrapper>
      <div className="text-center">Volume Demo</div>
      <div className='flex gap-4'>
        <div ref={a} className='h-96 w-96 border-2 border-gray-400 bg-black'></div>
      </div>
    </DemoWrapper>
  );
}

// const VolumeDemo = () => {
//   return <div>TEST</div>
// }

export default VolumeDemo;