# 月境 · Moon Verse

以苏轼《水调歌头·明月几时有》为线索的 React / Three.js 交互网页。七幕实时生成的体素景观，从把酒问天走到千里婵娟。

面向电脑浏览器，建议窗口宽度至少 1024px、高度至少 740px。需要支持 WebGL 2 的现代浏览器。

## 本地运行

```sh
pnpm install
pnpm dev
```

打开终端显示的本地地址。生产构建及本地预览：

```sh
pnpm build
pnpm preview
```

## 观景

- 点击底部诗句，在七个场景间切换；前后箭头顺序导航。
- 鼠标拖动环顾，滚轮缩放；右侧回转箭头恢复该幕的最佳视角。
- 暂停按钮停止水纹、流云、舟行与人物等动态；全屏按钮扩展观景区域。
- “读全词”展开完整原词，点击任一段可跳转到对应场景；Esc 关闭面板。
- 遵循系统“减少动态效果”设置，停用转场和环境动画。

## 实现

React + TypeScript + Vite，使用 React Three Fiber、Drei、Three.js 和 Lucide。建筑、山石、树木、人物与水纹均为程序化几何，无外部模型或图片素材。重复方块使用 InstancedMesh，共享每批几何和材质；采用抗锯齿、月色照明、阴影和距离雾，无像素化滤镜。

- `src/chapters.ts`：诗句分幕、文案、相机与月亮位置。
- `src/World.tsx`：体素生成、七幕景观、环境动画与相机控制。
- `src/App.tsx` / `src/style.css`：桌面界面、导航、全文阅读与布局。

字体优先使用 Google Fonts 的 Noto Serif SC，网络不可用时退回本地宋体。诗中宫阙、庭院、桥与舟为艺术演绎。景观切换只挂载当前一幕；首次打开会单独加载三维渲染模块。

## 预览与验收

[桌面首屏](preview.png) · [月照无眠](docs/scene-window.png) · [验收记录](docs/acceptance.md)
