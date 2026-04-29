import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Blocks, Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';
import BuilderLoader from '@/components/BuilderLoader';
import { BuildStatus } from '@/types';

interface BuilderViewportProps {
  status: BuildStatus;
  data: any | null;
  progress: number;
  refinementPrompt: string;
  isIframeLoading: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onIframeLoad: () => void;
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

const DEVICE_CONFIG: Record<DeviceMode, { width: string; label: string; frame: string }> = {
  mobile:  { width: '375px',  label: '375px',  frame: 'rounded-[2rem] border-[5px] border-slate-800 shadow-[0_32px_80px_rgba(0,0,0,0.5)]' },
  tablet:  { width: '768px',  label: '768px',  frame: 'rounded-2xl border-2 border-slate-700 shadow-[0_24px_60px_rgba(0,0,0,0.4)]' },
  desktop: { width: '100%',   label: 'Full',   frame: '' },
};

const MotionDiv = motion.div as any;

const BuilderViewport: React.FC<BuilderViewportProps> = ({
  status, data, progress, refinementPrompt,
  isIframeLoading, iframeRef, onIframeLoad,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const isActivelyGenerating = status === 'synthesizing' || status === 'generating';
  const loaderTitle =
    status === 'generating'
      ? (refinementPrompt ? 'Refining your portfolio...' : 'Remixing design...')
      : 'Building your portfolio...';
  const showSpinnerOverlay = isIframeLoading && !isActivelyGenerating;
  const { width, label, frame } = DEVICE_CONFIG[deviceMode];

  const handleRefresh = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.location.reload();
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-slate-100 flex flex-col">

      {/* Viewport toolbar */}
      {data && !isActivelyGenerating && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100 shrink-0">
          {/* Device toggles */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
            {(Object.keys(DEVICE_CONFIG) as DeviceMode[]).map((mode) => {
              const icons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };
              const Icon = icons[mode];
              return (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  title={`${mode} (${DEVICE_CONFIG[mode].label})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    deviceMode === mode
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline capitalize">{mode}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono text-slate-300 hidden lg:block">{label}</span>

          <button
            onClick={handleRefresh}
            title="Reload preview"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Viewport area */}
      <div className="flex-1 relative overflow-auto flex items-start justify-center">
        <AnimatePresence mode="wait">
          {isActivelyGenerating ? (
            <BuilderLoader
              key="loader"
              title={loaderTitle}
              currentStep={progress}
              totalSteps={100}
            />
          ) : data ? (
            <MotionDiv
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`relative transition-all duration-300 ${
                deviceMode !== 'desktop' ? 'my-6' : 'w-full h-full'
              }`}
              style={{
                width,
                minHeight: deviceMode !== 'desktop' ? 'calc(100vh - 8rem)' : '100%',
                maxWidth: deviceMode !== 'desktop' ? width : undefined,
              }}
            >
              <div
                className={`w-full h-full overflow-hidden ${frame}`}
                style={{ minHeight: 'inherit' }}
              >
                {deviceMode === 'mobile' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-10 pointer-events-none" />
                )}
                {showSpinnerOverlay && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <Loader className="text-teal-500 animate-spin w-6 h-6" />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  onLoad={onIframeLoad}
                  className="w-full h-full border-none bg-white block"
                  title="Portfolio Preview"
                  style={{ minHeight: deviceMode !== 'desktop' ? 'calc(100vh - 8rem)' : '100vh' }}
                />
              </div>
            </MotionDiv>
          ) : (
            /* Empty state */
            <MotionDiv
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center w-full h-full p-8"
              style={{ minHeight: 'calc(100vh - 8rem)' }}
            >
              <div className="max-w-sm w-full text-center space-y-5">
                {/* Icon */}
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 bg-teal-400/10 rounded-full blur-2xl scale-150" />
                  <div className="relative w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center">
                    <Blocks className="w-7 h-7 text-teal-500" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">Ready to build</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1.5 leading-relaxed">
                    Describe what you do, upload your CV, or pick a template to get started.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  {['Modern', 'Minimal', 'Bold', 'Creative'].map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(BuilderViewport);
