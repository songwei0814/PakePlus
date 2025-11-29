# Sprite 保持宽高比解决方案

## 方法一：使用 SpriteAspectRatio 组件（推荐）

### 使用步骤

1. **添加组件**
   - 选中 Sprite 节点
   - 添加 `SpriteAspectRatio` 组件

2. **选择模式**
   - **width**: 固定宽度，高度自动计算
   - **height**: 固定高度，宽度自动计算
   - **fit**: 自适应父容器，保持宽高比

3. **设置参数**
   - Target Width: 固定宽度模式的目标宽度
   - Target Height: 固定高度模式的目标高度
   - Listen Resize: 是否监听屏幕尺寸变化

### 代码示例

```typescript
// 获取组件
const aspectRatio = spriteNode.getComponent(SpriteAspectRatio);

// 设置为固定宽度模式
aspectRatio.setTargetWidth(300);

// 设置为固定高度模式
aspectRatio.setTargetHeight(200);

// 更新 SpriteFrame 后重新计算
aspectRatio.updateAspectRatio();
```

## 方法二：使用 Widget 组件（编辑器操作）

### 步骤

1. **选中 Sprite 节点**
2. **添加 Widget 组件**
   - 点击添加组件 → UI → Widget
3. **设置对齐**
   - 勾选 `Is Align Top` 和 `Is Align Bottom`
   - 勾选 `Is Align Left` 和 `Is Align Right`
   - 设置边距（如 Top: 0, Bottom: 0, Left: 0, Right: 0）
4. **点击 Update Alignment**

### 注意事项

- Widget 组件会保持宽高比，但需要确保 Sprite 的 Type 设置正确
- 如果父容器尺寸变化，需要手动调用 `updateAlignment()`

## 方法三：手动代码控制

### 基础实现

```typescript
import { Sprite, UITransform } from 'cc';

/**
 * @description 保持 Sprite 宽高比
 * @param spriteNode Sprite 节点
 * @param targetWidth 目标宽度（可选）
 * @param targetHeight 目标高度（可选）
 * @returns {void}
 */
function keepAspectRatio(
    spriteNode: Node, 
    targetWidth?: number, 
    targetHeight?: number
): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    
    if (!sprite || !transform) return;
    
    // 获取原始尺寸
    const spriteFrame = sprite.spriteFrame;
    if (!spriteFrame) return;
    
    const originalWidth = spriteFrame.width;
    const originalHeight = spriteFrame.height;
    const aspectRatio = originalWidth / originalHeight;
    
    // 根据目标尺寸计算
    if (targetWidth) {
        transform.width = targetWidth;
        transform.height = targetWidth / aspectRatio;
    } else if (targetHeight) {
        transform.height = targetHeight;
        transform.width = targetHeight * aspectRatio;
    }
}
```

### 适配父容器

```typescript
/**
 * @description 适配到父容器，保持宽高比
 * @param spriteNode Sprite 节点
 * @param mode contain（完整显示）或 cover（填充）
 * @returns {void}
 */
function fitToParent(spriteNode: Node, mode: 'contain' | 'cover' = 'contain'): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    const parent = spriteNode.parent;
    
    if (!sprite || !transform || !parent) return;
    
    const spriteFrame = sprite.spriteFrame;
    if (!spriteFrame) return;
    
    const parentTransform = parent.getComponent(UITransform);
    if (!parentTransform) return;
    
    const spriteRatio = spriteFrame.width / spriteFrame.height;
    const parentWidth = parentTransform.width;
    const parentHeight = parentTransform.height;
    const parentRatio = parentWidth / parentHeight;
    
    if (mode === 'contain') {
        // 完整显示，可能留白
        if (spriteRatio > parentRatio) {
            transform.width = parentWidth;
            transform.height = parentWidth / spriteRatio;
        } else {
            transform.height = parentHeight;
            transform.width = parentHeight * spriteRatio;
        }
    } else {
        // 填充，可能裁剪
        if (spriteRatio > parentRatio) {
            transform.height = parentHeight;
            transform.width = parentHeight * spriteRatio;
        } else {
            transform.width = parentWidth;
            transform.height = parentWidth / spriteRatio;
        }
    }
}
```

## 方法四：使用 SpriteFitContainer 组件

### 使用步骤

1. **添加组件**
   - 选中 Sprite 节点
   - 添加 `SpriteFitContainer` 组件

2. **设置参数**
   - Keep Aspect Ratio: 保持宽高比
   - Fit Mode: 
     - `contain`: 完整显示，可能留白
     - `cover`: 填充容器，可能裁剪

## 常见场景

### 场景 1：固定宽度，高度自适应

```typescript
const aspectRatio = spriteNode.getComponent(SpriteAspectRatio);
aspectRatio.mode = 'width';
aspectRatio.targetWidth = 300;
aspectRatio.applyAspectRatio();
```

### 场景 2：固定高度，宽度自适应

```typescript
const aspectRatio = spriteNode.getComponent(SpriteAspectRatio);
aspectRatio.mode = 'height';
aspectRatio.targetHeight = 200;
aspectRatio.applyAspectRatio();
```

### 场景 3：适配父容器（完整显示）

```typescript
const aspectRatio = spriteNode.getComponent(SpriteAspectRatio);
aspectRatio.mode = 'fit';
aspectRatio.applyAspectRatio();
```

### 场景 4：适配屏幕尺寸

```typescript
import { view } from 'cc';

const visibleSize = view.getVisibleSize();
const aspectRatio = spriteNode.getComponent(SpriteAspectRatio);
aspectRatio.fitToSize(visibleSize.width, visibleSize.height);
```

## 注意事项

### 1. Sprite Type 设置
- **SIMPLE**: 基础模式，图片会被拉伸
- **SLICED**: 九宫格模式，中间部分会被拉伸
- **TILED**: 平铺模式
- **FILLED**: 填充模式

**建议**: 如果只需要保持宽高比，使用 SIMPLE 模式即可。

### 2. 锚点设置
- 锚点影响缩放和定位
- 通常使用 `(0.5, 0.5)` 居中锚点

### 3. 父容器影响
- 如果父节点有 Layout 组件，可能会影响子节点尺寸
- 需要根据实际情况调整

### 4. 性能考虑
- 监听屏幕尺寸变化会有性能开销
- 如果不需要实时响应，可以关闭 `listenResize`

## 检查清单

- [ ] 添加了 SpriteAspectRatio 组件或使用 Widget
- [ ] 设置了正确的模式（width/height/fit）
- [ ] Sprite Type 设置为 SIMPLE（除非需要特殊效果）
- [ ] 锚点设置合理（通常 0.5, 0.5）
- [ ] 父节点没有 Layout 组件影响（或已正确配置）
- [ ] 如果需要响应屏幕变化，开启了 listenResize
