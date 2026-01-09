import React, { useEffect, useRef } from 'react';

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropPoint = {
  x: number;
  y: number;
};

type SimpleCropperProps = {
  image: string;
  crop: CropPoint;
  zoom: number;
  aspect: number;
  onCropChange: (crop: CropPoint) => void;
  onZoomChange?: (zoom: number) => void;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
};

const SimpleCropper: React.FC<SimpleCropperProps> = ({
  image,
  crop,
  zoom,
  aspect,
  onCropChange,
  onZoomChange,
  onCropComplete,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    if (!image || !onCropComplete) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const area = {
        x: 0,
        y: 0,
        width: aspect ? size : img.naturalWidth,
        height: aspect ? size : img.naturalHeight,
      };
      onCropComplete(area, area);
    };
  }, [image, aspect, onCropComplete]);

  return (
    <div className="simple-cropper" style={{ position: 'relative', width: '100%', height: 260, overflow: 'hidden', borderRadius: 12, background: '#f2f2f6' }}>
      <img
        ref={imgRef}
        src={image}
        alt="Prévia para recorte"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
          transition: 'transform 0.2s ease',
        }}
        onLoad={() => onCropChange(crop)}
      />
    </div>
  );
};

export default SimpleCropper;
