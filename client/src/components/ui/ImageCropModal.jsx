import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const targetWidth = 256;
  const targetHeight = 256;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

const ImageCropModal = ({ imageSrc, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="neu-card flex flex-col w-full max-w-md bg-neu-bg animate-scale-in relative overflow-hidden h-[500px]">
        <div className="flex items-center justify-between pb-4 z-10 relative bg-neu-bg">
          <h2 className="font-display font-bold text-lg">Crop Image</h2>
          <button onClick={onClose} className="neu-btn px-2 py-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-1 bg-gray-200 rounded-lg overflow-hidden my-4" style={{ minHeight: '300px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="flex flex-col gap-4 z-10 relative bg-neu-bg">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neu-text-muted">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-neu-primary h-2 bg-neu-bg rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="neu-btn px-4 py-2 text-sm"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="neu-btn-primary px-6 py-2 text-sm flex items-center gap-2"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  <Check className="w-4 h-4" />
                  Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
