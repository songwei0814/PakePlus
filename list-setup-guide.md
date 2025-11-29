# Cocos Creator 动态列表制作指南

## 快速开始（5 步）

### 步骤 1：创建节点结构

在层级管理器中创建：

```
Canvas
└── ScrollView（滚动视图）
    └── Content（内容容器，ScrollView 的 content）
        └── （列表项会动态添加到这里）
```

### 步骤 2：设置 ScrollView

1. **选中 ScrollView 节点**
2. **添加 ScrollView 组件**（如果还没有）
   - 添加组件 → UI → ScrollView
3. **设置属性**：
   - Content: 拖入 Content 节点
   - Horizontal: false（垂直滚动）
   - Vertical: true

### 步骤 3：设置 Content 节点

1. **选中 Content 节点**
2. **添加 UITransform 组件**
   - Width: 与 ScrollView 相同
   - Height: 0（会动态计算）

### 步骤 4：创建列表项预制体

1. **创建列表项节点结构**：
   ```
   ListItem（列表项根节点）
   ├── Background（背景，Sprite）
   ├── Title（标题，Label）
   ├── Desc（描述，Label，可选）
   └── Icon（图标，Sprite，可选）
   ```

2. **设置列表项**：
   - UITransform: Width 填满，Height 100（示例）
   - 添加 ListItemComponent 组件（可选）

3. **创建预制体**：
   - 将节点拖到资源管理器

### 步骤 5：添加 DynamicList 组件

1. **选中 ScrollView 或 Content 节点**
2. **添加组件** → 自定义脚本 → DynamicList
3. **设置属性**：
   - Item Prefab: 拖入列表项预制体
   - Content Node: 拖入 Content 节点
   - Scroll View: 拖入 ScrollView 组件
   - Item Height: 100
   - Spacing: 10

## 使用代码

### 基础使用

```typescript
import { DynamicList, ListItemData } from './dynamic-list';

// 获取组件
const dynamicList = this.node.getComponent(DynamicList);

// 准备数据
const dataList: ListItemData[] = [
    { id: 1, title: '标题1', desc: '描述1' },
    { id: 2, title: '标题2', desc: '描述2' },
    { id: 3, title: '标题3', desc: '描述3' },
];

// 设置数据并渲染
dynamicList.setData(dataList, (itemNode, data, index) => {
    // 更新列表项显示
    const titleLabel = itemNode.getChildByName('Title')?.getComponent('Label');
    if (titleLabel) {
        titleLabel.string = data.title;
    }
});
```

### 使用 ListItemComponent

```typescript
// 在列表项预制体上添加 ListItemComponent 组件
// 然后在更新回调中使用
dynamicList.setData(dataList, (itemNode, data, index) => {
    const itemComponent = itemNode.getComponent(ListItemComponent);
    if (itemComponent) {
        itemComponent.updateItem(data, index);
    }
});
```

### 设置样式

```typescript
import { ListStyle } from './dynamic-list';

const style: ListStyle = {
    itemHeight: 120,      // 列表项高度
    spacing: 15,          // 间距
    paddingTop: 20,       // 顶部内边距
    paddingBottom: 20,    // 底部内边距
    paddingLeft: 10,      // 左侧内边距
    paddingRight: 10      // 右侧内边距
};

dynamicList.setStyle(style);
```

## 高级功能

### 添加列表项

```typescript
const newItem: ListItemData = {
    id: 4,
    title: '新项',
    desc: '新添加的项'
};

dynamicList.addItem(newItem, undefined, (itemNode, data, index) => {
    // 更新显示
});
```

### 删除列表项

```typescript
dynamicList.removeItem(0); // 删除第一个
```

### 更新列表项

```typescript
const newData: ListItemData = {
    id: 1,
    title: '更新后的标题',
    desc: '更新后的描述'
};

dynamicList.updateItem(0, newData, (itemNode, data, index) => {
    // 更新显示
});
```

### 滚动到指定项

```typescript
dynamicList.scrollToIndex(5); // 滚动到第 6 项
```

### 清空列表

```typescript
dynamicList.clearItems();
```

## 列表项样式设置

### 方法 1：在预制体中设置

1. 在列表项预制体中设置背景、字体、颜色等
2. 通过 ListItemComponent 动态更新

### 方法 2：在代码中动态设置

