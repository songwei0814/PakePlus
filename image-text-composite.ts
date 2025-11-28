import { _decorator, Component, Node, Label, Sprite, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 图片文字组合组件
 * 创建一个包含图片和文字的复合节点，文字可以相对于图片对齐
 */
@ccclass('ImageTextComposite')
export class ImageTextComposite extends Component {
    @property({
        type: cc.SpriteFrame,
        tooltip: '图片资源'
    })
    spriteFrame: cc.SpriteFrame | null = null;
    
    @property({
        tooltip: '文字内容'
    })
    textContent: string = '文字';
    
    @property({
        tooltip: '文字对齐方式：top, bottom, left, right, center'
    })
    textAlign: string = 'center';
    
    @property({
        tooltip: '文字偏移量'
    })
    textOffset: Vec3 = new Vec3(0, 0, 0);
    
    private imageNode: Node | null = null;
    private textNode: Node | null = null;
    
    onLoad() {
        this.createComposite();
    }
    
    /**
     * @description 创建图片文字组合
     * @returns {void}
     */
    createComposite(): void {
        // 创建图片节点
        this.imageNode = new Node('Image');
        const sprite = this.imageNode.addComponent(Sprite);
        const imageTransform = this.imageNode.addComponent(UITransform);
        
        if (this.spriteFrame) {
            sprite.spriteFrame = this.spriteFrame;
            imageTransform.width = this.spriteFrame.width;
            imageTransform.height = this.spriteFrame.height;
        } else {
            // 默认尺寸
            imageTransform.width = 200;
            imageTransform.height = 200;
        }
        
        this.imageNode.setParent(this.node);
        this.imageNode.setPosition(0, 0, 0);
        
        // 创建文字节点
        this.textNode = new Node('Label');
        const label = this.textNode.addComponent(Label);
        const textTransform = this.textNode.addComponent(UITransform);
        
        label.string = this.textContent;
        label.fontSize = 24;
        
        // 设置文字尺寸（根据内容自动调整）
        textTransform.width = 200;
        textTransform.height = 50;
        
        this.textNode.setParent(this.node);
        
        // 对齐文字
        this.alignText();
    }
    
    /**
     * @description 对齐文字到图片
     * @returns {void}
     */
    alignText(): void {
        if (!this.imageNode || !this.textNode) return;
        
        const imageTransform = this.imageNode.getComponent(UITransform);
        const textTransform = this.textNode.getComponent(UITransform);
        
        if (!imageTransform || !textTransform) return;
        
        const imageWidth = imageTransform.width;
        const imageHeight = imageTransform.height;
        const textWidth = textTransform.width;
        const textHeight = textTransform.height;
        
        let x = 0;
        let y = 0;
        
        switch (this.textAlign) {
            case 'top':
                x = 0;
                y = imageHeight / 2 + textHeight / 2;
                break;
            case 'bottom':
                x = 0;
                y = -(imageHeight / 2 + textHeight / 2);
                break;
            case 'left':
                x = -(imageWidth / 2 + textWidth / 2);
                y = 0;
                break;
            case 'right':
                x = imageWidth / 2 + textWidth / 2;
                y = 0;
                break;
            case 'center':
            default:
                x = 0;
                y = 0;
                break;
        }
        
        // 应用偏移量
        x += this.textOffset.x;
        y += this.textOffset.y;
        
        this.textNode.setPosition(x, y, 0);
    }
    
    /**
     * @description 更新文字内容
     * @param text 新文字内容
     * @returns {void}
     */
    updateText(text: string): void {
        this.textContent = text;
        if (this.textNode) {
            const label = this.textNode.getComponent(Label);
            if (label) {
                label.string = text;
                this.alignText(); // 重新对齐
            }
        }
    }
    
    /**
     * @description 更新图片
     * @param spriteFrame 新的图片资源
     * @returns {void}
     */
    updateImage(spriteFrame: cc.SpriteFrame): void {
        this.spriteFrame = spriteFrame;
        if (this.imageNode) {
            const sprite = this.imageNode.getComponent(Sprite);
            const transform = this.imageNode.getComponent(UITransform);
            if (sprite && transform) {
                sprite.spriteFrame = spriteFrame;
                transform.width = spriteFrame.width;
                transform.height = spriteFrame.height;
                this.alignText(); // 重新对齐
            }
        }
    }
}
