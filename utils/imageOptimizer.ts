/**
 * Image Optimization Utilities
 * 
 * Provides client-side image compression and optimization before upload.
 * Uses browser-image-compression for WebP conversion and resize.
 */

import imageCompression from 'browser-image-compression';

// Optimization presets by image type
export const IMAGE_PRESETS = {
    avatar: {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        quality: 0.8,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    },
    projectHero: {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        quality: 0.85,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    },
    projectGallery: {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        quality: 0.8,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    },
    product: {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 800,
        quality: 0.8,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    },
    // For general images without specific requirements
    default: {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        quality: 0.8,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

/**
 * Compress and optimize an image file
 * @param file - Original image file
 * @param preset - Optimization preset to use
 * @returns Compressed image file (WebP format)
 */
export async function optimizeImage(
    file: File,
    preset: ImagePreset = 'default'
): Promise<File> {
    const options = IMAGE_PRESETS[preset];

    try {
        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // Generate a new filename with .webp extension
        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${originalName}.webp`;

        // Create a new File object with the correct name
        return new File([compressedFile], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error('Image optimization failed:', error);
        // Return original file if optimization fails
        return file;
    }
}

/**
 * Get image dimensions from a file
 * @param file - Image file
 * @returns Promise with width and height
 */
export async function getImageDimensions(
    file: File
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Convert a Blob to a File
 * @param blob - Blob to convert
 * @param fileName - Name for the new file
 * @returns File object
 */
export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, {
        type: blob.type || 'image/webp',
        lastModified: Date.now(),
    });
}

/**
 * Create cropped image from canvas with optional rotation
 * @param imageSrc - Source image URL or base64
 * @param pixelCrop - Crop area in pixels { x, y, width, height }
 * @param rotation - Rotation in degrees (0, 90, 180, 270)
 * @returns Cropped image as Blob
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation: number = 0
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Calculate bounding box of the rotated image
    const rotRad = (rotation * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to the rotated image size
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Rotate around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw the rotated image
    ctx.drawImage(image, 0, 0);

    // Extract the cropped area
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Set canvas to crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Put cropped data
    ctx.putImageData(data, 0, 0);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            },
            'image/webp',
            0.9
        );
    });
}

/**
 * Calculate the size of the rotated image
 */
function getRotatedSize(width: number, height: number, rotation: number) {
    const rotRad = (rotation * Math.PI) / 180;
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * Create an Image element from a source URL
 * @param url - Image URL or base64
 * @returns Promise with HTMLImageElement
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

/**
 * Read file as data URL (base64)
 * @param file - File to read
 * @returns Base64 data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
