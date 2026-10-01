import React, { useState, useMemo, useEffect } from 'react';
import { Info, Activity } from 'lucide-react';
import { RadarAxis } from '../types';
import { useUserData } from '../contexts/UserDataContext';
import { AnimatedCounter } from './AnimatedCounter';

export const RadarCard: React.FC = () => {
  const { symptomLogs } = useUserData();
  const [hoveredAxis, setHoveredAxis] = useState<RadarAxis | null>(null);
  const [isChartAnimated, setIsChartAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartAnimated(true), 50);
    return () => clearTimeout(timer);
  }, [symptomLogs]);

  // Compute dynamic scores from real user logs
  const { axes, overallScore, hasData } = useMemo(() => {
    if (symptomLogs.length === 0) {
      const emptyAxes: RadarAxis[] = [
        { axis: 'sommeil', label: 'Sommeil', value: 0, score: '- / 10' },
        { axis: 'vitalite', label: 'Vitalité', value: 0, score: '- / 10' },
        { axis: 'mobilite', label: 'Mobilité', value: 0, score: '- / 10' },
        { axis: 'digestion', label: 'Digestion', value: 0, score: '- / 10' },
        { axis: 'dos', label: 'Confort dorsal', value: 0, score: '- / 10' },
        { axis: 'serenite', label: 'Sérénité', value: 0, score: '- / 10' },
      ];
      return { axes: emptyAxes, overallScore: null, hasData: false };
    }

    // Helper: calculate average score (0 to 100) for given symptom IDs
    // Where lower symptom intensity = better comfort/score, or higher vitality = higher score
    const getComfortScore = (symptomIds: string[], invertSeverity = true): number => {
      const relevant = symptomLogs.filter((l) => symptomIds.includes(l.symptomId));
      if (relevant.length === 0) return 75; // Baseline neutral if other symptoms logged

      let total = 0;
      relevant.forEach((log) => {
        if (invertSeverity) {
          // 1 (Légère) = 85%, 2 (Modérée) = 55%, 3 (Intense) = 25%
          total += log.intensityVal === 1 ? 85 : log.intensityVal === 2 ? 55 : 25;
        } else {
          // Direct for positive attributes (Vitalité, Sommeil reposant)
          total += log.intensityVal === 1 ? 40 : log.intensityVal === 2 ? 70 : 95;
        }
      });
      return Math.round(total / relevant.length);
    };

    const sommeilVal = getComfortScore(['sommeil'], false);
    const vitaliteVal = getComfortScore(['vitalite'], false);
    const mobiliteVal = Math.round((getComfortScore(['dos']) + getComfortScore(['jambes'])) / 2);
    const digestionVal = Math.round((getComfortScore(['nausees']) + getComfortScore(['brulures'])) / 2);
    const dosVal = getComfortScore(['dos']);
    const sereniteVal = Math.round((sommeilVal + vitaliteVal + mobiliteVal + digestionVal) / 4);

    const calculatedAxes: RadarAxis[] = [
      { axis: 'sommeil', label: 'Sommeil', value: sommeilVal, score: `${(sommeilVal / 10).toFixed(1)}/10` },
      { axis: 'vitalite', label: 'Vitalité', value: vitaliteVal, score: `${(vitaliteVal / 10).toFixed(1)}/10` },
      { axis: 'mobilite', label: 'Mobilité', value: mobiliteVal, score: `${(mobiliteVal / 10).toFixed(1)}/10` },
      { axis: 'digestion', label: 'Digestion', value: digestionVal, score: `${(digestionVal / 10).toFixed(1)}/10` },
      { axis: 'dos', label: 'Confort dorsal', value: dosVal, score: `${(dosVal / 10).toFixed(1)}/10` },
      { axis: 'serenite', label: 'Sérénité', value: sereniteVal, score: `${(sereniteVal / 10).toFixed(1)}/10` },
    ];

    const avg = (calculatedAxes.reduce((sum, a) => sum + a.value, 0) / calculatedAxes.length / 10).toFixed(1);

    return { axes: calculatedAxes, overallScore: avg, hasData: true };
  }, [symptomLogs]);

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const totalAxes = axes.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const dataPoints = axes.map((axis, i) => getCoordinates(i, axis.value));
  const polygonPointsStr = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[380px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-[#1E1B18] tracking-tight">
            Radar des ressentis
          </h3>
          <p className="text-[12px] text-[#7A736B] mt-0.5">
            Équilibre corporel des 7 derniers jours
          </p>
        </div>

        {/* Dynamic Badge */}
        {hasData ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D8F3DC] border border-[#C5EBD0] text-[#1D6339] text-[11.5px] font-semibold shrink-0">
            <Activity className="w-3 h-3 text-[#1D6339]" />
            <span>Tendance Zen</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F2EC] border border-[#E8E4DC] text-[#7A736B] text-[11.5px] font-medium shrink-0">
            <span>En attente de suivi</span>
          </span>
        )}
      </div>

      {/* SVG Radar Chart or Empty State Overlay */}
      <div className="relative flex items-center justify-center py-2 flex-1">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* Concentric Polygons */}
          {levels.map((lvl, idx) => {
            const levelPoints = axes
              .map((_, i) => {
                const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
                const r = lvl * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(' ');

            return (
              <polygon
                key={idx}
                points={levelPoints}
                fill={idx === levels.length - 1 ? '#FAF8F5' : 'none'}
                stroke="#EAE5DC"
                strokeWidth="1"
                strokeDasharray={idx < levels.length - 1 ? '2 2' : 'none'}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {axes.map((_, i) => {
            const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#E2DDD5"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon if data exists */}
          {hasData && (
            <g
              style={{ transformOrigin: `${center}px ${center}px` }}
              className={`transform-gpu transition-all duration-700 ease-out ${
                isChartAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              <polygon
                points={polygonPointsStr}
                fill="#9E2A2B"
                fillOpacity="0.16"
                stroke="#9E2A2B"
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Vertices */}
              {dataPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#9E2A2B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-125 transition-transform duration-200"
                  onMouseEnter={() => setHoveredAxis(axes[i])}
                  onMouseLeave={() => setHoveredAxis(null)}
                />
              ))}
            </g>
          )}

          {/* Axis Labels */}
          {axes.map((axis, i) => {
            const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
            const labelDist = radius + 22;
            const lx = center + labelDist * Math.cos(angle);
            const ly = center + labelDist * Math.sin(angle);

            let textAnchor = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <text
                key={i}
                x={lx}
                y={ly + 4}
                textAnchor={textAnchor}
                className="text-[11px] font-medium fill-[#5E5750] cursor-pointer hover:fill-[#9E2A2B] transition-colors"
                onMouseEnter={() => hasData && setHoveredAxis(axis)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                {axis.label}
              </text>
            );
          })}
        </svg>

        {/* Empty state overlay message if no data logged yet */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-[#EAE6DF] shadow-xs max-w-[210px]">
              <Activity className="w-5 h-5 text-[#9E2A2B] mx-auto mb-1.5" />
              <p className="text-[12px] font-semibold text-[#2C2825] leading-tight">
                Aucun symptôme enregistré
              </p>
              <p className="text-[11px] text-[#7A736B] mt-1 leading-snug">
                Votre équilibre corporel apparaîtra ici après vos premiers enregistrements.
              </p>
            </div>
          </div>
        )}

        {/* Hover Tooltip overlay */}
        {hoveredAxis && hasData && (
          <div className="absolute top-2 right-2 bg-[#2C2825] text-white text-[11px] px-2.5 py-1 rounded-md shadow-lg pointer-events-none animate-in fade-in duration-100">
            <span className="font-semibold">{hoveredAxis.label}</span> : {hoveredAxis.score}
          </div>
        )}
      </div>

      {/* Footer Info note */}
      <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] text-[#857E77]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#9E2A2B]" />
          <span>
            Indice de bien-être maternel :{' '}
            <strong>
              {hasData && overallScore ? (
                <AnimatedCounter
                  value={parseFloat(overallScore)}
                  decimals={1}
                  duration={750}
                  suffix=" / 10"
                />
              ) : (
                'À calculer'
              )}
            </strong>
          </span>
        </div>
        <span className={hasData ? 'text-[#1E7441] font-medium' : 'text-[#8C847D]'}>
          {hasData ? 'Synchronisé' : 'Données nécessaires'}
        </span>
      </div>
    </div>
  );
};
