import * as React from "react"
import { AlertCircle, Loader, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
    variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false,
    variant = 'info'
}) => {
    const getIconColor = () => {
        switch (variant) {
            case 'danger':
                return "text-rose-500"
            case 'warning':
                return "text-amber-500"
            default:
                return "text-teal-500"
        }
    }

    const getConfirmButtonColor = () => {
        return isDestructive || variant === 'danger'
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-teal-500 hover:bg-teal-600 text-white"
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] z-[999] rounded-[2.5rem] bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
                <div className="flex flex-col items-center gap-8 px-8 pt-10 pb-8 text-center">
                
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                        <AlertCircle className={cn("h-8 w-8", getIconColor())} />
                    </div>

                    <div className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
                            {description}
                        </DialogDescription>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-8 pb-8 pt-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(getConfirmButtonColor())}
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}