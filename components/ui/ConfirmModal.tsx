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
            <DialogContent className="sm:max-w-[480px] p-0 rounded-[32px] border-none bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] gap-0 overflow-hidden outline-none">
                <div className="relative p-8">
                  

                    <DialogHeader className="space-y-6 text-left">
                        <div className={cn(
                            "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm",
                            getIconBg()
                        )}>
                            {getIcon()}
                        </div>
                        <div className="space-y-3">
                            <DialogTitle className="text-2xl font-black tracking-tight leading-tight text-slate-950">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-base font-medium leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="mt-12 flex flex-col sm:flex-row gap-4 sm:space-x-0">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 rounded-2xl h-10 text-slate-500 hover:text-slate-950 hover:bg-slate-100 font-bold text-sm uppercase tracking-widest transition-all"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                "flex-[1.5] rounded-2xl h-10 font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] group",
                                isDestructive || variant === 'danger'
                                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                                    : "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/25"
                            )}
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>{confirmText}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
