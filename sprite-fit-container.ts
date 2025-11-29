import { _decorator, Component, Node, Sprite, UITransform, Widget } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description Sprite 适配容器组件
 * 使用 Widget 组件保持宽高比，适配父容器
 */
@ccclass('SpriteFitContainer')
export class SpriteFitContainer extends Component {
    @property({
        tooltip: '是否保持宽高比'
    })
    keepAspectRatio: boolean = true;
    
    @property({
        tooltip: '适配模式：contain（完整显示），cover（填充）'
    })
    fitMode: 'contain' | 'cover' = 'contain';
    
    private sprite: Sprite | null = null;
    private transform: UITransform | null = null;
    private widget: Widget | null = null;
    private aspectRatio: number = 1;
    
    onLoad() {
        this.initComponents();
    }
    
    /**
     * @description 初始化组件
     * @returns {void}
     */
    initComponents(): void {
        this.sprite = this.getComponent(Sprite);
        this.transform = this.getComponent(UITransform);
        
        if (!this.sprite || !this.transform) {
            console.error('[SpriteFitContainer] 缺少必要组件');
            return;
        }
        
        // 计算原始宽高比
        this.calculateAspectRatio();
        
        // 设置 Widget 组件
        this.setupWidget();
        
        // 应用适配
        this.applyFit();
    }
    
    /**
     * @description 计算宽高比
     * @returns {void}
     */
    calculateAspectRatio(): void {
        if (!this.sprite || !this.transform) return;
        
        const spriteFrame = this.sprite.spriteFrame;
        if (spriteFrame) {
            this.aspectRatio = spriteFrame.width / spriteFrame.height;
        } else {
            this.aspectRatio = this.transform.width / this.transform.height;
        }
    }
    
    /**
     * @description 设置 Widget 组件
     * @returns {void}
     */
    setupWidget(): void {
        if (!this.keepAspectRatio) return;
        
        this.widget = this.getComponent(Widget);
        if (!this.widget) {
            this.widget = this.addComponent(Widget);
        }
        
        // 根据适配模式设置 Widget
        if (this.fitMode === 'contain') {
            // contain: 完整显示，可能留白
            this.widget.isAlignTop = true;
            this.widget.isAlignBottom = true;
            this.widget.isAlignLeft = true;
            this.widget.isAlignRight = true;
        } else {
            // cover: 填充，可能裁剪
            // 需要根据宽高比决定对齐方式
            this.setupCoverMode();
        }
        
        this.widget.updateAlignment();
    }
    
    /**
     * @description 设置 cover 模式
     * @returns {void}
     */
    setupCoverMode(): void {
        if (!this.widget) return;
        
        // 获取父容器尺寸
        const parent = this.node.parent;
        if (!parent) return;
        
        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;
        
        const parentWidth = parentTransform.width;
        const parentHeight = parentTransform.height;
        const parentRatio = parentWidth / parentHeight;
        
        if (this.aspectRatio > parentRatio) {
            // 图片更宽，以宽度为准，上下可能超出
            this.widget.isAlignLeft = true;
            this.widget.isAlignRight = true;
            this.widget.isAlignTop = false;
            this.widget.isAlignBottom = false;
        } else {
            // 图片更高，以高度为准，左右可能超出
            this.widget.isAlignTop = true;
            this.widget.isAlignBottom = true;
            this.widget.isAlignLeft = false;
            this.widget.isAlignRight = false;
        }
    }
    
    /**
     * @description 应用适配
     * @returns {void}
     */
    applyFit(): void {
        if (!this.keepAspectRatio || !this.transform) return;
        
        const parent = this.node.parent;
        if (!parent) return;
        
        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;
        
        const parentWidth = parentTransform.width;
        const parentHeight = parentTransform.height;
        const parentRatio = parentWidth / parentHeight;
        
        if (this.fitMode === 'contain') {
            // contain: 保持宽高比，完整显示
            if (this.aspectRatio > parentRatio) {
                // 以宽度为准
                this.transform.width = parentWidth;
                this.transform.height = parentWidth / this.aspectRatio;
            } else {
                // 以高度为准
                this.transform.height = parentHeight;
                this.transform.width = parentHeight * this.aspectRatio;
            }
        } else {
            // cover: 保持宽高比，填充容器
            if (this.aspectRatio > parentRatio) {
                // 以高度为准，宽度会超出
                this.transform.height = parentHeight;
                this.transform.width = parentHeight * this.aspectRatio;
            } else {
                // 以宽度为准，高度会超出
                this.transform.width = parentWidth;
                this.transform.height = parentWidth / this.aspectRatio;
            }
        }
    }
}
