import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ActionBarItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  content: React.ReactNode;
}

interface ExpandableActionBarProps {
  id?: string;
  items: ActionBarItem[];
  defaultExpandedId?: string | null;
  className?: string;
  onItemToggle?: (id: string | null) => void;
}

export const ExpandableActionBar: React.FC<ExpandableActionBarProps> = ({
  id = 'expandable-action-bar',
  items,
  defaultExpandedId = null,
  className = '',
  onItemToggle,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(defaultExpandedId);

  const handleToggle = (itemId: string) => {
    const nextId = expandedId === itemId ? null : itemId;
    setExpandedId(nextId);
    if (onItemToggle) {
      onItemToggle(nextId);
    }
  };

  const activeItem = items.find(item => item.id === expandedId);

  return (
    <div id={id} className={`w-full space-y-3 ${className}`}>
      {/* Horizontal Action Bar Container */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 min-w-0">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <button
                key={item.id}
                id={`action-bar-item-${item.id}`}
                type="button"
                onClick={() => handleToggle(item.id)}
                aria-expanded={isExpanded}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-2 shrink-0 select-none cursor-pointer whitespace-nowrap active:scale-98 ${
                  isExpanded
                    ? 'bg-[#1A2B47] text-white shadow-sm ring-2 ring-[#F27D26]/40'
                    : 'bg-[#F9F8F6] text-[#1A2B47] hover:bg-orange-50/70 hover:text-[#F27D26] border border-[#E5E5E5]'
                }`}
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {item.icon && (
                  <span className={`shrink-0 ${isExpanded ? 'text-[#F27D26]' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                )}
                
                <span className="font-bold tracking-tight whitespace-nowrap">
                  {item.title}
                </span>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-extrabold shrink-0 whitespace-nowrap ${
                      item.badgeColor || (isExpanded ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-900')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-[#F27D26]' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Accordion Content Panel */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key={activeItem.id}
            id={`action-bar-content-${activeItem.id}`}
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-orange-200/80 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {activeItem.icon && (
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F27D26] flex items-center justify-center shrink-0">
                      {activeItem.icon}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-black text-[#1A2B47] uppercase tracking-wide truncate">
                    {activeItem.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(activeItem.id)}
                  aria-label="Collapse category"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category-Specific Sub-points & Sub-views */}
              <div className="pt-1">
                {activeItem.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
