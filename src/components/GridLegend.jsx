export function GridLegend() {
  return (
    <div className="flex gap-6 shrink-0 h-auto flex-col pb-4 sm:pb-0">
      {/* Terrain Section */}
      <div className="w-full bg-surface-container-low rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center space-x-2 text-secondary">
          <span className="material-symbols-outlined text-sm" data-icon="landscape">landscape</span>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Terrain Complexity Index</h2>
        </div>
        <div className="flex flex-col gap-4">
          {/* 1 - ROAD */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-gray-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.6)] border-cyan-400 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              1
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Road</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 1.0</span>
            </div>
          </div>
          {/* 2 - GRASS */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-green-400 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.7)] border-green-300 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              2
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Grass</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 2.0</span>
            </div>
          </div>
          {/* 3 - SAND */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-yellow-300 text-gray-900 shadow-[0_0_10px_rgba(251,191,36,0.7)] border-yellow-300 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              3
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Sand</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 3.5</span>
            </div>
          </div>
          {/* 4 - SHRUB */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-lime-500 text-gray-900 shadow-[0_0_10px_rgba(132,204,22,0.7)] border-lime-300 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              4
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Shrub</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 4.0</span>
            </div>
          </div>
          {/* 5 - MUD */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-amber-700 text-white shadow-[0_0_8px_rgba(249,115,22,0.6)] border-orange-400 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              5
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Mud</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 8.0</span>
            </div>
          </div>
          {/* 8 - MOUNTAIN */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm border-2 bg-slate-600 text-white shadow-[0_0_10px_rgba(34,211,238,0.7)] border-cyan-300 flex items-center justify-center text-sm font-bold select-none cursor-pointer">
              8
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Mountain</span>
              <span className="text-[9px] font-medium text-on-surface-variant tracking-widest">COST: 20.0</span>
            </div>
          </div>
          {/* Wall */}
          <div className="flex items-center gap-3">
            <div className="w-[32px] h-[32px] rounded border bg-gray-900 border-gray-700 shadow-inner flex items-center justify-center select-none cursor-pointer transition-all duration-150">
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter leading-none">Wall</span>
              <span className="text-[9px] font-medium text-error-dim tracking-widest uppercase">Impassable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
