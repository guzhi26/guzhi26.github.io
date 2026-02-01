/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 开启静态导出，生成 out 文件夹（GitHub Pages 必需）
  output: 'export',
  
  // 2. 关闭图片优化（静态导出必需，否则 build 会报错）
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,
  // 注意：Next.js 14 中 appDir 已是默认功能，不再需要 experimental 配置，可以删掉
};

module.exports = nextConfig;
