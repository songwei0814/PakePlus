import { _decorator, Component, Node, Label, Sprite, Button, Color } from 'cc';
const { ccclass, property } = _decorator;
import { ListItemData } from './dynamic-list';

/**
 * @description 列表项组件示例
 * 用于更新列表项的显示内容
 */
@ccclass('ListItemComponent')
export class ListItemComponent extends Component {
    @property({
        type: Label,
        tooltip: '标题标签'
    })
    titleLabel: Label | null = null;
    
    @property({
        type: Label,
        tooltip: '描述标签'
    })
    descLabel: Label | null = null;
    
    @property({
        type: Sprite,
        tooltip: '图标 Sprite'
    })
    iconSprite: Sprite | null = null;
    
    @property({
        type: Sprite,
        tooltip: '背景 Sprite'
    })
    backgroundSprite: Sprite | null = null;
    
    @property({
        type: Button,
        tooltip: '按钮（可选）'
    })
    button: Button | null = null;
    
    private itemData: ListItemData | null = null;
    private itemIndex: number = -1;
    
    /**
     * @description 更新列表项显示
     * @param data 列表项数据
     * @param index 索引
     * @returns {void}
     */
    updateItem(data: ListItemData, index: number): void {
        this.itemData = data;
        this.itemIndex = index;
        
        // 更新标题
        if (this.titleLabel && data.title !== undefined) {
            this.titleLabel.string = String(data.title);
        }
        
        // 更新描述
        if (this.descLabel && data.desc !== undefined) {
            this.descLabel.string = String(data.desc);
        }
        
        // 更新图标
        if (this.iconSprite && data.icon) {
            // 这里需要根据实际需求加载图片
            // iconSprite.spriteFrame = ...
        }
        
        // 更新背景颜色（根据选中状态等）
        if (this.backgroundSprite) {
            if (data.selected) {
                this.backgroundSprite.color = new Color(200, 200, 255);
            } else {
                this.backgroundSprite.color = new Color(255, 255, 255);
            }
        }
        
        // 绑定按钮事件
        if (this.button) {
            this.button.node.off(Button.EventType.CLICK);
            this.button.node.on(Button.EventType.CLICK, () => {
                this.onItemClick();
            }, this);
        }
    }
    
    /**
     * @description 列表项点击事件
     * @returns {void}
     */
    onItemClick(): void {
        console.log('点击列表项:', this.itemIndex, this.itemData);
        // 触发自定义事件
        this.node.emit('item-click', this.itemData, this.itemIndex);
    }
    
    /**
     * @description 获取列表项数据
     * @returns {ListItemData | null} 列表项数据
     */
    getData(): ListItemData | null {
        return this.itemData;
    }
    
    /**
     * @description 获取索引
     * @returns {number} 索引
     */
    getIndex(): number {
        return this.itemIndex;
    }
}
