import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ICONS } from '../constants';
import { LogEntry } from '../types';
import { Code2, Activity, Copy, Check, Shield, ChevronDown, ChevronUp, Trash2, Filter } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  isCollapsed: boolean;
  onToggle: () => void;
  code?: string;
  onCodeChange?: (newCode: string) => void;
  isPaid?: boolean;
}

type FilterType = 'all' | 'info' | 'success' | 'warn' | 'error';

const LOG_TYPE_STYLE: Record<string, string> = {
  error:   'text-rose-400',
  success: 'text-emerald-400',
  warn:    'text-amber-400',
  info:    'text-sky-400',
};

const FILTER_OPTIONS: { label: string; value: FilterType; dot: string }[] = [
  { label: 'All',     value: 'all',     dot: 'bg-slate-500' },
  { label: 'Info',    value: 'info',    dot: 'bg-sky-500' },
  { label: 'Success', value: 'success', dot: 'bg-emerald-500' },
  { label: 'Warning', value: 'warn',    dot: 'bg-amber-500' },
  { label: 'Error',   value: 'error',   dot: 'bg-rose-500' },
];

const Terminal: React.FC<TerminalProps> = ({
  logs, isCollapsed, onToggle, code, onCodeChange, isPaid = false,
}) => {
  const [mode, setMode] = useState<'logs' | 'code'>('logs');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilter, setShowFilter] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed && mode === 'logs') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed, mode]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter((l) => l.type === filter);
  }, [logs, filter]);

  const errorCount = logs.filter((l) => l.type === 'error').length;

  return (
    <div
      data-tour="terminal"
      className={`fixed bottom-0 left-12 right-0 z-[10000] transition-all duration-300 ease-out ${
        isCollapsed ? 'h-10' : 'h-80'
      } bg-[#0a0f1a] border-t border-white/[0.06] flex flex-col shadow-2xl`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#0d1424] border-b border-white/[0.06] select-none shrink-0">
        {/* Left: title + mode tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ICONS.Terminal className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Console</span>
            {!isCollapsed && (
              <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 text-[9px] font-bold uppercase tracking-widest">live</span>
            )}
            {errorCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </span>
            )}
          </button>

          {!isCollapsed && (
            <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMode('logs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  mode === 'logs' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Activity className="w-3 h-3" /> Stream
              </button>
              <button
                onClick={() => setMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  mode === 'code' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Code2 className="w-3 h-3" /> Source
              </button>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isCollapsed && mode === 'logs' && (
            <div className="relative">
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  filter !== 'all' ? 'bg-teal-600/20 text-teal-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Filter className="w-3 h-3" />
                {filter !== 'all' ? filter : 'Filter'}
              </button>
              {showFilter && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#131d2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[120px]">
                  {FILTER_OPTIONS.map(({ label, value, dot }) => (
                    <button
                      key={value}
                      onClick={() => { setFilter(value); setShowFilter(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium hover:bg-white/5 transition-colors text-left ${
                        filter === value ? 'text-teal-400' : 'text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isCollapsed && mode === 'code' && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {mode === 'logs' ? (
            <div className="h-full overflow-y-auto p-4 space-y-1 font-mono text-[12px]">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Activity className="w-6 h-6 text-slate-700 mb-3" />
                  <p className="text-slate-600 text-xs font-medium">
                    {filter !== 'all' ? `No ${filter} messages` : 'Waiting for activity…'}
                  </p>
                  {filter !== 'all' && (
                    <button onClick={() => setFilter('all')} className="mt-2 text-[10px] text-teal-500 hover:underline">
                      Show all logs
                    </button>
                  )}
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-start group py-0.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-slate-600 shrink-0 tabular-nums text-[11px] mt-px select-none">
                      {log.timestamp}
                    </span>
                    <span className={`font-bold uppercase text-[10px] shrink-0 mt-px tracking-wider w-12 ${
                      LOG_TYPE_STYLE[log.type] || 'text-slate-500'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 leading-relaxed font-medium">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col bg-[#050c18] relative overflow-hidden">
              <div className="bg-[#080f1e] px-4 py-1.5 flex items-center gap-2 border-b border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">portfolio.html</span>
              </div>

              <div className={`flex-1 relative ${!isPaid ? 'overflow-hidden' : ''}`}>
                <textarea
                  value={code}
                  onChange={(e) => isPaid && onCodeChange?.(e.target.value)}
                  readOnly={!isPaid}
                  className={`w-full h-full bg-transparent text-emerald-400/80 font-mono text-[13px] leading-relaxed p-5 focus:outline-none resize-none transition-all duration-500 ${
                    !isPaid ? 'blur-[6px] select-none pointer-events-none opacity-20' : ''
                  }`}
                  spellCheck={false}
                  placeholder="<!-- Portfolio source will appear here -->"
                />

                {!isPaid && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050c18]/60 backdrop-blur-[2px] p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5">
                      <Shield className="w-7 h-7 text-teal-500" />
                    </div>
                    <h3 className="text-base font-black text-white mb-2">Source code is gated</h3>
                    <p className="text-slate-500 text-xs font-medium max-w-[240px] leading-relaxed mb-6">
                      Upgrade to Pro to view, copy, and directly edit your portfolio's source.
                    </p>
                    <a
                      href="/plans"
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-teal-600/30"
                    >
                      <ICONS.Zap className="w-3.5 h-3.5" />
                      Upgrade to Pro
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Terminal);
