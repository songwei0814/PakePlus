import { _decorator, Component, Node, Prefab, instantiate, ScrollView, Layout, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 列表项数据接口
 */
export interface ListItemData {
    id?: string | number;
    [key: string]: any;
}

/**
 * @description 列表样式配置
 */
export interface ListStyle {
    itemHeight?: number; // 列表项高度
    spacing?: number; // 列表项间距
    paddingTop?: number; // 顶部内边距
    paddingBottom?: number; // 底部内边距
    paddingLeft?: number; // 左侧内边距
    paddingRight?: number; // 右侧内边距
}

/**
 * @description 动态列表组件
 * 根据数据动态渲染列表项，支持自定义样式
 */
@ccclass('DynamicList')
export class DynamicList extends Component {
    @property({
        type: Prefab,
        tooltip: '列表项预制体'
    })
    itemPrefab: Prefab | null = null;
    
    @property({
        type: Node,
        tooltip: '列表容器节点（ScrollView 的 Content 节点）'
    })
    contentNode: Node | null = null;
    
    @property({
        type: ScrollView,
        tooltip: '滚动视图组件（可选，如果 contentNode 在 ScrollView 中）'
    })
    scrollView: ScrollView | null = null;
    
    @property({
        tooltip: '列表项高度（像素）'
    })
    itemHeight: number = 100;
    
    @property({
        tooltip: '列表项间距（像素）'
    })
    spacing: number = 10;
    
    @property({
        tooltip: '顶部内边距'
    })
    paddingTop: number = 0;
    
    @property({
        tooltip: '底部内边距'
    })
    paddingBottom: number = 0;
    
    @property({
        tooltip: '左侧内边距'
    })
    paddingLeft: number = 0;
    
    @property({
        tooltip: '右侧内边距'
    })
    paddingRight: number = 0;
    
    private dataList: ListItemData[] = [];
    private itemNodes: Node[] = [];
    private itemUpdateCallbacks: Map<Node, (data: ListItemData, index: number) => void> = new Map();
    
    onLoad() {
        this.initList();
    }
    
    /**
     * @description 初始化列表
     * @returns {void}
     */
    initList(): void {
        // 如果没有指定 contentNode，尝试自动查找
        if (!this.contentNode) {
            // 尝试查找 ScrollView
            if (!this.scrollView) {
                this.scrollView = this.getComponent(ScrollView);
            }
            
            if (this.scrollView) {
                this.contentNode = this.scrollView.content;
            } else {
                // 使用当前节点
                this.contentNode = this.node;
            }
        }
        
        if (!this.contentNode) {
            console.error('[DynamicList] 未找到列表容器节点');
            return;
        }
        
        // 设置 Layout 组件
        this.setupLayout();
    }
    
    /**
     * @description 设置 Layout 组件
     * @returns {void}
     */
    setupLayout(): void {
        if (!this.contentNode) return;
        
        let layout = this.contentNode.getComponent(Layout);
        if (!layout) {
            layout = this.contentNode.addComponent(Layout);
        }
        
        // 垂直布局
        layout.type = Layout.Type.VERTICAL;
        layout.spacingY = this.spacing;
        layout.paddingTop = this.paddingTop;
        layout.paddingBottom = this.paddingBottom;
        layout.paddingLeft = this.paddingLeft;
        layout.paddingRight = this.paddingRight;
        
        // 启用布局
        layout.enabled = true;
    }
    
    /**
     * @description 设置列表数据并渲染
     * @param dataList 数据列表
     * @param updateCallback 更新回调函数，用于更新列表项显示
     * @returns {void}
     */
    setData(
        dataList: ListItemData[], 
        updateCallback?: (itemNode: Node, data: ListItemData, index: number) => void
    ): void {
        if (!this.contentNode) {
            console.error('[DynamicList] 列表容器节点未设置');
            return;
        }
        
        // 清空现有列表项
        this.clearItems();
        
        // 保存数据
        this.dataList = dataList || [];
        
        // 创建列表项
        this.dataList.forEach((data, index) => {
            const itemNode = this.createItem(data, index);
            if (itemNode) {
                this.itemNodes.push(itemNode);
                
                // 调用更新回调
                if (updateCallback) {
                    updateCallback(itemNode, data, index);
                }
            }
        });
        
        // 更新容器尺寸
        this.updateContentSize();
    }
    
    /**
     * @description 创建列表项
     * @param data 列表项数据
     * @param index 索引
     * @returns {Node} 创建的列表项节点
     */
    createItem(data: ListItemData, index: number): Node | null {
        if (!this.contentNode) return null;
        
        let itemNode: Node;
        
        if (this.itemPrefab) {
            // 使用预制体
            itemNode = instantiate(this.itemPrefab);
        } else {
            // 创建默认节点
            itemNode = new Node(`Item_${index}`);
            const transform = itemNode.addComponent(UITransform);
            transform.width = 300;
            transform.height = this.itemHeight;
        }
        
        // 设置父节点
        itemNode.setParent(this.contentNode);
        
        // 设置列表项高度
        const transform = itemNode.getComponent(UITransform);
        if (transform) {
            transform.height = this.itemHeight;
        }
        
        // 保存数据到节点
        (itemNode as any).listItemData = data;
        (itemNode as any).listItemIndex = index;
        
        return itemNode;
    }
    
    /**
     * @description 更新列表项
     * @param index 索引
     * @param data 新数据
     * @param updateCallback 更新回调
     * @returns {void}
     */
    updateItem(
        index: number, 
        data: ListItemData,
        updateCallback?: (itemNode: Node, data: ListItemData, index: number) => void
    ): void {
        if (index < 0 || index >= this.itemNodes.length) {
            console.warn(`[DynamicList] 索引 ${index} 超出范围`);
            return;
        }
        
        const itemNode = this.itemNodes[index];
        this.dataList[index] = data;
        
        // 更新节点数据
        (itemNode as any).listItemData = data;
        (itemNode as any).listItemIndex = index;
        
        // 调用更新回调
        if (updateCallback) {
            updateCallback(itemNode, data, index);
        } else {
            // 使用保存的回调
            const callback = this.itemUpdateCallbacks.get(itemNode);
            if (callback) {
                callback(data, index);
            }
        }
    }
    
    /**
     * @description 添加列表项
     * @param data 数据
     * @param index 插入位置（可选，默认添加到末尾）
     * @param updateCallback 更新回调
     * @returns {void}
     */
    addItem(
        data: ListItemData, 
        index?: number,
        updateCallback?: (itemNode: Node, data: ListItemData, index: number) => void
    ): void {
        if (index === undefined || index < 0 || index >= this.dataList.length) {
            // 添加到末尾
            this.dataList.push(data);
            const itemNode = this.createItem(data, this.dataList.length - 1);
            if (itemNode) {
                this.itemNodes.push(itemNode);
                if (updateCallback) {
                    updateCallback(itemNode, data, this.dataList.length - 1);
                }
            }
        } else {
            // 插入到指定位置
            this.dataList.splice(index, 0, data);
            // 重新渲染（简单方式）
            this.setData(this.dataList, updateCallback);
        }
        
        this.updateContentSize();
    }
    
    /**
     * @description 删除列表项
     * @param index 索引
     * @returns {void}
     */
    removeItem(index: number): void {
        if (index < 0 || index >= this.itemNodes.length) {
            console.warn(`[DynamicList] 索引 ${index} 超出范围`);
            return;
        }
        
        const itemNode = this.itemNodes[index];
        itemNode.destroy();
        
        this.itemNodes.splice(index, 1);
        this.dataList.splice(index, 1);
        
        // 更新索引
        this.itemNodes.forEach((node, i) => {
            (node as any).listItemIndex = i;
        });
        
        this.updateContentSize();
    }
    
    /**
     * @description 清空列表
     * @returns {void}
     */
    clearItems(): void {
        this.itemNodes.forEach(node => node.destroy());
        this.itemNodes = [];
        this.dataList = [];
        this.itemUpdateCallbacks.clear();
        
        if (this.contentNode) {
            const transform = this.contentNode.getComponent(UITransform);
            if (transform) {
                transform.height = 0;
            }
        }
    }
    
    /**
     * @description 更新容器尺寸
     * @returns {void}
     */
    updateContentSize(): void {
        if (!this.contentNode) return;
        
        const layout = this.contentNode.getComponent(Layout);
        if (layout) {
            // Layout 会自动计算，但需要手动更新
            layout.updateLayout();
        }
        
        // 计算总高度
        const totalHeight = this.paddingTop + 
                           this.paddingBottom + 
                           (this.itemHeight + this.spacing) * this.dataList.length - 
                           this.spacing;
        
        const transform = this.contentNode.getComponent(UITransform);
        if (transform) {
            transform.height = Math.max(totalHeight, 0);
        }
    }
    
    /**
     * @description 设置列表样式
     * @param style 样式配置
     * @returns {void}
     */
    setStyle(style: ListStyle): void {
        if (style.itemHeight !== undefined) {
            this.itemHeight = style.itemHeight;
        }
        if (style.spacing !== undefined) {
            this.spacing = style.spacing;
        }
        if (style.paddingTop !== undefined) {
            this.paddingTop = style.paddingTop;
        }
        if (style.paddingBottom !== undefined) {
            this.paddingBottom = style.paddingBottom;
        }
        if (style.paddingLeft !== undefined) {
            this.paddingLeft = style.paddingLeft;
        }
        if (style.paddingRight !== undefined) {
            this.paddingRight = style.paddingRight;
        }
        
        // 更新 Layout
        this.setupLayout();
        
        // 更新现有列表项高度
        this.itemNodes.forEach(node => {
            const transform = node.getComponent(UITransform);
            if (transform) {
                transform.height = this.itemHeight;
            }
        });
        
        // 更新容器尺寸
        this.updateContentSize();
    }
    
    /**
     * @description 滚动到指定索引
     * @param index 索引
     * @returns {void}
     */
    scrollToIndex(index: number): void {
        if (!this.scrollView || index < 0 || index >= this.itemNodes.length) {
            return;
        }
        
        const itemNode = this.itemNodes[index];
        const itemTransform = itemNode.getComponent(UITransform);
        if (!itemTransform) return;
        
        // 计算目标位置
        let targetY = this.paddingTop;
        for (let i = 0; i < index; i++) {
            targetY += this.itemHeight + this.spacing;
        }
        targetY += this.itemHeight / 2;
        
        // 滚动到目标位置
        this.scrollView.scrollToOffset(new Vec3(0, -targetY, 0), 0.3);
    }
    
    /**
     * @description 获取列表项节点
     * @param index 索引
     * @returns {Node | null} 列表项节点
     */
    getItemNode(index: number): Node | null {
        if (index < 0 || index >= this.itemNodes.length) {
            return null;
        }
        return this.itemNodes[index];
    }
    
    /**
     * @description 获取列表项数据
     * @param index 索引
     * @returns {ListItemData | null} 列表项数据
     */
    getItemData(index: number): ListItemData | null {
        if (index < 0 || index >= this.dataList.length) {
            return null;
        }
        return this.dataList[index];
    }
}
