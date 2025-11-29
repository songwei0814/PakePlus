import { _decorator, Component, Node, Label, Sprite, UITransform, Vec3, Layout, Widget } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 文字叠加在图片上的组件
 * 使用 Layout 或 Widget 组件实现自动对齐
 */
@ccclass('TextOnImage')
export class TextOnImage extends Component {
    @property({
        tooltip: '是否使用 Widget 组件对齐（推荐）'
    })
    useWidget: boolean = true;
    
    @property({
        tooltip: '是否使用 Layout 组件对齐'
    })
    useLayout: boolean = false;
    
    onLoad() {
        this.setupTextAlignment();
    }
    
    /**
     * @description 设置文字对齐
     * @returns {void}
     */
    setupTextAlignment(): void {
        const textNode = this.node.getChildByName('Label') || 
                        this.node.getComponentsInChildren(Label)[0]?.node;
        
        if (!textNode) {
            console.warn('[TextOnImage] 未找到文字节点');
            return;
        }
        
        if (this.useWidget) {
            this.setupWidgetAlignment(textNode);
        } else if (this.useLayout) {
            this.setupLayoutAlignment(textNode);
        }
    }
    
    /**
     * @description 使用 Widget 组件对齐
     * @param textNode 文字节点
     * @returns {void}
     */
    setupWidgetAlignment(textNode: Node): void {
        let widget = textNode.getComponent(Widget);
        if (!widget) {
            widget = textNode.addComponent(Widget);
        }
        
        // 设置为相对于父节点（图片节点）对齐
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        
        // 设置边距（像素）
        widget.top = 10;
        widget.bottom = 10;
        widget.left = 10;
        widget.right = 10;
        
        widget.updateAlignment();
    }
    
    /**
     * @description 使用 Layout 组件对齐
     * @param textNode 文字节点
     * @returns {void}
     */
    setupLayoutAlignment(textNode: Node): void {
        let layout = this.node.getComponent(Layout);
        if (!layout) {
            layout = this.node.addComponent(Layout);
        }
        
        layout.type = Layout.Type.VERTICAL;
        layout.alignHorizontal = true;
        layout.alignVertical = true;
    }
}
