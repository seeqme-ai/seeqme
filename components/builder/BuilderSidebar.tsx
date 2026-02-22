import React from 'react';
import { ICONS } from '@/constants';

interface BuilderSidebarProps {
    isTemplateSelectorOpen: boolean;
    onOpenTemplateSelector: () => void;
    onStartTour?: () => void;
}

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
    isTemplateSelectorOpen,
    onOpenTemplateSelector,
    onStartTour
}) => {
    if (isTemplateSelectorOpen) return null;

    return (
        <div className="fixed top-24 left-6 z-40 flex flex-col gap-3">
            <button
                data-tour="template-drawer-btn"
                onClick={onOpenTemplateSelector}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white p-3 rounded-xl shadow-lg transition-all group"
                title="Change Template"
            >
                <ICONS.Layout className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
            </button>

           
        </div>
    );
};

export default React.memo(BuilderSidebar);