```typescript
dynamicList.setData(dataList, (itemNode, data, index) => {
    // 设置背景颜色
    const bgSprite = itemNode.getComponent('Sprite');
    if (bgSprite) {
        if (index % 2 === 0) {
            bgSprite.color = new Color(240, 240, 240); // 浅灰
        } else {
            bgSprite.color = new Color(255, 255, 255); // 白色
        }
    }
    
    // 设置字体颜色
    const titleLabel = itemNode.getChildByName('Title')?.getComponent('Label');
    if (titleLabel) {
        if (data.selected) {
            titleLabel.color = new Color(0, 100, 255); // 蓝色
        } else {
            titleLabel.color = new Color(0, 0, 0); // 黑色
        }
    }
});
```

### 方法 3：使用样式配置

```typescript
// 创建样式配置对象
const itemStyles = {
    normal: {
        bgColor: new Color(255, 255, 255),
        textColor: new Color(0, 0, 0)
    },
    selected: {
        bgColor: new Color(200, 200, 255),
        textColor: new Color(0, 100, 255)
    },
    highlight: {
        bgColor: new Color(255, 255, 200),
        textColor: new Color(255, 100, 0)
    }
};

// 应用样式
dynamicList.setData(dataList, (itemNode, data, index) => {
    const style = data.selected ? itemStyles.selected : itemStyles.normal;
    
    const bgSprite = itemNode.getComponent('Sprite');
    if (bgSprite) {
        bgSprite.color = style.bgColor;
    }
    
    const titleLabel = itemNode.getChildByName('Title')?.getComponent('Label');
    if (titleLabel) {
        titleLabel.color = style.textColor;
    }
});
```

## 完整示例

### 示例 1：简单文本列表

```typescript
import { _decorator, Component, Node } from 'cc';
import { DynamicList, ListItemData } from './dynamic-list';

@ccclass('SimpleList')
export class SimpleList extends Component {
    private dynamicList: DynamicList | null = null;
    
    onLoad() {
        this.dynamicList = this.node.getComponent(DynamicList);
        
        const data: ListItemData[] = [
            { title: '项目 1' },
            { title: '项目 2' },
            { title: '项目 3' },
        ];
        
        this.dynamicList?.setData(data, (itemNode, data, index) => {
            const label = itemNode.getChildByName('Label')?.getComponent('Label');
            if (label) {
                label.string = data.title;
            }
        });
    }
}
```

### 示例 2：复杂列表（带图标、按钮）

```typescript
import { _decorator, Component, Node, Button } from 'cc';
import { DynamicList, ListItemData } from './dynamic-list';

@ccclass('ComplexList')
export class ComplexList extends Component {
    private dynamicList: DynamicList | null = null;
    
    onLoad() {
        this.dynamicList = this.node.getComponent(DynamicList);
        
        const data: ListItemData[] = [
            { id: 1, title: '标题1', desc: '描述1', icon: 'icon1', buttonText: '操作' },
            { id: 2, title: '标题2', desc: '描述2', icon: 'icon2', buttonText: '操作' },
        ];
        
        this.dynamicList?.setData(data, (itemNode, data, index) => {
            // 更新标题
            const titleLabel = itemNode.getChildByName('Title')?.getComponent('Label');
            if (titleLabel) titleLabel.string = data.title;
            
            // 更新描述
            const descLabel = itemNode.getChildByName('Desc')?.getComponent('Label');
            if (descLabel) descLabel.string = data.desc;
            
            // 绑定按钮
            const button = itemNode.getChildByName('Button')?.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, () => {
                    console.log('点击了按钮:', data.id);
                });
            }
        });
    }
}
```

## 性能优化建议

1. **使用对象池**：对于大量数据，考虑使用对象池复用列表项
2. **虚拟列表**：如果数据量很大（>1000），考虑实现虚拟列表
3. **按需加载**：图片等资源按需加载
4. **避免频繁更新**：批量更新数据而不是逐个更新

## 检查清单

- [ ] 创建了 ScrollView 和 Content 节点
- [ ] ScrollView 组件已配置
- [ ] Content 节点有 UITransform 组件
- [ ] 创建了列表项预制体
- [ ] 添加了 DynamicList 组件
- [ ] 设置了 Item Prefab 和 Content Node
- [ ] 测试了数据渲染
- [ ] 测试了样式设置
