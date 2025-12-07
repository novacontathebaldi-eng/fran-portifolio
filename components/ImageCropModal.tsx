/**
 * ImageCropModal Component
 * 
 * A modal component for cropping images before upload.
 * Uses react-easy-crop for crop functionality.
 */

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, SkipForward } from 'lucide-react';
import { getCroppedImg, blobToFile, optimizeImage, formatFileSize, readFileAsDataURL, type ImagePreset } from '../utils/imageOptimizer';

interface ImageCropModalProps {
    /** Image source (base64 or URL) */
    image: string;
    /** Original file (for optimization) */
    originalFile?: File;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** Callback when crop is complete - returns optimized File */
    onCropComplete: (file: File) => void;
    /** Aspect ratio for crop (1 for 1:1, 16/9 for 16:9, etc.) */
    aspect?: number;
    /** Shape of crop area */
    cropShape?: 'rect' | 'round';
    /** Optimization preset to use */
    preset?: ImagePreset;
    /** Whether to require crop (hide skip button) */
    requireCrop?: boolean;
    /** Title for the modal */
    title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    image,
    originalFile,
    isOpen,
    onClose,
    onCropComplete,
    aspect = 1,
    cropShape = 'rect',
    preset = 'default',
    requireCrop = false,
    title = 'Ajustar Imagem',
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Handle crop confirmation
    const handleCropConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            // Get cropped image as blob
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);

            // Convert to file
            const fileName = originalFile?.name || 'cropped-image.webp';
            const croppedFile = blobToFile(croppedBlob, fileName.replace(/\.[^/.]+$/, '.webp'));

            // Optimize the cropped image
            const optimizedFile = await optimizeImage(croppedFile, preset);

            onCropComplete(optimizedFile);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [croppedAreaPixels, image, originalFile, preset, onCropComplete, onClose]);

    // Handle skip crop - just optimize original
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

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative h-80 bg-gray-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={cropShape}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropAreaChange}
                        showGrid={true}
                    />
                </div>

                {/* Zoom Controls */}
                <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-5 h-5 text-gray-400" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <ZoomIn className="w-5 h-5 text-gray-400" />
                    </div>
                    {originalFile && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Original: {formatFileSize(originalFile.size)} • Será otimizada para WebP
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex gap-3 justify-end">
                    {!requireCrop && originalFile && (
                        <button
                            onClick={handleSkipCrop}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            <SkipForward className="w-4 h-4" />
                            Pular Recorte
                        </button>
                    )}
                    <button
                        onClick={handleCropConfirm}
                        disabled={isProcessing || !croppedAreaPixels}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processando...
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

// Hook to help with image selection and crop modal state
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
