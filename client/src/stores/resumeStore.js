import { create } from 'zustand';

const useResumeStore = create((set, get) => ({
  currentResume: null,
  currentVersion: null,
  generatedContent: null,
  atsResult: null,
  isGenerating: false,
  isScoring: false,
  streamProgress: '',
  streamTokens: '',
  selectedTemplate: 'modern',

  setResume: (resume) => set({ currentResume: resume }),
  setVersion: (version) => set({ currentVersion: version }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  setAtsResult: (result) => set({ atsResult: result }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setIsScoring: (val) => set({ isScoring: val }),
  setStreamProgress: (step) => set({ streamProgress: step }),
  setStreamTokens: (tokens) => set({ streamTokens: tokens }),
  appendStreamToken: (token) => set((state) => ({
    streamTokens: state.streamTokens + token
  })),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  resetBuilder: () => set({
    currentResume: null,
    currentVersion: null,
    generatedContent: null,
    atsResult: null,
    isGenerating: false,
    isScoring: false,
    streamProgress: '',
    streamTokens: '',
  }),
}));

export default useResumeStore;
