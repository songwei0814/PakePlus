# 进度条变形问题解决方案

## 常见变形原因

### 1. 锚点设置不正确
- **问题**：bar 元素的锚点不在左侧，导致宽度变化时位置偏移
- **解决**：设置锚点为 `(0, 0.5)` 或 `(0, 0)`

### 2. Sprite Type 设置错误
- **问题**：使用默认的 SIMPLE 模式，图片会被拉伸变形
- **解决**：使用 SLICED 模式（九宫格），保持边缘不变形

### 3. 高度未固定
- **问题**：只改变宽度，高度被父节点影响
- **解决**：固定 bar 的高度等于背景高度

### 4. 父节点 Layout 影响
- **问题**：父节点有 Layout 组件，会影响子节点尺寸
- **解决**：移除 Layout 或调整 Layout 设置

## 编辑器设置步骤

### 步骤 1：创建节点结构
```
ProgressBar（父节点）
├── bg（背景，Sprite）
└── bar（填充条，Sprite）
```

### 步骤 2：设置背景节点（bg）
1. 添加 **Sprite** 组件，设置图片
2. 添加 **UITransform** 组件
3. 设置尺寸：Width = 300, Height = 30（示例）

### 步骤 3：设置填充节点（bar）- 关键步骤
1. **UITransform 设置**：
   - Width: 0（初始为 0）
   - Height: 与背景高度相同（如 30）
   
2. **锚点设置**：
   - Anchor X: 0（左侧对齐）
   - Anchor Y: 0.5（垂直居中）
   
3. **位置设置**：
   - X: -背景宽度/2（如 -150）
   - Y: 0
   
4. **Sprite 组件设置**：
   - Type: **SLICED**（九宫格模式）
   - 如果使用 SLICED，需要设置 Border：
     - Left: 5
     - Right: 5
     - Top: 5
     - Bottom: 5

### 步骤 4：添加 ProgressBar 脚本
1. 在父节点添加 `ProgressBar` 组件
2. 设置属性：
   - Bg Node: 拖入 bg 节点
   - Bar Node: 拖入 bar 节点
   - Label: 可选，拖入文字节点

## 使用 SLICED 模式的注意事项

### 图片要求
- 图片需要有可拉伸的中间区域
- 边缘部分（Border 区域）不会被拉伸
- 建议图片宽度至少是 Border 的 3 倍

### Border 设置
```
如果进度条图片宽度是 100px：
- Left Border: 10（左侧固定区域）
- Right Border: 10（右侧固定区域）
- 中间 80px 会被拉伸
```

## 如果不想使用 SLICED 模式

### 方案 A：使用 SIMPLE 模式 + 固定高度
```typescript
// 在代码中确保高度不变
barTransform.height = bgTransform.height; // 固定高度
barTransform.width = targetWidth; // 只改变宽度
```

### 方案 B：使用多个 Sprite 拼接
- 左侧：固定宽度的左侧图片
- 中间：可拉伸的中间图片（SLICED）
- 右侧：固定宽度的右侧图片

## 代码示例：手动控制（不使用脚本）

```typescript
// 在需要更新进度的地方
const bgNode = this.node.getChildByName('bg');
const barNode = this.node.getChildByName('bar');

const bgTransform = bgNode.getComponent(UITransform);
const barTransform = barNode.getComponent(UITransform);

// 设置锚点在左侧
barNode.setAnchorPoint(0, 0.5);

// 固定高度
barTransform.height = bgTransform.height;

// 设置位置
barNode.setPosition(-bgTransform.width / 2, 0, 0);

// 更新宽度
const progress = 50; // 50%
barTransform.width = (bgTransform.width * progress) / 100;
```

## 检查清单

- [ ] bar 节点的锚点设置为 (0, 0.5) 或 (0, 0)
- [ ] bar 节点的高度等于背景高度
- [ ] bar 节点的初始宽度为 0
- [ ] bar 节点的 X 位置为 -背景宽度/2
- [ ] Sprite Type 设置为 SLICED（如果使用九宫格图片）
- [ ] 如果使用 SLICED，正确设置了 Border
- [ ] 父节点没有 Layout 组件影响子节点
- [ ] bar 节点没有 Widget 组件（除非需要特殊对齐）
