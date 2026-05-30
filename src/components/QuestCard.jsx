import React from 'react';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';

const QuestCard = ({ task, isCompleted, onToggle }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (task.cmd) navigator.clipboard.writeText(task.cmd);
  };

  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`group p-5 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 ${
        isCompleted 
          ? 'bg-zinc-950 border-zinc-700 opacity-70' 
          : 'bg-zinc-900 border-zinc-800 hover:border-emerald-900/60 active:scale-[0.985]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 w-6 h-6 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-black' 
              : 'border-zinc-600 text-transparent group-hover:border-emerald-700'
          }`}>
            <CheckCircle2 size={15} />
          </div>
          <div>
            <div className={`font-semibold tracking-tight ${isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>
              {task.title}
            </div>
            <div className="text-sm text-zinc-400 mt-0.5 pr-2">{task.desc}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-emerald-400 text-sm font-medium">+{task.xp}</div>
          <div className="text-[10px] text-zinc-500">XP</div>
        </div>
      </div>

      {task.cmd && !isCompleted && (
        <div onClick={e => e.stopPropagation()} className="mt-1 bg-black/60 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
          <code className="font-mono text-xs text-emerald-300/90 truncate pr-2">{task.cmd}</code>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-medium px-3 py-1 rounded-xl hover:bg-white/5">
            <Copy size={14} /><span>COPY</span>
          </button>
        </div>
      )}

      {task.link && !isCompleted && (
        <a href={task.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white w-fit">
          Open Link <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
};

export default QuestCard;
