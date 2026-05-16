import React from 'react';
import QuestCard from './QuestCard';

const TrackLane = ({ title, tasks, completed, onToggle }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
        <div className="text-xs font-mono px-3 py-1 bg-zinc-950 border border-zinc-700 rounded-2xl text-zinc-400">
          {completed.length}/{tasks.length} COMPLETE
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <QuestCard
            key={task.id}
            task={task}
            isCompleted={completed.includes(task.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackLane;
