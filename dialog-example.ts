import { _decorator, Component, Node, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 弹窗使用示例
 * 演示如何打开和关闭弹窗
 */
@ccclass('DialogExample')
export class DialogExample extends Component {
    @property({
        type: Node,
        tooltip: '弹窗节点'
    })
    dialogNode: Node | null = null;
    
    @property({
        type: Button,
        tooltip: '打开弹窗按钮'
    })
    openButton: Button | null = null;
    
    @property({
        type: Button,
        tooltip: '关闭弹窗按钮（在弹窗内部）'
    })
    closeButton: Button | null = null;
    
    onLoad() {
        // 绑定打开按钮
        if (this.openButton) {
            this.openButton.node.on(Button.EventType.CLICK, this.openDialog, this);
        }
        
        // 绑定关闭按钮
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.closeDialog, this);
        }
    }
    
    /**
     * @description 打开弹窗
     * @returns {void}
     */
    openDialog(): void {
        if (this.dialogNode) {
            const modalDialog = this.dialogNode.getComponent('ModalDialog');
            if (modalDialog) {
                modalDialog.show();
            } else {
                this.dialogNode.active = true;
            }
        }
    }
    
    /**
     * @description 关闭弹窗
     * @returns {void}
     */
    closeDialog(): void {
        if (this.dialogNode) {
            const modalDialog = this.dialogNode.getComponent('ModalDialog');
            if (modalDialog) {
                modalDialog.hide();
            } else {
                this.dialogNode.active = false;
            }
        }
    }
    
    onDestroy() {
        if (this.openButton) {
            this.openButton.node.off(Button.EventType.CLICK, this.openDialog, this);
        }
        if (this.closeButton) {
            this.closeButton.node.off(Button.EventType.CLICK, this.closeDialog, this);
        }
    }
}
