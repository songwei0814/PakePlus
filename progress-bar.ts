import { _decorator, Component, Node, Sprite, UITransform, Label, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 进度条组件
 * 解决进度条变形问题，支持平滑动画
 */
@ccclass('ProgressBar')
export class ProgressBar extends Component {
    @property({
        type: Node,
        tooltip: '进度条背景节点（通常是整个进度条的容器）'
    })
    bgNode: Node | null = null;
    
    @property({
        type: Node,
        tooltip: '进度条填充节点（会变形的 bar 元素）'
    })
    barNode: Node | null = null;
    
    @property({
        type: Label,
        tooltip: '进度文字标签（可选）'
    })
    label: Label | null = null;
    
    @property({
        tooltip: '当前进度值（0-100）'
    })
    progress: number = 0;
    
    @property({
        tooltip: '是否显示百分比文字'
    })
    showPercent: boolean = true;
    
    @property({
        tooltip: '是否使用动画'
    })
    useAnimation: boolean = true;
    
    @property({
        tooltip: '动画时长（秒）'
    })
    animationDuration: number = 0.3;
    
    private barSprite: Sprite | null = null;
    private barTransform: UITransform | null = null;
    private bgTransform: UITransform | null = null;
    private maxWidth: number = 0;
    
    onLoad() {
        this.initProgressBar();
    }
    
    /**
     * @description 初始化进度条
     * @returns {void}
     */
    initProgressBar(): void {
        // 如果没有指定节点，尝试自动查找
        if (!this.bgNode) {
            this.bgNode = this.node;
        }
        
        if (!this.barNode) {
            // 尝试查找名为 'bar' 或 'fill' 的子节点
            this.barNode = this.node.getChildByName('bar') || 
                          this.node.getChildByName('fill') ||
                          this.node.children[0];
        }
        
        if (!this.barNode) {
            console.error('[ProgressBar] 未找到 bar 节点');
            return;
        }
        
        // 获取组件
        this.barSprite = this.barNode.getComponent(Sprite);
        this.barTransform = this.barNode.getComponent(UITransform);
        this.bgTransform = this.bgNode.getComponent(UITransform);
        
        if (!this.barTransform) {
            console.error('[ProgressBar] bar 节点缺少 UITransform 组件');
            return;
        }
        
        if (!this.bgTransform) {
            console.error('[ProgressBar] bg 节点缺少 UITransform 组件');
            return;
        }
        
        // 保存最大宽度（背景宽度）
        this.maxWidth = this.bgTransform.width;
        
        // 设置 bar 的初始属性，防止变形
        this.setupBarProperties();
        
        // 设置初始进度
        this.setProgress(this.progress, false);
    }
    
    /**
     * @description 设置 bar 属性，防止变形
     * @returns {void}
     */
    setupBarProperties(): void {
        if (!this.barTransform || !this.bgTransform) return;
        
        // 1. 设置锚点（通常进度条从左到右，锚点在左侧）
        this.barNode!.setAnchorPoint(0, 0.5);
        
        // 2. 设置 bar 的初始高度等于背景高度（防止垂直变形）
        this.barTransform.height = this.bgTransform.height;
        
        // 3. 设置 bar 的初始宽度为 0
        this.barTransform.width = 0;
        
        // 4. 设置 bar 的位置（相对于背景左侧）
        const bgWidth = this.bgTransform.width;
        this.barNode!.setPosition(-bgWidth / 2, 0, 0);
        
        // 5. 如果 bar 有 Sprite 组件，设置填充模式
        if (this.barSprite) {
            // 使用 SLICED 模式可以保持边缘不变形
            this.barSprite.type = Sprite.Type.SLICED;
            
            // 或者使用 SIMPLE 模式，但需要确保图片尺寸正确
            // this.barSprite.type = Sprite.Type.SIMPLE;
        }
    }
    
    /**
     * @description 设置进度值
     * @param value 进度值（0-100）
     * @param animate 是否使用动画
     * @returns {void}
     */
    setProgress(value: number, animate: boolean | null = null): void {
        // 限制进度值范围
        this.progress = Math.max(0, Math.min(100, value));
        
        const shouldAnimate = animate !== null ? animate : this.useAnimation;
        
        if (shouldAnimate) {
            this.animateProgress(this.progress);
        } else {
            this.updateProgressBar(this.progress);
        }
    }
    
    /**
     * @description 更新进度条显示
     * @param value 进度值（0-100）
     * @returns {void}
     */
    updateProgressBar(value: number): void {
        if (!this.barTransform || !this.bgTransform) return;
        
        // 计算目标宽度
        const targetWidth = (this.maxWidth * value) / 100;
        
        // 更新 bar 宽度
        this.barTransform.width = targetWidth;
        
        // 更新文字
        if (this.label && this.showPercent) {
            this.label.string = `${Math.floor(value)}%`;
        }
    }
    
    /**
     * @description 动画更新进度条
     * @param targetValue 目标进度值
     * @returns {void}
     */
    animateProgress(targetValue: number): void {
        if (!this.barTransform) return;
        
        const currentWidth = this.barTransform.width;
        const targetWidth = (this.maxWidth * targetValue) / 100;
        
        // 停止之前的动画
        tween(this.barTransform).stop();
        
        // 创建新动画
        tween(this.barTransform)
            .to(this.animationDuration, { width: targetWidth }, {
                onUpdate: (target: UITransform) => {
                    // 计算当前进度值用于显示文字
                    const currentProgress = (target.width / this.maxWidth) * 100;
                    if (this.label && this.showPercent) {
                        this.label.string = `${Math.floor(currentProgress)}%`;
                    }
                }
            })
            .start();
    }
    
    /**
     * @description 增加进度
     * @param delta 增加的进度值
     * @returns {void}
     */
    addProgress(delta: number): void {
        this.setProgress(this.progress + delta);
    }
    
    /**
     * @description 重置进度
     * @returns {void}
     */
    reset(): void {
        this.setProgress(0, false);
    }
}
