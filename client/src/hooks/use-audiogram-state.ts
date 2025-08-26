import { useState, useEffect, useCallback } from 'react';

export interface Thresholds {
  [frequency: number]: number;
}

export interface EarData {
  air: Thresholds;
  bone: Thresholds;
}

export interface PatientData {
  name: string;
  examDate: string;
  birthDate: string;
}

export interface EditingMode {
  ear: 'right' | 'left';
  conduction: 'air' | 'bone';
}

export interface AudiogramState {
  right: EarData;
  left: EarData;
  editing: EditingMode;
  patient: PatientData;
  theme: 'light' | 'dark';
}

const frequencies = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];

const defaultThresholds = (): Thresholds => {
  const thresholds: Thresholds = {};
  frequencies.forEach(freq => {
    thresholds[freq] = 10; // Air default
  });
  return thresholds;
};

const defaultBoneThresholds = (): Thresholds => {
  const thresholds: Thresholds = {};
  frequencies.forEach(freq => {
    thresholds[freq] = 5; // Bone default
  });
  return thresholds;
};

const initialState: AudiogramState = {
  right: {
    air: defaultThresholds(),
    bone: defaultBoneThresholds(),
  },
  left: {
    air: defaultThresholds(),
    bone: defaultBoneThresholds(),
  },
  editing: { ear: 'right', conduction: 'air' },
  patient: { name: '', examDate: '', birthDate: '' },
  theme: 'light',
};

export function useAudiogramState() {
  const [state, setState] = useState<AudiogramState>(() => {
    const savedTheme = localStorage.getItem('audiogram-theme');
    return {
      ...initialState,
      theme: (savedTheme as 'light' | 'dark') || 'light',
    };
  });

  // Apply theme changes to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('audiogram-theme', state.theme);
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const updateThreshold = useCallback((ear: 'right' | 'left', conduction: 'air' | 'bone', frequency: number, value: number) => {
    // Clamp value to range [-10, 120] and snap to 5 dB increments
    const clampedValue = Math.max(-10, Math.min(120, Math.round(value / 5) * 5));
    
    setState(prev => ({
      ...prev,
      [ear]: {
        ...prev[ear],
        [conduction]: {
          ...prev[ear][conduction],
          [frequency]: clampedValue,
        },
      },
    }));
  }, []);

  const setEditingMode = useCallback((ear: 'right' | 'left', conduction: 'air' | 'bone') => {
    setState(prev => ({
      ...prev,
      editing: { ear, conduction },
    }));
  }, []);

  const updatePatientData = useCallback((field: keyof PatientData, value: string) => {
    setState(prev => ({
      ...prev,
      patient: {
        ...prev.patient,
        [field]: value,
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(prev => ({
      ...initialState,
      theme: prev.theme, // Preserve theme
    }));
  }, []);

  const validatePatientData = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!state.patient.name.trim()) {
      errors.push('Patient Name is required');
    }
    if (!state.patient.examDate.trim()) {
      errors.push('Date of Examination is required');
    }
    if (!state.patient.birthDate.trim()) {
      errors.push('Birth Date is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state.patient]);

  return {
    state,
    frequencies,
    toggleTheme,
    updateThreshold,
    setEditingMode,
    updatePatientData,
    resetAll,
    validatePatientData,
  };
}
