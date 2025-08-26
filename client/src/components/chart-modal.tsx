import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudiogramChart } from './audiogram-chart';
import { EarData, EditingMode } from '@/hooks/use-audiogram-state';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  ear: 'right' | 'left' | null;
  data: { right: EarData; left: EarData };
  editingMode: EditingMode;
  onUpdateThreshold: (ear: 'right' | 'left', conduction: 'air' | 'bone', frequency: number, value: number) => void;
}

export function ChartModal({ 
  isOpen, 
  onClose, 
  ear, 
  data, 
  editingMode, 
  onUpdateThreshold 
}: ChartModalProps) {
  if (!ear) return null;

  const title = ear === 'right' ? 'Right Ear Audiogram' : 'Left Ear Audiogram';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden" data-testid="chart-modal">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="p-0" style={{ height: '70vh' }}>
          <AudiogramChart
            ear={ear}
            data={data[ear]}
            editingMode={editingMode}
            onUpdateThreshold={onUpdateThreshold}
            onEnlarge={() => {}} // No enlarge in modal
            className="h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
