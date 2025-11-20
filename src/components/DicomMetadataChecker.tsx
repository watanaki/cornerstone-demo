import { imageLoader, metaData } from "@cornerstonejs/core";
import { useEffect, useState } from "react";
import { initCornerstone, fetchImageIds } from "../tools";
import DemoWrapper from "./DemoWrapper";

interface ImageMetadata {
  index: number;
  imageId: string;
  imagePositionPatient?: number[];
  imageOrientationPatient?: number[];
  pixelSpacing?: number[];
  sliceThickness?: number;
  rows?: number;
  columns?: number;
  instanceNumber?: number;
  seriesInstanceUID?: string;
  error?: string;
}

const DicomMetadataChecker = () => {
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const checkMetadata = async () => {
    setLoading(true);
    await initCornerstone({ initVolumeLoader: true });

    const results: ImageMetadata[] = [];

    const imageIds = await fetchImageIds("1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561");

    for (let i = 0; i < imageIds.length; i++) {
      const imageId = imageIds[i];
      try {
        console.log(`检查图像 ${i + 1}/${imageIds.length}...`);
        await imageLoader.loadAndCacheImage(imageId);

        const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
        const imagePixelModule = metaData.get('imagePixelModule', imageId);
        const generalSeriesModule = metaData.get('generalSeriesModule', imageId);
        const instanceMetadata = metaData.get('instance', imageId);

        results.push({
          index: i + 1,
          imageId: imageId.slice(-30),
          imagePositionPatient: imagePlaneModule?.imagePositionPatient,
          imageOrientationPatient: imagePlaneModule?.imageOrientationPatient,
          pixelSpacing: imagePlaneModule?.pixelSpacing,
          sliceThickness: imagePlaneModule?.sliceThickness,
          rows: imagePixelModule?.rows,
          columns: imagePixelModule?.columns,
          instanceNumber: instanceMetadata?.instanceNumber || generalSeriesModule?.instanceNumber,
          seriesInstanceUID: generalSeriesModule?.seriesInstanceUID,
        });
      } catch (err: any) {
        results.push({
          index: i + 1,
          imageId: imageId.slice(-30),
          error: err.message || String(err),
        });
      }
    }

    setMetadata(results);
    setLoading(false);

    // 检查不一致性
    console.log('\n=== 元数据一致性检查 ===');
    const firstValid = results.find(r => !r.error);
    if (firstValid) {
      console.log('参考图像 (第1张):', {
        rows: firstValid.rows,
        columns: firstValid.columns,
        pixelSpacing: firstValid.pixelSpacing,
        imagePositionPatient: firstValid.imagePositionPatient,
        imageOrientationPatient: firstValid.imageOrientationPatient,
      });

      // 特别检查第42-44张
      console.log('\n=== 重点检查第42-44张图像 ===');
      [41, 42, 43].forEach(idx => {
        if (results[idx]) {
          console.log(`\n图像 ${idx + 1}:`, {
            imagePositionPatient: results[idx].imagePositionPatient,
            pixelSpacing: results[idx].pixelSpacing,
            rows: results[idx].rows,
            columns: results[idx].columns,
            sliceThickness: results[idx].sliceThickness,
            imageOrientationPatient: results[idx].imageOrientationPatient,
          });
        }
      });

      console.log('\n=== 完整检查 ===');
      results.forEach((result, idx) => {
        if (result.error) {
          console.error(`❌ 图像 ${idx + 1}: 加载失败 - ${result.error}`);
          return;
        }

        // 检查图像尺寸
        if (result.rows !== firstValid.rows || result.columns !== firstValid.columns) {
          console.warn(`⚠️ 图像 ${idx + 1}: 尺寸不一致 (${result.columns}x${result.rows} vs ${firstValid.columns}x${firstValid.rows})`);
        }

        // 检查像素间距
        if (result.pixelSpacing?.[0] !== firstValid.pixelSpacing?.[0]) {
          console.warn(`⚠️ 图像 ${idx + 1}: 像素间距不一致`, result.pixelSpacing, 'vs', firstValid.pixelSpacing);
        }

        // 检查层厚
        if (result.sliceThickness !== firstValid.sliceThickness) {
          console.warn(`⚠️ 图像 ${idx + 1}: 层厚不一致 (${result.sliceThickness} vs ${firstValid.sliceThickness})`);
        }

        // 检查方向
        if (result.imageOrientationPatient && firstValid.imageOrientationPatient) {
          const diff = result.imageOrientationPatient.some((v, i) =>
            Math.abs(v - firstValid.imageOrientationPatient![i]) > 0.001
          );
          if (diff) {
            console.warn(`⚠️ 图像 ${idx + 1}: 图像方向不一致`, result.imageOrientationPatient);
          }
        }

        // 检查是否缺少位置信息
        if (!result.imagePositionPatient) {
          console.error(`❌ 图像 ${idx + 1}: 缺少 imagePositionPatient`);
        }
      });

      // 检查切片间距是否均匀
      console.log('\n=== 切片间距检查 ===');
      const positions = results
        .filter(r => r.imagePositionPatient)
        .map((r, i) => ({ index: i + 1, z: r.imagePositionPatient![2] }));

      if (positions.length > 1) {
        const spacings: number[] = [];
        for (let i = 1; i < positions.length; i++) {
          const spacing = Math.abs(positions[i].z - positions[i - 1].z);
          spacings.push(spacing);
          if (i > 1) {
            const prevSpacing = spacings[i - 2];
            if (Math.abs(spacing - prevSpacing) > 0.1) {
              console.warn(`⚠️ 图像 ${positions[i].index}: 切片间距异常 (${spacing.toFixed(3)} vs ${prevSpacing.toFixed(3)})`);
            }
          }
        }
        console.log('平均切片间距:', (spacings.reduce((a, b) => a + b, 0) / spacings.length).toFixed(3));
      }
    }
  };

  useEffect(() => {
    checkMetadata();
  }, []);

  // 为不同序列分配颜色
  const getSeriesColor = (seriesUID?: string) => {
    if (!seriesUID) return '';

    const seriesUIDs = [...new Set(metadata.map(m => m.seriesInstanceUID).filter(Boolean))];
    const seriesIndex = seriesUIDs.indexOf(seriesUID);

    const colors = [
      'bg-blue-50',
      'bg-green-50',
      'bg-purple-50',
      'bg-orange-50',
      'bg-pink-50',
      'bg-cyan-50',
      'bg-lime-50',
      'bg-amber-50',
    ];

    return colors[seriesIndex % colors.length];
  };

  return (
    <DemoWrapper>
      <div className="flex flex-col gap-4">
        <div className="text-center text-xl font-bold">DICOM 元数据检查器</div>

        {loading && <div className="text-center">加载中...</div>}

        {metadata.length > 0 && (
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border p-1">#</th>
                  <th className="border p-1">实例号</th>
                  <th className="border p-1">文件名</th>
                  <th className="border p-1">位置 (x,y,z)</th>
                  <th className="border p-1">尺寸</th>
                  <th className="border p-1">间距</th>
                  <th className="border p-1">层厚</th>
                  <th className="border p-1">状态</th>
                </tr>
              </thead>
              <tbody>
                {metadata.map((item) => {
                  const bgColor = item.error
                    ? 'bg-red-100'
                    : getSeriesColor(item.seriesInstanceUID);

                  return (
                    <tr key={item.index} className={bgColor}>
                      <td className="border p-1 text-center">{item.index}</td>
                      <td className="border p-1 text-center font-semibold">
                        {item.instanceNumber || '-'}
                      </td>
                      <td className="border p-1 font-mono text-[10px]">{item.imageId}</td>
                      <td className="border p-1">
                        {item.imagePositionPatient
                          ? item.imagePositionPatient.map(v => v.toFixed(2)).join(', ')
                          : '❌ 缺失'
                        }
                      </td>
                      <td className="border p-1 text-center">
                        {item.columns && item.rows ? `${item.columns}×${item.rows}` : '-'}
                      </td>
                      <td className="border p-1">
                        {item.pixelSpacing?.map(v => v.toFixed(3)).join(', ') || '-'}
                      </td>
                      <td className="border p-1 text-center">
                        {item.sliceThickness?.toFixed(2) || '-'}
                      </td>
                      <td className="border p-1 text-center">
                        {item.error ? `❌ ${item.error}` : '✅'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-sm text-gray-600 p-4 bg-gray-100 rounded">
          <p><strong>说明：</strong></p>
          <ul className="list-disc ml-5 mt-2">
            <li><strong>实例号 (Instance Number)</strong>：DICOM 图像在序列中的编号</li>
            <li><strong>背景颜色</strong>：相同颜色表示同一序列 (Series)，不同颜色表示不同序列</li>
            <li><strong>红色背景</strong>：加载失败的图像</li>
            <li>检查控制台以查看详细的不一致性报告和切片间距分析</li>
          </ul>
        </div>
      </div>
    </DemoWrapper>
  );
};

export default DicomMetadataChecker;
