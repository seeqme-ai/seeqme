import React, { useState } from 'react';
import { ICONS } from '../constants';
import { LogEntry } from '../types';
import { Code2, Activity, Copy, Check } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  isCollapsed: boolean;
  onToggle: () => void;
  code?: string;
  onCodeChange?: (newCode: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isCollapsed, onToggle, code, onCodeChange }) => {
  const [mode, setMode] = useState<'logs' | 'code'>('logs');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[10000] transition-all duration-500 ease-in-out ${isCollapsed ? 'h-10 translate-y-0' : 'h-80'} bg-slate-950 border-t border-white/5 flex flex-col shadow-2xl`}>
      <div className="flex items-center justify-between px-6 py-2 bg-slate-900/50 select-none border-b border-white/5">
        <div className="flex items-center gap-6" onClick={onToggle}>
          <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-500 uppercase cursor-pointer">
            <ICONS.Terminal className="w-3 h-3 text-teal-500" />
            <span>Console</span>
            {!isCollapsed && <span className="text-[8px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono lowercase">live</span>}
          </div>

          {!isCollapsed && (
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMode('logs')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${mode === 'logs' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Activity className="w-3 h-3" />
                Stream
              </button>
              <button
                onClick={() => setMode('code')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${mode === 'code' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Code2 className="w-3 h-3" />
                Source
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isCollapsed && mode === 'code' && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-teal-400 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
          <div onClick={onToggle} className="cursor-pointer">
            {isCollapsed ? <ICONS.ChevronUp className="w-3 h-3" /> : <ICONS.ChevronDown className="w-3 h-3" />}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-hidden relative">
          {mode === 'logs' ? (
            <div className="h-full overflow-y-auto p-4 mono text-[11px] no-scrollbar space-y-2">
              {logs.length === 0 && (
                <div className="text-slate-800 animate-pulse font-bold tracking-tighter">Waiting for engine handshake...</div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start border-l border-border pl-3 ml-2 group hover:border-teal-500/50 transition-colors">
                  <span className="text-slate-500 shrink-0 tabular-nums">{log.timestamp}</span>
                  <span className={`font-black uppercase shrink-0 tracking-tighter ${log.type === 'error' ? 'text-rose-500' :
                    log.type === 'success' ? 'text-teal-400' :
                      log.type === 'warn' ? 'text-amber-400' :
                        'text-teal-500/70'
                    }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-300 leading-relaxed font-medium">{log.message}</span>
                </div>
              ))}
              <div className="h-4"></div>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-[#010816]">
              <div className="bg-[#051124] px-4 py-1 flex items-center gap-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">template.html</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => onCodeChange?.(e.target.value)}
                className="flex-1 w-full bg-transparent text-teal-400/90 font-mono text-[12px] p-6 focus:outline-none resize-none custom-scrollbar selection:bg-teal-500/30"
                spellCheck={false}
                placeholder="<!-- Your portfolio source code here -->"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Terminal);
