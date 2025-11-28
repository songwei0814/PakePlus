import { _decorator, Component, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 简单的 Sprite 宽高比保持组件
 * 使用方法：添加到 Sprite 节点上，设置 targetWidth 或 targetHeight
 */
@ccclass('SimpleSpriteAspectRatio')
export class SimpleSpriteAspectRatio extends Component {
    @property({
        tooltip: '目标宽度（设置后高度会自动计算）'
    })
    targetWidth: number = 0;
    
    @property({
        tooltip: '目标高度（设置后宽度会自动计算）'
    })
    targetHeight: number = 0;
    
    private sprite: Sprite | null = null;
    private transform: UITransform | null = null;
    
    onLoad() {
        this.sprite = this.getComponent(Sprite);
        this.transform = this.getComponent(UITransform);
        
        if (!this.sprite || !this.transform) {
            console.error('需要 Sprite 和 UITransform 组件');
            return;
        }
        
        this.updateAspectRatio();
    }
    
    /**
     * @description 更新宽高比
     * @returns {void}
     */
    updateAspectRatio(): void {
        if (!this.sprite || !this.transform) return;
        
        const spriteFrame = this.sprite.spriteFrame;
        if (!spriteFrame) return;
        
        const aspectRatio = spriteFrame.width / spriteFrame.height;
        
        if (this.targetWidth > 0) {
            // 固定宽度
            this.transform.width = this.targetWidth;
            this.transform.height = this.targetWidth / aspectRatio;
        } else if (this.targetHeight > 0) {
            // 固定高度
            this.transform.height = this.targetHeight;
            this.transform.width = this.targetHeight * aspectRatio;
        }
    }
}
