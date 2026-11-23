import React from 'react';
import { QUICK_DEMO_USERS } from '../../data/mockAuditors';
import { Sparkles } from 'lucide-react';

export default function AuditorQuickSelect({ onSelectAuditor, currentUsername }) {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Quick Test Auditors</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_DEMO_USERS.map((user) => {
          const isSelected = currentUsername.toLowerCase() === user.username.toLowerCase();
          return (
            <button
              key={user.username}
              type="button"
              onClick={() => onSelectAuditor(user.username)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all duration-150 flex items-center gap-1 font-medium ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-gray-400'}`} />
              {user.username}
              <span className="text-[10px] text-gray-400 font-normal">({user.storeDefault})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

