
import React from 'react';

interface RunnerNamesMap {
  [key: string]: string;
}

interface RunnerColorsMap {
  [key: string]: string;
}

interface RunnerLegendProps {
  runnerNames: RunnerNamesMap;
  runnerColors: RunnerColorsMap;
}

const RunnerLegend: React.FC<RunnerLegendProps> = ({ runnerNames, runnerColors }) => {
  return (
    <div className="mt-1 flex flex-wrap gap-2 justify-center">
      {Object.entries(runnerNames).map(([runner, name], index) => (
        <div key={runner} className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: runnerColors[runner as keyof typeof runnerColors] }}
          ></div>
          <span>#{index + 1} {name}</span>
        </div>
      ))}
    </div>
  );
};

export default RunnerLegend;
