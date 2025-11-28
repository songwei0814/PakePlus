import { _decorator, Component, Node, Sprite, UITransform, view, screen } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description Sprite 宽高比保持组件
 * 自动保持 Sprite 的原始宽高比，防止变形
 */
@ccclass('SpriteAspectRatio')
export class SpriteAspectRatio extends Component {
    @property({
        tooltip: '保持宽高比的方式：width（固定宽度），height（固定高度），fit（自适应）'
    })
    mode: 'width' | 'height' | 'fit' = 'fit';
    
    @property({
        tooltip: '目标宽度（mode 为 width 时使用）'
    })
    targetWidth: number = 200;
    
    @property({
        tooltip: '目标高度（mode 为 height 时使用）'
    })
    targetHeight: number = 200;
    
    @property({
        tooltip: '是否监听屏幕尺寸变化'
    })
    listenResize: boolean = true;
    
    private sprite: Sprite | null = null;
    private transform: UITransform | null = null;
    private originalWidth: number = 0;
    private originalHeight: number = 0;
    private aspectRatio: number = 1;
    
    onLoad() {
        this.initSprite();
    }
    
    onEnable() {
        if (this.listenResize) {
            screen.on('window-resize', this.onScreenResize, this);
        }
    }
    
    onDisable() {
        if (this.listenResize) {
            screen.off('window-resize', this.onScreenResize, this);
        }
    }
    
    /**
     * @description 初始化 Sprite
     * @returns {void}
     */
    initSprite(): void {
        this.sprite = this.getComponent(Sprite);
        this.transform = this.getComponent(UITransform);
        
        if (!this.sprite) {
            console.warn('[SpriteAspectRatio] 未找到 Sprite 组件');
            return;
        }
        
        if (!this.transform) {
            console.error('[SpriteAspectRatio] 未找到 UITransform 组件');
            return;
        }
        
        // 获取原始尺寸
        this.getOriginalSize();
        
        // 应用宽高比
        this.applyAspectRatio();
    }
    
    /**
     * @description 获取原始尺寸
     * @returns {void}
     */
    getOriginalSize(): void {
        if (!this.sprite || !this.transform) return;
        
        const spriteFrame = this.sprite.spriteFrame;
        if (spriteFrame) {
            // 从 SpriteFrame 获取原始尺寸
            this.originalWidth = spriteFrame.width;
            this.originalHeight = spriteFrame.height;
        } else {
            // 如果没有 SpriteFrame，使用当前尺寸
            this.originalWidth = this.transform.width;
            this.originalHeight = this.transform.height;
        }
        
        // 计算宽高比
        if (this.originalHeight > 0) {
            this.aspectRatio = this.originalWidth / this.originalHeight;
        } else {
            this.aspectRatio = 1;
        }
    }
    
    /**
     * @description 应用宽高比
     * @returns {void}
     */
    applyAspectRatio(): void {
        if (!this.transform || this.aspectRatio <= 0) return;
        
        switch (this.mode) {
            case 'width':
                // 固定宽度，根据宽高比计算高度
                this.transform.width = this.targetWidth;
                this.transform.height = this.targetWidth / this.aspectRatio;
                break;
                
            case 'height':
                // 固定高度，根据宽高比计算宽度
                this.transform.height = this.targetHeight;
                this.transform.width = this.targetHeight * this.aspectRatio;
                break;
                
            case 'fit':
                // 自适应：保持宽高比，尽可能大但不超出父容器
                this.fitToParent();
                break;
        }
    }
    
    /**
     * @description 自适应到父容器
     * @returns {void}
     */
    fitToParent(): void {
        if (!this.transform) return;
        
        const parent = this.node.parent;
        if (!parent) {
            // 如果没有父节点，使用屏幕尺寸
            const visibleSize = view.getVisibleSize();
            this.fitToSize(visibleSize.width, visibleSize.height);
            return;
        }
        
        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) {
            console.warn('[SpriteAspectRatio] 父节点没有 UITransform 组件');
            return;
        }
        
        const parentWidth = parentTransform.width;
        const parentHeight = parentTransform.height;
        
        this.fitToSize(parentWidth, parentHeight);
    }
    
    /**
     * @description 适配到指定尺寸
     * @param maxWidth 最大宽度
     * @param maxHeight 最大高度
     * @returns {void}
     */
    fitToSize(maxWidth: number, maxHeight: number): void {
        if (!this.transform || this.aspectRatio <= 0) return;
        
        // 计算两种适配方式的尺寸
        const widthByHeight = maxHeight * this.aspectRatio;
        const heightByWidth = maxWidth / this.aspectRatio;
        
        if (widthByHeight <= maxWidth) {
            // 以高度为准
            this.transform.height = maxHeight;
            this.transform.width = widthByHeight;
        } else {
            // 以宽度为准
            this.transform.width = maxWidth;
            this.transform.height = heightByWidth;
        }
    }
    
    /**
     * @description 屏幕尺寸变化回调
     * @returns {void}
     */
    onScreenResize(): void {
        if (this.mode === 'fit') {
            this.applyAspectRatio();
        }
    }
    
    /**
     * @description 更新 SpriteFrame 后重新计算
     * @returns {void}
     */
    updateAspectRatio(): void {
        this.getOriginalSize();
        this.applyAspectRatio();
    }
    
    /**
     * @description 设置目标宽度
     * @param width 目标宽度
     * @returns {void}
     */
    setTargetWidth(width: number): void {
        this.targetWidth = width;
        this.mode = 'width';
        this.applyAspectRatio();
    }
    
    /**
     * @description 设置目标高度
     * @param height 目标高度
     * @returns {void}
     */
    setTargetHeight(height: number): void {
        this.targetHeight = height;
        this.mode = 'height';
        this.applyAspectRatio();
    }
}
