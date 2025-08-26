import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { PatientForm } from '@/components/patient-form';
import { AudiogramChart } from '@/components/audiogram-chart';
import { ChartModal } from '@/components/chart-modal';
import { useAudiogramState } from '@/hooks/use-audiogram-state';
import { exportToPNG } from '@/lib/export-utils';

export default function AudiogramVisualizer() {
  const { toast } = useToast();
  const {
    state,
    toggleTheme,
    updateThreshold,
    setEditingMode,
    updatePatientData,
    resetAll,
    validatePatientData,
  } = useAudiogramState();

  const [modalState, setModalState] = useState<{ isOpen: boolean; ear: 'right' | 'left' | null }>({
    isOpen: false,
    ear: null,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleEnlargeChart = useCallback((ear: 'right' | 'left') => {
    setModalState({ isOpen: true, ear });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, ear: null });
  }, []);

  const handleExport = useCallback(async () => {
    const validation = validatePatientData();
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      
      // Scroll to patient form
      const patientForm = document.querySelector('[data-testid="patient-form"]');
      if (patientForm) {
        patientForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before exporting.",
        variant: "destructive",
      });
      return;
    }

    // Clear any previous validation errors
    setValidationErrors([]);

    try {
      await exportToPNG(state.patient);
      toast({
        title: "Export Successful",
        description: "Audiogram has been exported as PNG.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export PNG. Please try again.",
        variant: "destructive",
      });
    }
  }, [validatePatientData, state.patient, toast]);

  const handleReset = useCallback(() => {
    resetAll();
    setValidationErrors([]);
    toast({
      title: "Reset Complete",
      description: "All data has been reset to default values.",
    });
  }, [resetAll, toast]);

  const handleRightEditingChange = useCallback((value: string) => {
    setEditingMode('right', value as 'air' | 'bone');
  }, [setEditingMode]);

  const handleLeftEditingChange = useCallback((value: string) => {
    setEditingMode('left', value as 'air' | 'bone');
  }, [setEditingMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Audiogram Visualizer
            </h1>
            <ThemeToggle theme={state.theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="export-area">
        {/* Patient Information Form */}
        <PatientForm
          patientData={state.patient}
          onUpdatePatientData={updatePatientData}
          validationErrors={validationErrors}
        />

        {/* Audiogram Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <AudiogramChart
            ear="right"
            data={state.right}
            editingMode={state.editing}
            onUpdateThreshold={updateThreshold}
            onEnlarge={() => handleEnlargeChart('right')}
          />
          
          <AudiogramChart
            ear="left"
            data={state.left}
            editingMode={state.editing}
            onUpdateThreshold={updateThreshold}
            onEnlarge={() => handleEnlargeChart('left')}
          />
        </div>

        {/* Controls */}
        <Card className="transition-colors duration-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              
              {/* Editing Controls */}
              <div className="flex flex-wrap items-center gap-8">
                
                {/* Right Ear Editing */}
                <fieldset className="flex items-center gap-4">
                  <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    Right Ear Editing:
                  </legend>
                  <RadioGroup
                    value={state.editing.right}
                    onValueChange={handleRightEditingChange}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="air" 
                        id="right-air"
                        data-testid="radio-right-air"
                        className="text-medical-red"
                      />
                      <Label htmlFor="right-air" className="cursor-pointer">Air</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="bone" 
                        id="right-bone"
                        data-testid="radio-right-bone"
                        className="text-medical-red"
                      />
                      <Label htmlFor="right-bone" className="cursor-pointer">Bone</Label>
                    </div>
                  </RadioGroup>
                </fieldset>
                
                {/* Left Ear Editing */}
                <fieldset className="flex items-center gap-4">
                  <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    Left Ear Editing:
                  </legend>
                  <RadioGroup
                    value={state.editing.left}
                    onValueChange={handleLeftEditingChange}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="air" 
                        id="left-air"
                        data-testid="radio-left-air"
                        className="text-medical-blue"
                      />
                      <Label htmlFor="left-air" className="cursor-pointer">Air</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="bone" 
                        id="left-bone"
                        data-testid="radio-left-bone"
                        className="text-medical-blue"
                      />
                      <Label htmlFor="left-bone" className="cursor-pointer">Bone</Label>
                    </div>
                  </RadioGroup>
                </fieldset>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset"
                  className="text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleExport}
                  data-testid="button-export"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Export PNG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Chart Modal */}
      <ChartModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        ear={modalState.ear}
        data={state}
        editingMode={state.editing}
        onUpdateThreshold={updateThreshold}
        onSetEditingMode={setEditingMode}
      />
    </div>
  );
}
