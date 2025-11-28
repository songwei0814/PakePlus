# Sprite 固定宽高比，不受屏幕尺寸影响

## 方法一：编辑器直接设置（最简单）

### 步骤：

1. **选中 Sprite 节点**
2. **查看图片原始尺寸**：
   - 在资源管理器中选中图片
   - 查看 Width 和 Height（例如：500 × 300）
3. **计算宽高比**：
   - 宽高比 = 500 ÷ 300 = 1.667
4. **设置固定尺寸**：
   - 在 UITransform 组件中：
     - Width: 200（固定宽度）
     - Height: 200 ÷ 1.667 = 120（固定高度）
5. **移除可能影响尺寸的组件**：
   - 如果有 Widget 组件，**禁用或删除**
   - 检查父节点是否有 Layout 组件

### 注意事项：

- ✅ 直接设置 Width 和 Height 为固定值
- ❌ 不要使用 Widget 组件
- ❌ 不要使用 Layout 组件（在父节点上）
- ❌ 不要使用适配相关的组件

## 方法二：使用 FixedAspectRatioSprite 组件

### 步骤：

1. **将脚本添加到项目**
   - 复制 `fixed-aspect-ratio-sprite.ts` 到 `assets/scripts` 目录
   - 在 Cocos Creator 中刷新资源

2. **添加组件**
   - 选中 Sprite 节点
   - 添加组件 → 自定义脚本 → `FixedAspectRatioSprite`

3. **设置属性**
   - Fixed Width: 200（固定宽度，像素）
   - Fixed Height: 0（如果为0，则根据宽高比自动计算）
   - Auto Apply: ✓（自动应用）

### 代码示例：

```typescript
// 获取组件
const fixedSprite = spriteNode.getComponent(FixedAspectRatioSprite);

// 设置固定宽度 200px
fixedSprite.setFixedWidth(200);

// 设置固定高度 150px
fixedSprite.setFixedHeight(150);
```

## 方法三：纯代码控制（不需要组件）

### 在组件的 onLoad 中：

```typescript
import { _decorator, Component, Node, Sprite, UITransform, Widget } from 'cc';
const { ccclass } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
    onLoad() {
        const sprite = this.node.getComponent(Sprite);
        const transform = this.node.getComponent(UITransform);
        
        if (!sprite || !sprite.spriteFrame || !transform) {
            return;
        }
        
        // 1. 禁用 Widget 组件（如果存在）
        const widget = this.node.getComponent(Widget);
        if (widget) {
            widget.enabled = false;
        }
        
        // 2. 获取原始宽高比
        const spriteFrame = sprite.spriteFrame;
        const aspectRatio = spriteFrame.width / spriteFrame.height;
        
        // 3. 设置固定尺寸（例如：固定宽度 200px）
        const fixedWidth = 200;
        transform.width = fixedWidth;
        transform.height = fixedWidth / aspectRatio;
        
        // 或者固定高度
        // const fixedHeight = 150;
        // transform.height = fixedHeight;
        // transform.width = fixedHeight * aspectRatio;
    }
}
```

## 方法四：使用工具函数

```typescript
import { Node, Sprite, UITransform, Widget } from 'cc';

/**
 * @description 设置 Sprite 固定尺寸，保持宽高比
 * @param spriteNode Sprite 节点
 * @param fixedWidth 固定宽度（像素），如果为0则使用 fixedHeight
 * @param fixedHeight 固定高度（像素），如果为0则使用 fixedWidth
 * @returns {void}
 */
export function setFixedSpriteSize(
    spriteNode: Node, 
    fixedWidth: number = 0, 
    fixedHeight: number = 0
): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    
    if (!sprite || !sprite.spriteFrame || !transform) {
        console.error('缺少必要组件');
        return;
    }
    
    // 禁用 Widget 组件
    const widget = spriteNode.getComponent(Widget);
    if (widget) {
        widget.enabled = false;
    }
    
    // 计算宽高比
    const spriteFrame = sprite.spriteFrame;
    const aspectRatio = spriteFrame.width / spriteFrame.height;
    
    // 设置固定尺寸
    if (fixedWidth > 0) {
        transform.width = fixedWidth;
        transform.height = fixedWidth / aspectRatio;
    } else if (fixedHeight > 0) {
        transform.height = fixedHeight;
        transform.width = fixedHeight * aspectRatio;
    } else {
        console.error('必须指定 fixedWidth 或 fixedHeight');
    }
}

// 使用示例
setFixedSpriteSize(spriteNode, 200, 0); // 固定宽度 200px
setFixedSpriteSize(spriteNode, 0, 150); // 固定高度 150px
```

## 关键点总结

### ✅ 要做的事情：

1. **直接设置 UITransform 的 width 和 height 为固定值**
2. **禁用或移除 Widget 组件**（如果存在）
3. **检查父节点是否有 Layout 组件**（可能影响子节点）
4. **使用图片原始尺寸计算宽高比**

### ❌ 不要做的事情：

1. ❌ **不要使用 Widget 组件**（会自动适配）
2. ❌ **不要使用 Layout 组件**（会自动布局）
3. ❌ **不要在代码中响应屏幕尺寸变化**
4. ❌ **不要使用适配相关的组件或方法**

## 检查清单

- [ ] UITransform 的 Width 和 Height 设置为固定值（像素）
- [ ] 已禁用或移除 Widget 组件
- [ ] 父节点没有 Layout 组件（或已禁用）
- [ ] 宽高比计算正确（原始宽度 ÷ 原始高度）
- [ ] 尺寸不会在运行时被其他代码修改

## 常见问题

### Q: 设置了固定尺寸，但还是会变化？
A: 检查是否有 Widget、Layout 或其他适配组件在影响。确保这些组件被禁用或移除。

### Q: 如何确保不受 Canvas 适配影响？
A: 固定尺寸是相对于父节点的，如果父节点尺寸变化，子节点位置可能变化，但尺寸不会变。如果需要完全固定，确保父节点也是固定尺寸。

### Q: 多个 Sprite 需要统一尺寸怎么办？
A: 使用相同的固定宽度或高度值，或者创建一个统一的配置。
