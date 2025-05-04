
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

// Map to convert post position to standard colors
const getPostPositionColor = (position: number): string => {
  switch (position) {
    case 1: return "#DC2626"; // red-600
    case 2: return "#FFFFFF"; // white
    case 3: return "#2563EB"; // blue-600
    case 4: return "#FACC15"; // yellow-400
    case 5: return "#16A34A"; // green-600
    case 6: return "#000000"; // black
    case 7: return "#F97316"; // orange-500
    case 8: return "#EC4899"; // pink-500
    case 9: return "#10B981"; // emerald-500
    case 10: return "#9333EA"; // purple-600
    case 11: return "#84CC16"; // lime-500
    case 12: return "#9CA3AF"; // gray-400
    case 13: return "#9F1239"; // rose-800
    case 14: return "#14B8A6"; // teal-500
    case 15: return "#4338CA"; // indigo-700
    case 16: return "#F59E0B"; // amber-500
    default: return "#3B82F6"; // blue-500 (default)
  }
};

const RunnerLegend: React.FC<RunnerLegendProps> = ({ runnerNames, runnerColors }) => {
  return (
    <div className="mt-1 flex flex-wrap gap-2 justify-center">
      {Object.entries(runnerNames).map(([runner, name], index) => {
        // Extract runner number from key (e.g., "runner1" -> 1)
        const runnerNumber = parseInt(runner.replace('runner', ''));
        const standardColor = getPostPositionColor(runnerNumber);
        const textColor = runnerNumber === 2 || runnerNumber === 4 || runnerNumber === 12 ? "text-black" : "text-white";
        
        return (
          <div key={runner} className="flex items-center gap-1">
            <div 
              className="w-5 h-5 flex items-center justify-center border border-gray-500"
              style={{ backgroundColor: standardColor }}
            >
              <span className={`text-xs font-bold ${textColor}`}>{runnerNumber}</span>
            </div>
            <span>#{index + 1} {name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RunnerLegend;
