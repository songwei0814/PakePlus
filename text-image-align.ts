import { _decorator, Component, Node, Label, Sprite, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 文字基于图片对齐组件
 * 支持多种对齐方式：顶部、底部、左侧、右侧、居中
 */
@ccclass('TextImageAlign')
export class TextImageAlign extends Component {
    @property(Node)
    imageNode: Node | null = null; // 图片节点
    
    @property(Node)
    textNode: Node | null = null; // 文字节点
    
    @property({
        type: cc.Enum({
            TOP: 'top',
            BOTTOM: 'bottom',
            LEFT: 'left',
            RIGHT: 'right',
            CENTER: 'center',
            TOP_LEFT: 'top-left',
            TOP_RIGHT: 'top-right',
            BOTTOM_LEFT: 'bottom-left',
            BOTTOM_RIGHT: 'bottom-right'
        }),
        tooltip: '对齐方式'
    })
    alignType: string = 'center';
    
    @property({
        tooltip: '文字与图片的偏移距离（像素）'
    })
    offset: Vec3 = new Vec3(0, 0, 0);
    
    onLoad() {
        this.alignTextToImage();
    }
    
    /**
     * @description 将文字对齐到图片
     * @returns {void}
     */
    alignTextToImage(): void {
        if (!this.imageNode || !this.textNode) {
            console.warn('[TextImageAlign] 图片节点或文字节点未设置');
            return;
        }
        
        const imageTransform = this.imageNode.getComponent(UITransform);
        const textTransform = this.textNode.getComponent(UITransform);
        
        if (!imageTransform || !textTransform) {
            console.error('[TextImageAlign] 缺少 UITransform 组件');
            return;
        }
        
        const imageWidth = imageTransform.width;
        const imageHeight = imageTransform.height;
        const textWidth = textTransform.width;
        const textHeight = textTransform.height;
        
        let x = 0;
        let y = 0;
        
        // 根据对齐方式计算位置
        switch (this.alignType) {
            case 'top':
                x = 0;
                y = imageHeight / 2 + textHeight / 2 + this.offset.y;
                break;
                
            case 'bottom':
                x = 0;
                y = -(imageHeight / 2 + textHeight / 2) + this.offset.y;
                break;
                
            case 'left':
                x = -(imageWidth / 2 + textWidth / 2) + this.offset.x;
                y = 0;
                break;
                
            case 'right':
                x = imageWidth / 2 + textWidth / 2 + this.offset.x;
                y = 0;
                break;
                
            case 'center':
                x = this.offset.x;
                y = this.offset.y;
                break;
                
            case 'top-left':
                x = -(imageWidth / 2 + textWidth / 2) + this.offset.x;
                y = imageHeight / 2 + textHeight / 2 + this.offset.y;
                break;
                
            case 'top-right':
                x = imageWidth / 2 + textWidth / 2 + this.offset.x;
                y = imageHeight / 2 + textHeight / 2 + this.offset.y;
                break;
                
            case 'bottom-left':
                x = -(imageWidth / 2 + textWidth / 2) + this.offset.x;
                y = -(imageHeight / 2 + textHeight / 2) + this.offset.y;
                break;
                
            case 'bottom-right':
                x = imageWidth / 2 + textWidth / 2 + this.offset.x;
                y = -(imageHeight / 2 + textHeight / 2) + this.offset.y;
                break;
        }
        
        // 设置文字节点位置（相对于图片节点）
        this.textNode.setPosition(x, y, 0);
    }
    
    /**
     * @description 动态设置对齐方式
     * @param alignType 对齐方式
     * @returns {void}
     */
    setAlignType(alignType: string): void {
        this.alignType = alignType;
        this.alignTextToImage();
    }
    
    /**
     * @description 更新偏移量
     * @param offset 偏移量
     * @returns {void}
     */
    setOffset(offset: Vec3): void {
        this.offset = offset;
        this.alignTextToImage();
    }
}
