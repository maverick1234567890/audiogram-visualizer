import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
        {/* Editing Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <fieldset className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              {title} Editing:
            </legend>
            <RadioGroup
              value={ear ? editingMode[ear] : 'air'}
              onValueChange={handleEditingChange}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="air" 
                  id={`modal-${ear}-air`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-air`} className="cursor-pointer">Air</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="bone" 
                  id={`modal-${ear}-bone`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-bone`} className="cursor-pointer">Bone</Label>
              </div>
            </RadioGroup>
          </fieldset>
        </div>
        
        {/* Full-size Chart */}
        <div className="w-full h-full flex items-center justify-center">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
