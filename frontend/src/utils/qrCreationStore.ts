import { create } from 'zustand';
import { QrCreationState, QrStyles } from './qrCreationStoreTypes';

const initialQrStyles: QrStyles = {
  qrForegroundColor: "#000000", // Reverted to black
  qrBackgroundColor: "#FFFFFF", // Kept as white (newly added)
  dotsStyle: "square",
  cornerStyle: "square",
  useCustomCornerColor: false,
  qrCornerColor: "#000000", // Reverted to black, to match foreground default
  logoUrl: undefined,
  logoSize: 0.15, // Default logo size (e.g., 15% of QR code size)
};

const initialState: Omit<QrCreationState, "actions"> = {
  qrCodeId: null,
  storeHash: null,
  currentStep: 1,
  qrType: null,
  qrName: "",
  destinationUrl: "",
  selectedProductId: null,
  selectedCategoryId: null,
  qrStyles: { ...initialQrStyles },
  qrPreviewImage: null,
  isSaved: false,
  savedQrCodeId: null,
};

export const useQrCreationStore = create<QrCreationState>()((set, get) => ({
  ...initialState,
  actions: {
    setQrCodeId: (id) => set({ qrCodeId: id }),
    setStoreHash: (hash) => set({ storeHash: hash }),
    setCurrentStep: (step) => set({ currentStep: step }),
    setQrType: (type) => set({ qrType: type }),
    setQrName: (name) => set({ qrName: name }),
    setDestinationUrl: (url) => set({ destinationUrl: url }),
    setQrStyle: (styleKey, value) =>
      set((state) => ({
        qrStyles: { ...state.qrStyles, [styleKey]: value },
      })),
    setAllQrStyles: (styles) =>
      set((state) => ({
        qrStyles: { ...state.qrStyles, ...styles },
      })),
    
    // Specific style setters implementation
    setQrForegroundColor: (color) => 
      set((state) => ({ qrStyles: { ...state.qrStyles, qrForegroundColor: color }})),
    setQrBackgroundColor: (color) => 
      set((state) => ({ qrStyles: { ...state.qrStyles, qrBackgroundColor: color }})),
    setQrDotsStyle: (style) =>
      set((state) => ({ qrStyles: { ...state.qrStyles, dotsStyle: style }})),
    setQrCornerStyle: (style) =>
      set((state) => ({ qrStyles: { ...state.qrStyles, cornerStyle: style }})),
    setUseCustomCornerColor: (use) => // Retained
      set((state) => ({ qrStyles: { ...state.qrStyles, useCustomCornerColor: use }})),
    setQrCornerColor: (color) => 
      set((state) => ({ qrStyles: { ...state.qrStyles, qrCornerColor: color }})),
    setQrLogoUrl: (url) => 
      set((state) => ({ qrStyles: { ...state.qrStyles, logoUrl: url || undefined }})),
    setQrLogoSize: (size) => 
      set((state) => ({ qrStyles: { ...state.qrStyles, logoSize: size }})),

    setQrPreviewImage: (image) => set({ qrPreviewImage: image }),
    setIsSaved: (saved) => set({ isSaved: saved }),
    setSavedQrCodeId: (id) => set({ savedQrCodeId: id }),
    setSelectedProductId: (id) => set({ selectedProductId: id }),
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    resetStore: () =>
      set((state) => ({ 
        ...initialState,
        qrStyles: { ...initialQrStyles },
        selectedProductId: null, // Ensure these are reset too
        selectedCategoryId: null,
        savedQrCodeId: null,
        actions: state.actions,
      })),
  },
}));

// Selector to easily access actions
export const useQrCreationStoreActions = () => useQrCreationStore((state) => state.actions);
