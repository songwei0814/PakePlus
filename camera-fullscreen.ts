import { _decorator, Component, Camera, view, screen } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 相机全屏控制组件
 * 用于设置相机为全屏显示，适配不同屏幕尺寸
 */
@ccclass('CameraFullScreen')
export class CameraFullScreen extends Component {
    @property(Camera)
    camera: Camera | null = null;
    
    @property({
        tooltip: '设计分辨率宽度（用于适配计算）'
    })
    designWidth: number = 750;
    
    @property({
        tooltip: '设计分辨率高度（用于适配计算）'
    })
    designHeight: number = 1334;
    
    @property({
        tooltip: '是否自动适配屏幕尺寸变化'
    })
    autoAdapt: boolean = true;
    
    onLoad() {
        // 如果没有指定相机，尝试获取当前节点的相机组件
        if (!this.camera) {
            this.camera = this.getComponent(Camera);
        }
        
        if (!this.camera) {
            console.error('[CameraFullScreen] 未找到 Camera 组件');
            return;
        }
        
        // 设置全屏
        this.setupFullScreen();
        
        // 监听屏幕尺寸变化
        if (this.autoAdapt) {
            screen.on('window-resize', this.onScreenResize, this);
        }
    }
    
    onDestroy() {
        if (this.autoAdapt) {
            screen.off('window-resize', this.onScreenResize, this);
        }
    }
    
    /**
     * @description 设置相机为全屏显示
     * @returns {void}
     */
    setupFullScreen(): void {
        if (!this.camera) {
            console.error('[CameraFullScreen] Camera 组件不存在');
            return;
        }
        
        // 设置视口为全屏（0, 0, 1, 1 表示整个屏幕）
        this.camera.viewport = {
            x: 0,
            y: 0,
            width: 1,
            height: 1
        };
        
        // 如果是正交相机，设置正交高度
        if (this.camera.projection === Camera.ProjectionType.ORTHO) {
            this.updateOrthoHeight();
        }
        
        console.log('[CameraFullScreen] 相机已设置为全屏', {
            viewport: this.camera.viewport,
            projection: this.camera.projection
        });
    }
    
    /**
     * @description 更新正交高度以适应屏幕
     * @returns {void}
     */
    updateOrthoHeight(): void {
        if (!this.camera || this.camera.projection !== Camera.ProjectionType.ORTHO) {
            return;
        }
        
        const visibleSize = view.getVisibleSize();
        const designRatio = this.designWidth / this.designHeight;
        const screenRatio = visibleSize.width / visibleSize.height;
        
        if (screenRatio > designRatio) {
            // 屏幕更宽，以高度为准
            this.camera.orthoHeight = this.designHeight;
        } else {
            // 屏幕更高，以宽度为准
            this.camera.orthoHeight = this.designHeight * (screenRatio / designRatio);
        }
    }
    
    /**
     * @description 屏幕尺寸变化时的回调
     * @returns {void}
     */
    onScreenResize(): void {
        if (this.camera?.projection === Camera.ProjectionType.ORTHO) {
            this.updateOrthoHeight();
        }
    }
    
    /**
     * @description 手动设置相机位置到场景中心（可选）
     * @param x X 坐标
     * @param y Y 坐标
     * @param z Z 坐标
     * @returns {void}
     */
    setCameraPosition(x: number = 0, y: number = 0, z: number = 1000): void {
        this.node.setPosition(x, y, z);
    }
}
