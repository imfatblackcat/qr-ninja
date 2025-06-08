export interface QrStyles {
  qrForegroundColor: string; // Renamed from qrColor
  qrBackgroundColor: string; // Added for background
  dotsStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'diamond' | 'star' | 'heart' | 'hexagon' | 'circle' | 'plus' | 'cross' | 'lines' | 'vertical-lines' | 'horizontal-lines' | 'grid' | 'random-dots' | 'fluid' | 'fluent' | 'rounded-fluent' | 'classic' | 'pebble' | 'cornered-pebble' | 'sharp-pebble' | 'star-points' | 'flower' | 'leaf' | 'drop' | 'raindrop' | 'bubble' | 'round-bubble' | 'box-bubble' | 'round-box-bubble' | 'tear' | 'round-tear' | 'cornered-tear' | 'sharp-tear' | 'cat' | 'dog' | 'bear' | 'panda' | 'koala' | 'rabbit' | 'fox' | 'unicorn' | 'dragon' | 'alien' | 'ghost' | 'robot' | 'pumpkin' | 'christmas-tree' | 'snowflake' | 'gift' | 'bell' | 'star-stroke' | 'heart-stroke' | 'diamond-stroke' | 'hexagon-stroke' | 'circle-stroke' | 'plus-stroke' | 'cross-stroke' | 'lines-stroke' | 'vertical-lines-stroke' | 'horizontal-lines-stroke' | 'grid-stroke' | 'fluid-stroke' | 'fluent-stroke' | 'rounded-fluent-stroke' | 'classic-stroke' | 'pebble-stroke' | 'cornered-pebble-stroke' | 'sharp-pebble-stroke' | 'star-points-stroke' | 'flower-stroke' | 'leaf-stroke' | 'drop-stroke' | 'raindrop-stroke' | 'bubble-stroke' | 'round-bubble-stroke' | 'box-bubble-stroke' | 'round-box-bubble-stroke' | 'tear-stroke' | 'round-tear-stroke' | 'cornered-tear-stroke' | 'sharp-tear-stroke'; // Extended based on typical QR gen options, can be trimmed to match current app
  cornerStyle: 'square' | 'dots' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'fluent' | 'rounded-fluent' | 'pebble' | 'cornered-pebble' | 'sharp-pebble' | 'star-points' | 'flower' | 'leaf' | 'drop' | 'raindrop' | 'bubble' | 'round-bubble' | 'box-bubble' | 'round-box-bubble' | 'tear' | 'round-tear' | 'cornered-tear' | 'sharp-tear'; // Extended, can be trimmed
  useCustomCornerColor: boolean;
  qrCornerColor?: string; // Renamed from cornerColor, made optional to default to foreground
  logoUrl?: string; // Added for logo support
  logoSize?: number; // Added for logo size configuration
}

export interface QrCreationState {
  qrCodeId: string | null;
  storeHash: string | null;
  currentStep: number;
  qrType: 'customUrl' | 'product' | 'category' | 'homepage' | null;
  qrName: string;
  destinationUrl: string;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  qrStyles: QrStyles;
  qrPreviewImage: string | null;
  isSaved: boolean;
  savedQrCodeId: string | null;
  actions: {
    setQrCodeId: (id: string | null) => void;
    setStoreHash: (hash: string | null) => void;
    setCurrentStep: (step: number) => void;
    setQrType: (type: QrCreationState['qrType']) => void;
    setQrName: (name: string) => void;
    setDestinationUrl: (url: string) => void;
    // Generic style setter (can be kept or removed if specific setters cover all needs)
    setQrStyle: <K extends keyof QrStyles>(styleKey: K, value: QrStyles[K]) => void;
    setAllQrStyles: (styles: Partial<QrStyles>) => void;

    // Specific style setters for easier use in components and to fix onSave issue
    setQrForegroundColor: (color: string) => void; 
    setQrBackgroundColor: (color: string) => void;
    setQrDotsStyle: (style: QrStyles['dotsStyle']) => void;
    setQrCornerStyle: (style: QrStyles['cornerStyle']) => void;
    setUseCustomCornerColor: (use: boolean) => void; // Retained if direct control is needed
    setQrCornerColor: (color: string) => void;
    setQrLogoUrl: (url: string | null) => void;
    setQrLogoSize: (size: number) => void;

    setQrPreviewImage: (image: string | null) => void;
    setIsSaved: (saved: boolean) => void;
    setSavedQrCodeId: (id: string | null) => void;

    setSelectedProductId: (id: string | null) => void;
    setSelectedCategoryId: (id: string | null) => void;
    resetStore: () => void;

  };
}
