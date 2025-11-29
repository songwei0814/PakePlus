import { _decorator, Component, Node, Prefab, Button } from 'cc';
const { ccclass, property } = _decorator;
import { DynamicList, ListItemData, ListStyle } from './dynamic-list';
import { ListItemComponent } from './list-item-component';

/**
 * @description 动态列表使用示例
 */
@ccclass('ListUsageExample')
export class ListUsageExample extends Component {
    @property({
        type: DynamicList,
        tooltip: '动态列表组件'
    })
    dynamicList: DynamicList | null = null;
    
    @property({
        type: Prefab,
        tooltip: '列表项预制体'
    })
    itemPrefab: Prefab | null = null;
    
    @property({
        type: Button,
        tooltip: '刷新列表按钮'
    })
    refreshButton: Button | null = null;
    
    private testData: ListItemData[] = [];
    
    onLoad() {
        // 初始化测试数据
        this.initTestData();
        
        // 绑定按钮事件
        if (this.refreshButton) {
            this.refreshButton.node.on(Button.EventType.CLICK, this.refreshList, this);
        }
        
        // 初始化列表
        if (this.dynamicList) {
            this.dynamicList.setData(this.testData, this.updateListItem.bind(this));
            
            // 设置样式
            const style: ListStyle = {
                itemHeight: 100,
                spacing: 10,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10
            };
            this.dynamicList.setStyle(style);
        }
    }
    
    /**
     * @description 初始化测试数据
     * @returns {void}
     */
    initTestData(): void {
        this.testData = [
            { id: 1, title: '列表项 1', desc: '这是第一个列表项的描述', icon: 'icon1' },
            { id: 2, title: '列表项 2', desc: '这是第二个列表项的描述', icon: 'icon2' },
            { id: 3, title: '列表项 3', desc: '这是第三个列表项的描述', icon: 'icon3' },
            { id: 4, title: '列表项 4', desc: '这是第四个列表项的描述', icon: 'icon4' },
            { id: 5, title: '列表项 5', desc: '这是第五个列表项的描述', icon: 'icon5' },
        ];
    }
    
    /**
     * @description 更新列表项显示
     * @param itemNode 列表项节点
     * @param data 数据
     * @param index 索引
     * @returns {void}
     */
    updateListItem(itemNode: Node, data: ListItemData, index: number): void {
        // 方法 1：使用 ListItemComponent
        const itemComponent = itemNode.getComponent(ListItemComponent);
        if (itemComponent) {
            itemComponent.updateItem(data, index);
        } else {
            // 方法 2：手动更新节点
            this.updateItemManually(itemNode, data, index);
        }
        
        // 绑定点击事件
        itemNode.on('item-click', this.onListItemClick, this);
    }
    
    /**
     * @description 手动更新列表项
     * @param itemNode 列表项节点
     * @param data 数据
     * @param index 索引
     * @returns {void}
     */
    updateItemManually(itemNode: Node, data: ListItemData, index: number): void {
        // 查找子节点并更新
        const titleLabel = itemNode.getChildByName('Title')?.getComponent('Label');
        if (titleLabel && data.title) {
            titleLabel.string = String(data.title);
        }
        
        const descLabel = itemNode.getChildByName('Desc')?.getComponent('Label');
        if (descLabel && data.desc) {
            descLabel.string = String(data.desc);
        }
        
        // 根据索引设置不同背景色
        const bgSprite = itemNode.getComponent('Sprite');
        if (bgSprite) {
            if (index % 2 === 0) {
                bgSprite.color = new Color(240, 240, 240);
            } else {
                bgSprite.color = new Color(255, 255, 255);
            }
        }
    }
    
    /**
     * @description 列表项点击事件
     * @param data 数据
     * @param index 索引
     * @returns {void}
     */
    onListItemClick(data: ListItemData, index: number): void {
        console.log('点击了列表项:', index, data);
        // 处理点击逻辑
    }
    
    /**
     * @description 刷新列表
     * @returns {void}
     */
    refreshList(): void {
        if (!this.dynamicList) return;
        
        // 重新生成测试数据
        this.initTestData();
        
        // 更新列表
        this.dynamicList.setData(this.testData, this.updateListItem.bind(this));
    }
    
    /**
     * @description 添加新项
     * @returns {void}
     */
    addNewItem(): void {
        if (!this.dynamicList) return;
        
        const newItem: ListItemData = {
            id: this.testData.length + 1,
            title: `新列表项 ${this.testData.length + 1}`,
            desc: '新添加的列表项',
            icon: 'new-icon'
        };
        
        this.dynamicList.addItem(newItem, undefined, this.updateListItem.bind(this));
        this.testData.push(newItem);
    }
    
    /**
     * @description 删除指定项
     * @param index 索引
     * @returns {void}
     */
    removeItem(index: number): void {
        if (!this.dynamicList) return;
        
        this.dynamicList.removeItem(index);
        this.testData.splice(index, 1);
    }
    
    /**
     * @description 更改列表样式
     * @returns {void}
     */
    changeStyle(): void {
        if (!this.dynamicList) return;
        
        const newStyle: ListStyle = {
            itemHeight: 120,
            spacing: 15,
            paddingTop: 30,
            paddingBottom: 30,
            paddingLeft: 20,
            paddingRight: 20
        };
        
        this.dynamicList.setStyle(newStyle);
    }
}
