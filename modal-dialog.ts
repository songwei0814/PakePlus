import { _decorator, Component, Node, Sprite, UITransform, Color, tween, Vec3, EventTouch, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 弹窗组件（带遮罩层）
 * 支持显示/隐藏动画，点击遮罩层关闭
 */
@ccclass('ModalDialog')
export class ModalDialog extends Component {
    @property({
        type: Node,
        tooltip: '遮罩层节点（背景半透明层）'
    })
    maskNode: Node | null = null;
    
    @property({
        type: Node,
        tooltip: '弹窗内容节点（实际显示的弹窗）'
    })
    contentNode: Node | null = null;
    
    @property({
        tooltip: '点击遮罩层是否关闭弹窗'
    })
    closeOnMask: boolean = true;
    
    @property({
        tooltip: '是否显示动画'
    })
    useAnimation: boolean = true;
    
    @property({
        tooltip: '动画时长（秒）'
    })
    animationDuration: number = 0.3;
    
    @property({
        tooltip: '遮罩层颜色'
    })
    maskColor: Color = new Color(0, 0, 0, 180); // 半透明黑色
    
    private isShowing: boolean = false;
    
    onLoad() {
        this.initDialog();
    }
    
    /**
     * @description 初始化弹窗
     * @returns {void}
     */
    initDialog(): void {
        // 如果没有指定节点，尝试自动查找
        if (!this.maskNode) {
            this.maskNode = this.node.getChildByName('Mask') || 
                           this.node.getChildByName('mask');
        }
        
        if (!this.contentNode) {
            this.contentNode = this.node.getChildByName('Content') || 
                              this.node.getChildByName('content') ||
                              this.node.children.find(child => child.name !== this.maskNode?.name);
        }
        
        // 设置遮罩层
        if (this.maskNode) {
            this.setupMask();
        }
        
        // 初始状态：隐藏
        this.node.active = false;
        if (this.contentNode) {
            this.contentNode.setScale(0, 0, 1);
        }
    }
    
    /**
     * @description 设置遮罩层
     * @returns {void}
     */
    setupMask(): void {
        if (!this.maskNode) return;
        
        // 添加或获取 Sprite 组件
        let sprite = this.maskNode.getComponent(Sprite);
        if (!sprite) {
            sprite = this.maskNode.addComponent(Sprite);
        }
        
        // 设置颜色（使用纯色）
        sprite.type = Sprite.Type.SIMPLE;
        sprite.color = this.maskColor;
        
        // 设置尺寸（全屏）
        let transform = this.maskNode.getComponent(UITransform);
        if (!transform) {
            transform = this.maskNode.addComponent(UITransform);
        }
        
        // 获取 Canvas 尺寸
        const canvas = this.node.getComponent('Canvas');
        if (canvas) {
            // 使用 Canvas 尺寸
            const canvasTransform = this.node.getComponent(UITransform);
            if (canvasTransform) {
                transform.width = canvasTransform.width;
                transform.height = canvasTransform.height;
            }
        } else {
            // 使用屏幕尺寸
            transform.width = 2000; // 足够大的值
            transform.height = 2000;
        }
        
        // 设置锚点居中
        this.maskNode.setAnchorPoint(0.5, 0.5);
        this.maskNode.setPosition(0, 0, 0);
        
        // 添加点击事件
        if (this.closeOnMask) {
            this.maskNode.on(Node.EventType.TOUCH_END, this.onMaskClick, this);
        }
    }
    
    /**
     * @description 显示弹窗
     * @returns {void}
     */
    show(): void {
        if (this.isShowing) return;
        
        this.isShowing = true;
        this.node.active = true;
        
        if (this.useAnimation && this.contentNode) {
            // 动画显示
            this.contentNode.setScale(0, 0, 1);
            
            // 遮罩层淡入
            if (this.maskNode) {
                const maskSprite = this.maskNode.getComponent(Sprite);
                if (maskSprite) {
                    maskSprite.color = new Color(0, 0, 0, 0);
                    tween(maskSprite.color)
                        .to(this.animationDuration, this.maskColor)
                        .start();
                }
            }
            
            // 弹窗缩放动画
            tween(this.contentNode)
                .to(this.animationDuration, { scale: new Vec3(1, 1, 1) }, {
                    easing: 'backOut'
                })
                .start();
        } else {
            // 直接显示
            if (this.contentNode) {
                this.contentNode.setScale(1, 1, 1);
            }
        }
    }
    
    /**
     * @description 隐藏弹窗
     * @returns {void}
     */
    hide(): void {
        if (!this.isShowing) return;
        
        this.isShowing = false;
        
        if (this.useAnimation && this.contentNode) {
            // 动画隐藏
            // 遮罩层淡出
            if (this.maskNode) {
                const maskSprite = this.maskNode.getComponent(Sprite);
                if (maskSprite) {
                    tween(maskSprite.color)
                        .to(this.animationDuration, new Color(0, 0, 0, 0))
                        .call(() => {
                            this.node.active = false;
                        })
                        .start();
                }
            }
            
            // 弹窗缩放动画
            tween(this.contentNode)
                .to(this.animationDuration, { scale: new Vec3(0, 0, 1) }, {
                    easing: 'backIn',
                    onComplete: () => {
                        if (!this.isShowing) {
                            this.node.active = false;
                        }
                    }
                })
                .start();
        } else {
            // 直接隐藏
            this.node.active = false;
        }
    }
    
    /**
     * @description 切换显示/隐藏
     * @returns {void}
     */
    toggle(): void {
        if (this.isShowing) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * @description 点击遮罩层
     * @param event 触摸事件
     * @returns {void}
     */
    onMaskClick(event: EventTouch): void {
        if (this.closeOnMask) {
            this.hide();
        }
    }
    
    onDestroy() {
        if (this.maskNode) {
            this.maskNode.off(Node.EventType.TOUCH_END, this.onMaskClick, this);
        }
    }
}
