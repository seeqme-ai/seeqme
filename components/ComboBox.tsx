
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';

interface ComboBoxProps<T> {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
  compact?: boolean;
}

const ComboBox = <T,>({ items, selectedItem, onSelect, labelKey, valueKey, placeholder = "Select option...", compact = false }: ComboBoxProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item =>
    String(item[labelKey]).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-64" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-slate-900 border border-white/5 p-3 rounded-full text-[10px] font-black  text-white focus:outline-none transition-all hover:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <ICONS.Layers className="w-4 h-4 text-teal-500" />
          {!compact && <span className="truncate">{selectedItem ? String(selectedItem[labelKey]) : placeholder}</span>}
        </div>
        <ICONS.ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[2100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-white/5">
            <input
              type="text"
              className="w-full bg-slate-950/50 border-none rounded-xl py-2 px-3 text-[10px] text-white focus:outline-none placeholder:text-slate-600"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filteredItems.map((item) => (
              <button
                key={String(item[valueKey])}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-slate-950 transition-all flex items-center justify-between ${selectedItem?.[valueKey] === item[valueKey] ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400'}`}
              >
                {String(item[labelKey])}
                {selectedItem?.[valueKey] === item[valueKey] && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="p-4 text-center text-[8px] text-slate-600 font-black uppercase tracking-widest">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboBox;
