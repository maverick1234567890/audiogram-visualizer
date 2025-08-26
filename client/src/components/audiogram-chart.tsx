import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand } from 'lucide-react';
import { EarData, EditingMode } from '@/hooks/use-audiogram-state';
import { 
  CHART_CONFIG, 
  frequencies, 
  getXPosition, 
  getYPosition, 
  generatePathString,
  getDbFromY,
  getFrequencyFromX,
  snapToGrid,
  clampDbValue,
  getYAxisTicks,
  getXAxisTicks
} from '@/lib/chart-utils';

interface AudiogramChartProps {
  ear: 'right' | 'left';
  data: EarData;
  editingMode: EditingMode;
  onUpdateThreshold: (ear: 'right' | 'left', conduction: 'air' | 'bone', frequency: number, value: number) => void;
  onEnlarge: () => void;
  className?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

export function AudiogramChart({ 
  ear, 
  data, 
  editingMode, 
  onUpdateThreshold, 
  onEnlarge,
  className = ''
}: AudiogramChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });
  const [dragState, setDragState] = useState<{ frequency: number; conduction: 'air' | 'bone' } | null>(null);

  const title = ear === 'right' ? 'Right Ear Audiogram' : 'Left Ear Audiogram';
  const color = ear === 'right' ? 'var(--medical-red)' : 'var(--medical-blue)';
  const colorClass = ear === 'right' ? 'text-medical-red' : 'text-medical-blue';
  const legend = ear === 'right' 
    ? 'Air Conduction (O) — Bone Conduction (<)'
    : 'Air Conduction (X) — Bone Conduction (>)';

  const yTicks = getYAxisTicks();
  const xTicks = getXAxisTicks();

  const handleChartClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to viewBox
    const scaleX = CHART_CONFIG.width / rect.width;
    const scaleY = CHART_CONFIG.height / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Check if click is within plot area
    if (scaledX < CHART_CONFIG.marginLeft || 
        scaledX > CHART_CONFIG.marginLeft + CHART_CONFIG.plotWidth ||
        scaledY < CHART_CONFIG.marginTop || 
        scaledY > CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight) {
      return;
    }

    // Determine frequency and dB value
    const frequency = getFrequencyFromX(scaledX);
    const dbValue = clampDbValue(snapToGrid(getDbFromY(scaledY)));

    // Update based on current editing mode for this ear
    onUpdateThreshold(ear, editingMode[ear], frequency, dbValue);
  }, [ear, editingMode, onUpdateThreshold]);

  const handleMarkerMouseDown = useCallback((frequency: number, conduction: 'air' | 'bone') => {
    if (editingMode[ear] === conduction) {
      setDragState({ frequency, conduction });
    }
  }, [ear, editingMode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to viewBox
    const scaleX = CHART_CONFIG.width / rect.width;
    const scaleY = CHART_CONFIG.height / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Handle dragging
    if (dragState) {
      const dbValue = clampDbValue(snapToGrid(getDbFromY(scaledY)));
      onUpdateThreshold(ear, dragState.conduction, dragState.frequency, dbValue);
    }

    // Update tooltip
    if (scaledX >= CHART_CONFIG.marginLeft && 
        scaledX <= CHART_CONFIG.marginLeft + CHART_CONFIG.plotWidth &&
        scaledY >= CHART_CONFIG.marginTop && 
        scaledY <= CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight) {
      
      const frequency = getFrequencyFromX(scaledX);
      const dbValue = Math.round(getDbFromY(scaledY));
      const freqLabel = frequency >= 1000 ? `${frequency / 1000}k` : frequency.toString();
      
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY - 30,
        content: `${freqLabel} • ${dbValue} dB HL`,
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [dragState, onUpdateThreshold, ear]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setDragState(null);
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setDragState(null);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const renderMarkers = useCallback((type: 'air' | 'bone') => {
    const thresholds = data[type];
    const isAir = type === 'air';
    
    return frequencies.map(freq => {
      const x = getXPosition(freq);
      const y = getYPosition(thresholds[freq]);
      const isEditable = editingMode[ear] === type;
      
      if (isAir) {
        // Air conduction markers
        if (ear === 'right') {
          // Circle for right ear
          return (
            <circle
              key={`${type}-${freq}`}
              cx={x}
              cy={y}
              r="6"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className={`chart-marker ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
              onMouseDown={() => handleMarkerMouseDown(freq, type)}
              tabIndex={isEditable ? 0 : -1}
              data-testid={`marker-${ear}-${type}-${freq}`}
            />
          );
        } else {
          // X for left ear
          const size = 6;
          return (
            <g key={`${type}-${freq}`} className={`chart-marker ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}>
              <line
                x1={x - size}
                y1={y - size}
                x2={x + size}
                y2={y + size}
                stroke={color}
                strokeWidth="2"
                onMouseDown={() => handleMarkerMouseDown(freq, type)}
              />
              <line
                x1={x + size}
                y1={y - size}
                x2={x - size}
                y2={y + size}
                stroke={color}
                strokeWidth="2"
                onMouseDown={() => handleMarkerMouseDown(freq, type)}
              />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="transparent"
                onMouseDown={() => handleMarkerMouseDown(freq, type)}
                tabIndex={isEditable ? 0 : -1}
                data-testid={`marker-${ear}-${type}-${freq}`}
              />
            </g>
          );
        }
      } else {
        // Bone conduction markers (< or >)
        const direction = ear === 'right' ? -1 : 1; // < for right, > for left
        const size = 5;
        
        return (
          <g key={`${type}-${freq}`} className={`chart-marker ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}>
            <path
              d={`M ${x + direction * size},${y - size} L ${x - direction * size},${y} L ${x + direction * size},${y + size}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              onMouseDown={() => handleMarkerMouseDown(freq, type)}
            />
            <circle
              cx={x}
              cy={y}
              r="8"
              fill="transparent"
              onMouseDown={() => handleMarkerMouseDown(freq, type)}
              tabIndex={isEditable ? 0 : -1}
              data-testid={`marker-${ear}-${type}-${freq}`}
            />
          </g>
        );
      }
    });
  }, [data, ear, color, editingMode, onUpdateThreshold, handleMarkerMouseDown]);

  return (
    <>
      <Card className={`transition-colors duration-200 ${className}`} data-testid={`chart-${ear}`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
          
          <div className="relative chart-container">
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 left-2 z-10 h-6 w-6 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={onEnlarge}
              data-testid={`enlarge-${ear}`}
              aria-label={`Enlarge ${ear} ear chart`}
            >
              <Expand className="h-3 w-3" />
            </Button>
            
            <svg
              ref={svgRef}
              className="w-full h-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 audiogram-grid"
              viewBox={`0 0 ${CHART_CONFIG.width} ${CHART_CONFIG.height}`}
              onClick={handleChartClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              data-testid={`chart-svg-${ear}`}
            >
              {/* Y-axis */}
              <line
                x1={CHART_CONFIG.marginLeft}
                y1={CHART_CONFIG.marginTop}
                x2={CHART_CONFIG.marginLeft}
                y2={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight}
                stroke="#374151"
                strokeWidth="2"
              />
              
              {/* Y-axis ticks and labels */}
              {yTicks.map(tick => (
                <g key={`y-${tick.value}`}>
                  <line
                    x1={CHART_CONFIG.marginLeft - 5}
                    y1={tick.position}
                    x2={CHART_CONFIG.marginLeft + 5}
                    y2={tick.position}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  <text
                    x={CHART_CONFIG.marginLeft - 15}
                    y={tick.position + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tick.value}
                  </text>
                </g>
              ))}
              
              {/* Y-axis title */}
              <text
                x={25}
                y={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight / 2}
                textAnchor="middle"
                className="text-sm fill-gray-700 dark:fill-gray-300"
                style={{ fontFamily: 'Inter, sans-serif' }}
                transform={`rotate(-90, 25, ${CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight / 2})`}
              >
                dB HL
              </text>
              
              {/* X-axis */}
              <line
                x1={CHART_CONFIG.marginLeft}
                y1={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight}
                x2={CHART_CONFIG.marginLeft + CHART_CONFIG.plotWidth}
                y2={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight}
                stroke="#374151"
                strokeWidth="2"
              />
              
              {/* X-axis ticks and labels */}
              {xTicks.map(tick => (
                <g key={`x-${tick.value}`}>
                  <line
                    x1={tick.position}
                    y1={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight - 5}
                    x2={tick.position}
                    y2={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight + 5}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  <text
                    x={tick.position}
                    y={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tick.label}
                  </text>
                </g>
              ))}
              
              {/* Grid lines */}
              <g opacity="0.3">
                {/* Horizontal grid lines */}
                {yTicks.map(tick => (
                  <line
                    key={`grid-h-${tick.value}`}
                    x1={CHART_CONFIG.marginLeft}
                    y1={tick.position}
                    x2={CHART_CONFIG.marginLeft + CHART_CONFIG.plotWidth}
                    y2={tick.position}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-300 dark:text-gray-600"
                  />
                ))}
                
                {/* Vertical grid lines */}
                {xTicks.map(tick => (
                  <line
                    key={`grid-v-${tick.value}`}
                    x1={tick.position}
                    y1={CHART_CONFIG.marginTop}
                    x2={tick.position}
                    y2={CHART_CONFIG.marginTop + CHART_CONFIG.plotHeight}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-300 dark:text-gray-600"
                  />
                ))}
              </g>
              
              {/* Air conduction line (solid) */}
              <polyline
                points={generatePathString(data.air)}
                fill="none"
                stroke={color}
                strokeWidth="2"
                data-testid={`line-${ear}-air`}
              />
              
              {/* Bone conduction line (dashed) */}
              <polyline
                points={generatePathString(data.bone)}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
                data-testid={`line-${ear}-bone`}
              />
              
              {/* Air conduction markers */}
              {renderMarkers('air')}
              
              {/* Bone conduction markers */}
              {renderMarkers('bone')}
            </svg>
          </div>
          
          <div className={`mt-4 text-center text-sm text-gray-600 dark:text-gray-400`}>
            <span className={colorClass}>{legend}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="tooltip fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
}
