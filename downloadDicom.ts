import https from 'https';
import fs from 'fs';
import path from 'path';

// 创建 temp 目录
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`✅ 创建目录: ${tempDir}`);
}

// 生成图像 URL 列表
const imageUrls = new Array(100).fill(0).map((_, index) => {
  const num = index.toString().padStart(6, '0');
  return `https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT${num}.dcm`;
});

console.log(`📥 开始下载 ${imageUrls.length} 个 DICOM 文件...\n`);

// 下载单个文件的函数
function downloadFile(url, index) {
  return new Promise((resolve, reject) => {
    const num = index.toString().padStart(6, '0');
    const filename = `CT${num}.dcm`;
    const filepath = path.join(tempDir, filename);

    // 检查文件是否已存在
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  [${index + 1}/${imageUrls.length}] 跳过 ${filename} (已存在)`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${filename}, 状态码: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ [${index + 1}/${imageUrls.length}] 下载完成: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => { }); // 删除部分下载的文件
      reject(new Error(`下载错误: ${filename}, ${err.message}`));
    });

    file.on('error', (err) => {
      fs.unlink(filepath, () => { });
      reject(err);
    });
  });
}

// 并发下载（每次最多 5 个）
async function downloadAll() {
  const concurrency = 5;
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const promises = batch.map((url, batchIndex) =>
      downloadFile(url, i + batchIndex)
        .then(() => { completed++; })
        .catch((err) => {
          console.error(`❌ ${err.message}`);
          failed++;
        })
    );

    await Promise.all(promises);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 下载完成！`);
  console.log(`   成功: ${completed} 个`);
  console.log(`   失败: ${failed} 个`);
  console.log(`   保存位置: ${tempDir}`);
  console.log('='.repeat(50));
}

// 开始下载
downloadAll().catch(err => {
  console.error('❌ 下载过程出错:', err);
  process.exit(1);
});
