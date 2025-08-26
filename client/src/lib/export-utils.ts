import html2canvas from 'html2canvas';
import { PatientData } from '@/hooks/use-audiogram-state';

export async function exportToPNG(patientData: PatientData): Promise<void> {
  try {
    // Find the main content area to capture
    const element = document.querySelector('[data-testid="export-area"]') as HTMLElement;
    if (!element) {
      throw new Error('Export area not found');
    }

    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // High DPI
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Convert canvas to blob
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

function generateFilename(patientData: PatientData): string {
  const sanitize = (str: string) => str.replace(/[^\w\-]/g, '-').replace(/-+/g, '-');
  
  const name = sanitize(patientData.name) || 'unknown';
  const examDate = sanitize(patientData.examDate) || 'unknown';
  const birthDate = sanitize(patientData.birthDate) || 'unknown';
  
  return `audio_${examDate}_${name}_${birthDate}.png`;
}
