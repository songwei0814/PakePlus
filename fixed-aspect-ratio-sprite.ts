import { _decorator, Component, Node, Sprite, UITransform, Widget } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 固定宽高比 Sprite 组件
 * 保持固定尺寸和宽高比，不受屏幕尺寸变化影响
 */
@ccclass('FixedAspectRatioSprite')
export class FixedAspectRatioSprite extends Component {
    @property({
        tooltip: '固定宽度（像素）'
    })
    fixedWidth: number = 200;
    
    @property({
        tooltip: '固定高度（像素），如果为0则根据宽高比自动计算'
    })
    fixedHeight: number = 0;
    
    @property({
        tooltip: '是否在 onLoad 时自动应用'
    })
    autoApply: boolean = true;
    
    private sprite: Sprite | null = null;
    private transform: UITransform | null = null;
    private aspectRatio: number = 1;
    
    onLoad() {
        this.initComponents();
        
        if (this.autoApply) {
            this.applyFixedSize();
        }
    }
    
    /**
     * @description 初始化组件
     * @returns {void}
     */
    initComponents(): void {
        this.sprite = this.getComponent(Sprite);
        this.transform = this.getComponent(UITransform);
        
        if (!this.sprite) {
            console.warn('[FixedAspectRatioSprite] 未找到 Sprite 组件');
            return;
        }
        
        if (!this.transform) {
            console.error('[FixedAspectRatioSprite] 未找到 UITransform 组件');
            return;
        }
        
        // 计算原始宽高比
        this.calculateAspectRatio();
        
        // 禁用可能影响尺寸的组件
        this.disableAutoResize();
    }
    
    /**
     * @description 计算原始宽高比
     * @returns {void}
     */
    calculateAspectRatio(): void {
        if (!this.sprite || !this.transform) return;
        
        const spriteFrame = this.sprite.spriteFrame;
        if (spriteFrame) {
            this.aspectRatio = spriteFrame.width / spriteFrame.height;
        } else {
            // 如果没有 SpriteFrame，使用当前尺寸
            const currentWidth = this.transform.width;
            const currentHeight = this.transform.height;
            if (currentHeight > 0) {
                this.aspectRatio = currentWidth / currentHeight;
            }
        }
    }
    
    /**
     * @description 禁用自动调整尺寸的组件
     * @returns {void}
     */
    disableAutoResize(): void {
        // 移除或禁用 Widget 组件（如果存在）
        const widget = this.getComponent(Widget);
        if (widget) {
            widget.enabled = false;
            // 或者直接移除
            // this.node.removeComponent(Widget);
        }
        
        // 检查父节点是否有 Layout 组件影响
        const parent = this.node.parent;
        if (parent) {
            const layout = parent.getComponent('Layout');
            if (layout) {
                console.warn('[FixedAspectRatioSprite] 父节点有 Layout 组件，可能影响固定尺寸');
            }
        }
    }
    
    /**
     * @description 应用固定尺寸
     * @returns {void}
     */
    applyFixedSize(): void {
        if (!this.transform || this.aspectRatio <= 0) return;
        
        if (this.fixedHeight > 0) {
            // 如果指定了固定高度，使用高度计算宽度
            this.transform.height = this.fixedHeight;
            this.transform.width = this.fixedHeight * this.aspectRatio;
        } else {
            // 使用固定宽度，高度根据宽高比计算
            this.transform.width = this.fixedWidth;
            this.transform.height = this.fixedWidth / this.aspectRatio;
        }
    }
    
    /**
     * @description 设置固定宽度
     * @param width 宽度（像素）
     * @returns {void}
     */
    setFixedWidth(width: number): void {
        this.fixedWidth = width;
        this.applyFixedSize();
    }
    
    /**
     * @description 设置固定高度
     * @param height 高度（像素）
     * @returns {void}
     */
    setFixedHeight(height: number): void {
        this.fixedHeight = height;
        this.applyFixedSize();
    }
    
    /**
     * @description 更新 SpriteFrame 后重新计算
     * @returns {void}
     */
    updateAspectRatio(): void {
        this.calculateAspectRatio();
        this.applyFixedSize();
    }
}
