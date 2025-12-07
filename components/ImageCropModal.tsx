/**
 * ImageCropModal Component - V2
 * 
 * A modal component for cropping images before upload.
 * Features:
 * - 15 aspect ratio presets + free crop + original
 * - Responsive grid (3/4/5 columns)
 * - Touch-friendly (44px min button size)
 * - Compact design with internal scroll
 * - Body scroll lock when open
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

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white w-full max-h-[calc(100vh-16px)] md:max-h-[85vh] md:rounded-xl md:w-full md:max-w-lg overflow-hidden shadow-2xl flex flex-col">
                {/* Header - Compact */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                    <h3 className="text-base font-bold">{title}</h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {/* Cropper Area - Reduced height */}
                    <div className="relative h-[200px] md:h-[240px] bg-gray-900">
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

                    {/* Zoom Controls - Compact */}
                    <div className="px-4 py-2 bg-gray-50 border-b">
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                        {originalFile && (
                            <p className="text-[10px] text-gray-400 mt-1 text-center">
                                Original: {formatFileSize(originalFile.size)} • WebP
                            </p>
                        )}
                    </div>

                    {/* Aspect Ratio Selector - Compact */}
                    {shouldShowAspectSelector && (
                        <div className="px-3 py-2 border-b">
                            <div className="grid grid-cols-5 gap-1.5">
                                {ASPECT_RATIOS.map((ratio) => {
                                    const isSelected = selectedAspect === ratio.value;
                                    return (
                                        <button
                                            key={ratio.name}
                                            type="button"
                                            onClick={() => setSelectedAspect(ratio.value)}
                                            className={`py-1.5 px-1 rounded border transition-all flex flex-col items-center justify-center gap-0.5 ${isSelected
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-200 hover:border-gray-400 text-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center h-4">
                                                {ratio.value === null ? (
                                                    <span className="text-xs">⬜</span>
                                                ) : ratio.value === 'original' ? (
                                                    <span className="text-xs">📷</span>
                                                ) : (
                                                    <div
                                                        className={`border rounded-sm ${isSelected ? 'border-white' : 'border-current'} ${ratio.vertical ? 'w-2 h-3' : ratio.value === 1 ? 'w-3 h-3' : 'w-4 h-2'
                                                            }`}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[9px] font-medium leading-none">{ratio.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="px-4 py-3 flex gap-2 justify-end shrink-0 bg-white border-t">
                    {!requireCrop && originalFile && (
                        <button
                            onClick={handleSkipCrop}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            <SkipForward className="w-4 h-4" />
                            Pular
                        </button>
                    )}
                    <button
                        onClick={handleCropConfirm}
                        disabled={isProcessing || !croppedAreaPixels}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>...</span>
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
