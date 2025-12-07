/**
 * ImageCropModal Component - V2
 * 
 * A modal component for cropping images before upload.
 * Features:
 * - 15 aspect ratio presets + free crop + original
 * - Responsive grid (3/4/5 columns)
 * - Touch-friendly (44px min button size)
 * - Fullscreen on mobile
 */

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, SkipForward } from 'lucide-react';
import { getCroppedImg, blobToFile, optimizeImage, formatFileSize, readFileAsDataURL, type ImagePreset, getImageDimensions } from '../utils/imageOptimizer';

// Aspect ratio options
const ASPECT_RATIOS: { name: string; value: number | null | 'original'; vertical: boolean }[] = [
    { name: 'Livre', value: null, vertical: false },
    { name: 'Original', value: 'original', vertical: false },
    { name: '1:1', value: 1, vertical: false },
    { name: '9:16', value: 9 / 16, vertical: true },
    { name: '16:9', value: 16 / 9, vertical: false },
    { name: '4:5', value: 4 / 5, vertical: true },
    { name: '5:4', value: 5 / 4, vertical: false },
    { name: '3:4', value: 3 / 4, vertical: true },
    { name: '4:3', value: 4 / 3, vertical: false },
    { name: '2:3', value: 2 / 3, vertical: true },
    { name: '3:2', value: 3 / 2, vertical: false },
    { name: '5:7', value: 5 / 7, vertical: true },
    { name: '7:5', value: 7 / 5, vertical: false },
    { name: '1:2', value: 1 / 2, vertical: true },
    { name: '2:1', value: 2 / 1, vertical: false },
];

interface ImageCropModalProps {
    image: string;
    originalFile?: File;
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (file: File) => void;
    aspect?: number | null;
    cropShape?: 'rect' | 'round';
    preset?: ImagePreset;
    requireCrop?: boolean;
    showAspectSelector?: boolean;
    title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    image,
    originalFile,
    isOpen,
    onClose,
    onCropComplete,
    aspect: initialAspect = 1,
    cropShape = 'rect',
    preset = 'default',
    requireCrop = false,
    showAspectSelector = true,
    title = 'Ajustar Imagem',
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAspect, setSelectedAspect] = useState<number | null | 'original'>(initialAspect);
    const [originalAspect, setOriginalAspect] = useState<number>(1);

    useEffect(() => {
        if (originalFile && isOpen) {
            getImageDimensions(originalFile).then(({ width, height }) => {
                setOriginalAspect(width / height);
            }).catch(() => {
                setOriginalAspect(1);
            });
        }
    }, [originalFile, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            setSelectedAspect(requireCrop ? 1 : initialAspect);
        }
    }, [isOpen, initialAspect, requireCrop]);

    const getActualAspect = (): number | undefined => {
        if (selectedAspect === null) return undefined;
        if (selectedAspect === 'original') return originalAspect;
        return selectedAspect;
    };

    const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
            const fileName = originalFile?.name || 'cropped-image.webp';
            const croppedFile = blobToFile(croppedBlob, fileName.replace(/\.[^/.]+$/, '.webp'));
            const optimizedFile = await optimizeImage(croppedFile, preset);
            onCropComplete(optimizedFile);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [croppedAreaPixels, image, originalFile, preset, onCropComplete, onClose]);

    const handleSkipCrop = useCallback(async () => {
        if (!originalFile) return;
        setIsProcessing(true);
        try {
            const optimizedFile = await optimizeImage(originalFile, preset);
            onCropComplete(optimizedFile);
            onClose();
        } catch (error) {
            console.error('Error optimizing image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [originalFile, preset, onCropComplete, onClose]);

    if (!isOpen) return null;

    const shouldShowAspectSelector = showAspectSelector && !requireCrop;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full h-full md:h-auto md:max-h-[95vh] md:rounded-2xl md:w-full md:max-w-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-gray-100 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 min-h-[250px] md:min-h-[320px] bg-gray-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={getActualAspect()}
                        cropShape={cropShape}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropAreaChange}
                        showGrid={true}
                    />
                </div>

                {/* Zoom Controls */}
                <div className="p-3 md:p-4 bg-gray-50 border-b shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <ZoomOut className="w-5 h-5 text-gray-400 shrink-0" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-grow h-3 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black touch-pan-x"
                        />
                        <ZoomIn className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                    {originalFile && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Original: {formatFileSize(originalFile.size)} • Será otimizada para WebP
                        </p>
                    )}
                </div>

                {/* Aspect Ratio Selector */}
                {shouldShowAspectSelector && (
                    <div className="p-3 md:p-4 border-b shrink-0 overflow-x-auto">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                            {ASPECT_RATIOS.map((ratio) => {
                                const isSelected = selectedAspect === ratio.value;
                                return (
                                    <button
                                        key={ratio.name}
                                        type="button"
                                        onClick={() => setSelectedAspect(ratio.value)}
                                        className={`min-h-[44px] p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${isSelected
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-400 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            {ratio.value === null ? (
                                                <span className="text-lg">⬜</span>
                                            ) : ratio.value === 'original' ? (
                                                <span className="text-lg">📷</span>
                                            ) : (
                                                <div
                                                    className={`border-2 rounded-sm ${isSelected ? 'border-white' : 'border-current'} ${ratio.vertical ? 'w-3 h-5' : ratio.value === 1 ? 'w-4 h-4' : 'w-5 h-3'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                        <span className="text-[10px] md:text-xs font-medium">{ratio.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 flex gap-3 justify-end shrink-0 bg-white">
                    {!requireCrop && originalFile && (
                        <button
                            onClick={handleSkipCrop}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 px-4 md:px-5 py-3 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 min-h-[44px]"
                        >
                            <SkipForward className="w-4 h-4" />
                            <span className="hidden sm:inline">Pular Recorte</span>
                            <span className="sm:hidden">Pular</span>
                        </button>
                    )}
                    <button
                        onClick={handleCropConfirm}
                        disabled={isProcessing || !croppedAreaPixels}
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 min-h-[44px] flex-1 sm:flex-initial"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">Processando...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Confirmar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export function useImageCropModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [imageSource, setImageSource] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const openCropModal = useCallback(async (file: File) => {
        const dataUrl = await readFileAsDataURL(file);
        setImageSource(dataUrl);
        setSelectedFile(file);
        setIsOpen(true);
    }, []);

    const closeCropModal = useCallback(() => {
        setIsOpen(false);
        setImageSource('');
        setSelectedFile(null);
    }, []);

    return {
        isOpen,
        imageSource,
        selectedFile,
        openCropModal,
        closeCropModal,
    };
}
