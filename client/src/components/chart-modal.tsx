import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AudiogramChart } from './audiogram-chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { EarData, EditingMode } from '@/hooks/use-audiogram-state';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  ear: 'right' | 'left' | null;
  data: { right: EarData; left: EarData };
  editingMode: EditingMode;
  onUpdateThreshold: (ear: 'right' | 'left', conduction: 'air' | 'bone', frequency: number, value: number) => void;
  onSetEditingMode: (ear: 'right' | 'left', conduction: 'air' | 'bone') => void;
}

export function ChartModal({ 
  isOpen, 
  onClose, 
  ear, 
  data, 
  editingMode, 
  onUpdateThreshold,
  onSetEditingMode
}: ChartModalProps) {
  if (!ear) return null;

  const title = ear === 'right' ? 'Right Ear Audiogram' : 'Left Ear Audiogram';

  const handleEditingChange = (value: string) => {
    if (ear) {
      onSetEditingMode(ear, value as 'air' | 'bone');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] h-[95vh] max-w-none max-h-none overflow-hidden bg-white dark:bg-gray-900 border shadow-2xl p-6"
        data-testid="chart-modal"
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Interactive audiogram chart</DialogDescription>
        </VisuallyHidden>
        
        {/* Editing Controls - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-sm border">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Edit:</div>
            <RadioGroup
              value={ear ? editingMode[ear] : 'air'}
              onValueChange={handleEditingChange}
              className="flex items-center gap-3"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem 
                  value="air" 
                  id={`modal-${ear}-air`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-air`} className="cursor-pointer text-sm">Air</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem 
                  value="bone" 
                  id={`modal-${ear}-bone`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-bone`} className="cursor-pointer text-sm">Bone</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Full-size Chart */}
        <div className="w-full h-full">
          <AudiogramChart
            ear={ear}
            data={data[ear]}
            editingMode={editingMode}
            onUpdateThreshold={onUpdateThreshold}
            onEnlarge={() => {}} // No enlarge in modal
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
