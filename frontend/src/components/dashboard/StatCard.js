'use client';

export default function StatCard({ title, value, subtitle, icon, color, delay }) {
  const colorMap = {
    'text-emerald-600': { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      border: 'border-emerald-100',
      accent: 'bg-emerald-500',
      shadow: 'shadow-emerald-100'
    },
    'text-red-500': { 
      bg: 'bg-red-50', 
      text: 'text-red-500', 
      border: 'border-red-100',
      accent: 'bg-red-500',
      shadow: 'shadow-red-100'
    },
    'text-blue-500': { 
      bg: 'bg-blue-50', 
      text: 'text-blue-500', 
      border: 'border-blue-100',
      accent: 'bg-blue-500',
      shadow: 'shadow-blue-100'
    },
    'text-amber-500': { 
      bg: 'bg-amber-50', 
      text: 'text-amber-500', 
      border: 'border-amber-100',
      accent: 'bg-amber-500',
      shadow: 'shadow-amber-100'
    },
  };
  
  const styles = colorMap[color] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', accent: 'bg-gray-500', shadow: 'shadow-gray-100' };

  return (
    <div className={`group relative bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:${styles.shadow} transition-all duration-500 animate-fade-in flex flex-col justify-between h-full overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${styles.accent} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shrink-0 border ${styles.border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className={`h-1 w-6 ml-auto ${styles.accent} rounded-full opacity-20 group-hover:w-10 transition-all duration-500`}></div>
        </div>
      </div>
      <div>
        <p className={`text-2xl font-black tracking-tight ${color || 'text-gray-800'}`}>{value}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 font-bold mt-2 flex items-center gap-1.5 opacity-80">
            <span className={`w-1 h-1 rounded-full ${styles.accent}`}></span>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
