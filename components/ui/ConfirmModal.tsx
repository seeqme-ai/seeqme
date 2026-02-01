import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Loader, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
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
    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertCircle className="w-6 h-6 text-destructive" />
            case 'warning':
                return <AlertCircle className="w-6 h-6 text-amber-500" />
            default:
                return <AlertCircle className="w-6 h-6 text-teal-500" />
        }
    }

    const getIconBg = () => {
        switch (variant) {
            case 'danger':
                return "bg-destructive/10"
            case 'warning':
                return "bg-amber-500/10"
            default:
                return "bg-teal-500/10"
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px] p-8 rounded-[32px] border-border bg-white shadow-2xl gap-0 overflow-hidden">
                <DialogHeader className="space-y-4 text-left">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-2",
                        getIconBg()
                    )}>
                        {getIcon()}
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-8 flex gap-3 sm:space-x-0">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 rounded-2xl h-14 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 rounded-2xl h-14 font-bold shadow-lg transition-all active:scale-[0.98]",
                            isDestructive || variant === 'danger'
                                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/10"
                                : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/10"
                        )}
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
