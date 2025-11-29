import { Node, Sprite, UITransform } from 'cc';

/**
 * @description 保持 Sprite 宽高比的工具函数
 */

/**
 * @description 保持 Sprite 宽高比（固定宽度）
 * @param spriteNode Sprite 节点
 * @param targetWidth 目标宽度
 * @returns {void}
 */
export function keepAspectRatioByWidth(spriteNode: Node, targetWidth: number): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    
    if (!sprite || !transform) {
        console.error('节点缺少 Sprite 或 UITransform 组件');
        return;
    }
    
    const spriteFrame = sprite.spriteFrame;
    if (!spriteFrame) {
        console.error('Sprite 没有设置 SpriteFrame');
        return;
    }
    
    // 计算宽高比
    const aspectRatio = spriteFrame.width / spriteFrame.height;
    
    // 设置尺寸
    transform.width = targetWidth;
    transform.height = targetWidth / aspectRatio;
}

/**
 * @description 保持 Sprite 宽高比（固定高度）
 * @param spriteNode Sprite 节点
 * @param targetHeight 目标高度
 * @returns {void}
 */
export function keepAspectRatioByHeight(spriteNode: Node, targetHeight: number): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    
    if (!sprite || !transform) {
        console.error('节点缺少 Sprite 或 UITransform 组件');
        return;
    }
    
    const spriteFrame = sprite.spriteFrame;
    if (!spriteFrame) {
        console.error('Sprite 没有设置 SpriteFrame');
        return;
    }
    
    // 计算宽高比
    const aspectRatio = spriteFrame.width / spriteFrame.height;
    
    // 设置尺寸
    transform.height = targetHeight;
    transform.width = targetHeight * aspectRatio;
}

/**
 * @description 适配到父容器，保持宽高比
 * @param spriteNode Sprite 节点
 * @param mode contain（完整显示）或 cover（填充）
 * @returns {void}
 */
export function fitToParent(spriteNode: Node, mode: 'contain' | 'cover' = 'contain'): void {
    const sprite = spriteNode.getComponent(Sprite);
    const transform = spriteNode.getComponent(UITransform);
    const parent = spriteNode.parent;
    
    if (!sprite || !transform || !parent) {
        console.error('缺少必要组件或父节点');
        return;
    }
    
    const spriteFrame = sprite.spriteFrame;
    if (!spriteFrame) {
        console.error('Sprite 没有设置 SpriteFrame');
        return;
    }
    
    const parentTransform = parent.getComponent(UITransform);
    if (!parentTransform) {
        console.error('父节点缺少 UITransform 组件');
        return;
    }
    
    const spriteRatio = spriteFrame.width / spriteFrame.height;
    const parentWidth = parentTransform.width;
    const parentHeight = parentTransform.height;
    const parentRatio = parentWidth / parentHeight;
    
    if (mode === 'contain') {
        // 完整显示，可能留白
        if (spriteRatio > parentRatio) {
            // 以宽度为准
            transform.width = parentWidth;
            transform.height = parentWidth / spriteRatio;
        } else {
            // 以高度为准
            transform.height = parentHeight;
            transform.width = parentHeight * spriteRatio;
        }
    } else {
        // cover: 填充，可能裁剪
        if (spriteRatio > parentRatio) {
            // 以高度为准，宽度会超出
            transform.height = parentHeight;
            transform.width = parentHeight * spriteRatio;
        } else {
            // 以宽度为准，高度会超出
            transform.width = parentWidth;
            transform.height = parentWidth / spriteRatio;
        }
    }
}
