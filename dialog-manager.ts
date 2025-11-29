import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

/**
 * @description 弹窗管理器
 * 统一管理多个弹窗的显示/隐藏
 */
@ccclass('DialogManager')
export class DialogManager extends Component {
    @property({
        type: Node,
        tooltip: '弹窗容器节点（所有弹窗的父节点）'
    })
    dialogContainer: Node | null = null;
    
    private currentDialog: Node | null = null;
    
    onLoad() {
        if (!this.dialogContainer) {
            // 如果没有指定，使用当前节点
            this.dialogContainer = this.node;
        }
    }
    
    /**
     * @description 显示弹窗
     * @param dialogNode 弹窗节点
     * @returns {void}
     */
    showDialog(dialogNode: Node): void {
        // 隐藏当前弹窗
        if (this.currentDialog) {
            this.hideDialog();
        }
        
        // 显示新弹窗
        this.currentDialog = dialogNode;
        if (this.currentDialog) {
            this.currentDialog.active = true;
            const modalDialog = this.currentDialog.getComponent('ModalDialog');
            if (modalDialog) {
                modalDialog.show();
            }
        }
    }
    
    /**
     * @description 隐藏弹窗
     * @returns {void}
     */
    hideDialog(): void {
        if (this.currentDialog) {
            const modalDialog = this.currentDialog.getComponent('ModalDialog');
            if (modalDialog) {
                modalDialog.hide();
            } else {
                this.currentDialog.active = false;
            }
            this.currentDialog = null;
        }
    }
    
    /**
     * @description 从预制体创建并显示弹窗
     * @param prefab 弹窗预制体
     * @returns {Node} 创建的弹窗节点
     */
    showDialogFromPrefab(prefab: Prefab): Node | null {
        if (!prefab) {
            console.error('Prefab 不能为空');
            return null;
        }
        
        // 隐藏当前弹窗
        if (this.currentDialog) {
            this.hideDialog();
        }
        
        // 实例化预制体
        const dialogNode = instantiate(prefab);
        dialogNode.setParent(this.dialogContainer);
        
        // 显示弹窗
        this.currentDialog = dialogNode;
        const modalDialog = dialogNode.getComponent('ModalDialog');
        if (modalDialog) {
            modalDialog.show();
        } else {
            dialogNode.active = true;
        }
        
        return dialogNode;
    }
}
