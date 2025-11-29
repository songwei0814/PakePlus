# Cocos Creator 弹窗制作指南（带遮罩层）

## 方法一：使用 ModalDialog 组件（推荐）

### 步骤 1：创建节点结构

在层级管理器中创建以下结构：

```
Canvas
└── Dialog（弹窗根节点）
    ├── Mask（遮罩层）
    │   └── Sprite 组件（半透明背景）
    └── Content（弹窗内容）
        ├── Background（弹窗背景）
        ├── Title（标题）
        ├── CloseButton（关闭按钮）
        └── ...（其他内容）
```

### 步骤 2：设置遮罩层（Mask）

1. **选中 Mask 节点**
2. **添加 Sprite 组件**
   - 添加组件 → 渲染组件 → Sprite
   - Type: SIMPLE
   - Color: 设置为半透明黑色（如：R:0, G:0, B:0, A:180）

3. **添加 UITransform 组件**
   - Width: 2000（足够大，覆盖整个屏幕）
   - Height: 2000
   - Anchor: (0.5, 0.5) 居中

4. **设置位置**
   - Position: (0, 0, 0)

### 步骤 3：设置弹窗内容（Content）

1. **选中 Content 节点**
2. **添加 UITransform 组件**
   - 设置合适的尺寸（如：Width: 600, Height: 400）
   - Anchor: (0.5, 0.5) 居中

3. **添加背景**
   - 可以添加 Sprite 组件作为背景
   - 或使用 Layout 组件布局

### 步骤 4：添加 ModalDialog 组件

1. **选中 Dialog 根节点**
2. **添加组件**
   - 添加组件 → 自定义脚本 → ModalDialog

3. **设置属性**
   - Mask Node: 拖入 Mask 节点
   - Content Node: 拖入 Content 节点
   - Close On Mask: ✓（点击遮罩层关闭）
   - Use Animation: ✓（使用动画）
   - Animation Duration: 0.3（动画时长）
   - Mask Color: (0, 0, 0, 180)（遮罩层颜色）

### 步骤 5：添加关闭按钮

1. **在 Content 节点下创建 CloseButton**
2. **添加 Button 组件**
3. **在代码中绑定关闭事件**：

```typescript
import { Button } from 'cc';

const closeButton = closeButtonNode.getComponent(Button);
closeButton.node.on(Button.EventType.CLICK, () => {
    const dialog = dialogNode.getComponent('ModalDialog');
    dialog.hide();
});
```

## 方法二：编辑器快速创建

### 使用预制体模板

1. **创建弹窗预制体**
   - 按照上面的结构创建节点
   - 拖到资源管理器创建预制体

2. **使用 DialogManager 管理**

```typescript
import { DialogManager } from './dialog-manager';

const dialogManager = this.node.getComponent(DialogManager);
dialogManager.showDialogFromPrefab(dialogPrefab);
```

## 方法三：纯代码创建

### 动态创建弹窗

```typescript
import { Node, Sprite, UITransform, Color } from 'cc';
import { ModalDialog } from './modal-dialog';

/**
 * @description 动态创建弹窗
 */
function createDialog(parent: Node): Node {
    // 创建根节点
    const dialogNode = new Node('Dialog');
    dialogNode.setParent(parent);
    
    // 创建遮罩层
    const maskNode = new Node('Mask');
    maskNode.setParent(dialogNode);
    const maskSprite = maskNode.addComponent(Sprite);
    const maskTransform = maskNode.addComponent(UITransform);
    maskSprite.color = new Color(0, 0, 0, 180);
    maskTransform.width = 2000;
    maskTransform.height = 2000;
    maskNode.setAnchorPoint(0.5, 0.5);
    maskNode.setPosition(0, 0, 0);
    
    // 创建内容节点
    const contentNode = new Node('Content');
    contentNode.setParent(dialogNode);
    const contentTransform = contentNode.addComponent(UITransform);
    contentTransform.width = 600;
    contentTransform.height = 400;
    contentNode.setAnchorPoint(0.5, 0.5);
    contentNode.setPosition(0, 0, 0);
    
    // 添加 ModalDialog 组件
    const modalDialog = dialogNode.addComponent(ModalDialog);
    modalDialog.maskNode = maskNode;
    modalDialog.contentNode = contentNode;
    
    return dialogNode;
}
```

## 使用示例

### 示例 1：打开弹窗

```typescript
import { Button } from 'cc';

// 在按钮点击事件中
onButtonClick() {
    const dialog = this.dialogNode.getComponent('ModalDialog');
    dialog.show();
}
```

### 示例 2：关闭弹窗

```typescript
// 方法 1：通过组件
const dialog = this.dialogNode.getComponent('ModalDialog');
dialog.hide();

// 方法 2：通过 DialogManager
const dialogManager = this.node.getComponent('DialogManager');
dialogManager.hideDialog();
```

### 示例 3：切换显示/隐藏

```typescript
const dialog = this.dialogNode.getComponent('ModalDialog');
dialog.toggle();
```

## 弹窗样式建议

### 遮罩层样式

- **颜色**：半透明黑色 `(0, 0, 0, 180)` 或 `rgba(0, 0, 0, 0.7)`
- **尺寸**：足够大覆盖整个屏幕（2000 × 2000）
- **层级**：在弹窗内容下方

### 弹窗内容样式

- **背景**：白色或浅色，带圆角（使用九宫格图片）
- **尺寸**：根据内容调整（常见：600 × 400）
- **位置**：屏幕居中
- **层级**：在遮罩层上方

## 动画效果

### 缩放动画（默认）

- 显示：从 0 缩放到 1（backOut 缓动）
- 隐藏：从 1 缩放到 0（backIn 缓动）

### 淡入淡出

遮罩层支持淡入淡出效果（自动实现）

### 自定义动画

可以修改 `ModalDialog` 组件中的动画代码，实现：
- 滑入滑出
- 旋转进入
- 弹性效果

## 注意事项

1. **层级顺序**：确保遮罩层在内容层下方
2. **点击穿透**：遮罩层需要接收点击事件
3. **性能优化**：弹窗隐藏时设置为 `active = false`
4. **多弹窗管理**：使用 DialogManager 避免同时显示多个弹窗

## 检查清单

- [ ] 创建了 Dialog 根节点
- [ ] 创建了 Mask 遮罩层节点
- [ ] 创建了 Content 内容节点
- [ ] Mask 节点有 Sprite 组件和 UITransform 组件
- [ ] Content 节点有 UITransform 组件
- [ ] Dialog 节点添加了 ModalDialog 组件
- [ ] 设置了 Mask Node 和 Content Node 引用
- [ ] 添加了关闭按钮（可选）
- [ ] 测试了显示/隐藏功能
