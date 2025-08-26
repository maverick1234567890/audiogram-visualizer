import { PatientData, AudiogramState } from '@/hooks/use-audiogram-state';
import { frequencies, getXPosition, getYPosition, generatePathString } from './chart-utils';

export async function exportToPNG(patientData: PatientData, audiogramState?: AudiogramState): Promise<void> {
  try {
    if (!audiogramState) {
      throw new Error('Audiogram data not provided');
    }

    // Create custom canvas for the audiogram export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 800;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font and colors
    ctx.fillStyle = '#000000';
    ctx.font = '16px Inter, sans-serif';

    // Draw patient information at top
    const startY = 40;
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('Audiogram Report', 40, startY);
    
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Patient Name: ${patientData.name}`, 40, startY + 40);
    ctx.fillText(`Date of Examination: ${patientData.examDate}`, 40, startY + 65);
    ctx.fillText(`Birth Date: ${patientData.birthDate}`, 40, startY + 90);

    // Draw both audiograms side by side
    const chartStartY = 160;
    const chartWidth = 500;
    const chartHeight = 400;
    const rightChartX = 80;
    const leftChartX = rightChartX + chartWidth + 60;

    // Draw right ear chart
    drawAudiogramChart(ctx, rightChartX, chartStartY, chartWidth, chartHeight, 'Right Ear Audiogram', audiogramState.right, '#dc2626');
    
    // Draw left ear chart  
    drawAudiogramChart(ctx, leftChartX, chartStartY, chartWidth, chartHeight, 'Left Ear Audiogram', audiogramState.left, '#2563eb');

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to generate image');
      }

      // Generate filename
      const filename = generateFilename(patientData);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export PNG. Please try again.');
  }
}

function drawAudiogramChart(
  ctx: CanvasRenderingContext2D, 
  startX: number, 
  startY: number, 
  width: number, 
  height: number, 
  title: string, 
  data: any, 
  color: string
) {
  const marginLeft = 60;
  const marginTop = 40;
  const marginBottom = 60;
  const plotWidth = width - marginLeft - 40;
  const plotHeight = height - marginTop - marginBottom;

  // Draw title
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText(title, startX + width / 2, startY + 20);

  // Draw axes
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(startX + marginLeft, startY + marginTop);
  ctx.lineTo(startX + marginLeft, startY + marginTop + plotHeight);
  ctx.stroke();

  // X-axis
  ctx.beginPath();
  ctx.moveTo(startX + marginLeft, startY + marginTop + plotHeight);
  ctx.lineTo(startX + marginLeft + plotWidth, startY + marginTop + plotHeight);
  ctx.stroke();

  // Draw grid and labels
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 1;
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'end';
  ctx.fillStyle = '#666666';

  // Y-axis ticks and grid (dB values)
  for (let db = -10; db <= 120; db += 10) {
    const y = startY + marginTop + ((db + 10) / 130) * plotHeight;
    
    // Grid line
    ctx.beginPath();
    ctx.moveTo(startX + marginLeft, y);
    ctx.lineTo(startX + marginLeft + plotWidth, y);
    ctx.stroke();
    
    // Label
    ctx.fillText(db.toString(), startX + marginLeft - 10, y + 4);
  }

  // X-axis ticks and grid (frequencies)
  ctx.textAlign = 'center';
  frequencies.forEach((freq, index) => {
    const x = startX + marginLeft + (index / (frequencies.length - 1)) * plotWidth;
    
    // Grid line
    ctx.beginPath();
    ctx.moveTo(x, startY + marginTop);
    ctx.lineTo(x, startY + marginTop + plotHeight);
    ctx.stroke();
    
    // Label
    const label = freq >= 1000 ? `${freq / 1000}k` : freq.toString();
    ctx.fillText(label, x, startY + marginTop + plotHeight + 20);
  });

  // Draw Y-axis label
  ctx.save();
  ctx.translate(startX + 20, startY + marginTop + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Hearing Level (dB HL)', 0, 0);
  ctx.restore();

  // Draw X-axis label
  ctx.textAlign = 'center';
  ctx.fillText('Frequency (Hz)', startX + marginLeft + plotWidth / 2, startY + marginTop + plotHeight + 45);

  // Draw data lines and markers
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  // Air conduction (solid line)
  drawAudiogramLine(ctx, startX + marginLeft, startY + marginTop, plotWidth, plotHeight, data.air, false);
  drawAudiogramMarkers(ctx, startX + marginLeft, startY + marginTop, plotWidth, plotHeight, data.air, color, 'air', title.includes('Right'));

  // Bone conduction (dashed line)
  drawAudiogramLine(ctx, startX + marginLeft, startY + marginTop, plotWidth, plotHeight, data.bone, true);
  drawAudiogramMarkers(ctx, startX + marginLeft, startY + marginTop, plotWidth, plotHeight, data.bone, color, 'bone', title.includes('Right'));

  // Draw legend (lowered to avoid collision with frequency axis)
  const legendY = startY + height + 10;
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  const legend = title.includes('Right') 
    ? 'Air Conduction (O) — Bone Conduction (<)'
    : 'Air Conduction (X) — Bone Conduction (>)';
  ctx.fillText(legend, startX + width / 2, legendY);
}

function drawAudiogramLine(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number,
  thresholds: any,
  dashed: boolean
) {
  ctx.beginPath();
  
  if (dashed) {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  frequencies.forEach((freq, index) => {
    const x = startX + (index / (frequencies.length - 1)) * width;
    const dbValue = thresholds[freq] || 0;
    const y = startY + ((dbValue + 10) / 130) * height;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawAudiogramMarkers(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number,
  thresholds: any,
  color: string,
  type: 'air' | 'bone',
  isRight: boolean
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = type === 'air' ? '#ffffff' : color;
  ctx.lineWidth = 2;

  frequencies.forEach((freq, index) => {
    const x = startX + (index / (frequencies.length - 1)) * width;
    const dbValue = thresholds[freq] || 0;
    const y = startY + ((dbValue + 10) / 130) * height;
    
    if (type === 'air') {
      if (isRight) {
        // Circle for right ear air
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // X for left ear air
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 6);
        ctx.lineTo(x + 6, y + 6);
        ctx.moveTo(x + 6, y - 6);
        ctx.lineTo(x - 6, y + 6);
        ctx.stroke();
      }
    } else {
      // Bone conduction markers (< or >)
      const size = 6;
      ctx.beginPath();
      if (isRight) {
        // < for right ear
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y);
        ctx.lineTo(x + size, y + size);
      } else {
        // > for left ear
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x - size, y + size);
      }
      ctx.stroke();
    }
  });
}

function generateFilename(patientData: PatientData): string {
  const sanitize = (str: string) => str.replace(/[^\w\-]/g, '-').replace(/-+/g, '-');
  
  const name = sanitize(patientData.name) || 'unknown';
  const examDate = sanitize(patientData.examDate) || 'unknown';
  const birthDate = sanitize(patientData.birthDate) || 'unknown';
  
  return `audiogram_${examDate}_${name}_${birthDate}.png`;
}
