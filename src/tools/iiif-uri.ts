import { Image } from '@/types';

const calculateCrop = (sourceSize: number, requestedSize: number, ratio: number) => {
  const cropSize = Math.ceil(ratio * requestedSize);
  const focalPoint = Math.round(sourceSize * 0.5);
  let cropStart = focalPoint - cropSize / 2;
  let cropEnd = cropStart + cropSize;

  if (cropStart < 0) {
    cropEnd -= cropStart;
    cropStart = 0;
  } else if (cropEnd > sourceSize) {
    cropStart -= cropEnd - sourceSize;
    cropEnd = sourceSize;
  }

  return [Math.ceil(cropStart), Math.ceil(cropEnd)];
};

const calculateRegion = (image: Image, requestedW: number, requestedH: number) => {
  const sourceW = image.size.width;
  const sourceH = image.size.height;
  const ratioWidth = sourceW / requestedW;
  const ratioHeight = sourceH / requestedH;
  let x: number;
  let y: number;
  let x2: number;
  let y2: number;

  if (ratioHeight < ratioWidth) {
    [x, x2] = calculateCrop(sourceW, requestedW, ratioHeight);
    y = 0;
    y2 = sourceH;
  } else {
    [y, y2] = calculateCrop(sourceH, requestedH, ratioWidth);
    x = 0;
    x2 = sourceW;
  }

  const w = x2 - x;
  const h = y2 - y;

  const result = `${x},${y},${w},${h}`;

  return `0,0,${sourceW},${sourceH}` === result ? 'full' : result;
};

const dimensionNeeded = (originalOne: number, originalTwo: number, one: number, two: number) =>
  !(one === originalOne || one === two / (originalOne / originalTwo));

export const iiifUri = (image: Image, width: number, height: number): string => {
  const uri = image.uri;
  let region = 'full';
  let size = 'full';
  let newWidth: number | null = width;
  let newHeight: number | null = height;

  if (width / height !== image.size.width / image.size.height) {
    region = calculateRegion(image, width, height);

    if (!dimensionNeeded(image.size.height, image.size.width, height, width)) {
      newHeight = null;
    }
    if (!dimensionNeeded(image.size.width, image.size.height, width, height)) {
      newWidth = null;
    }
    if (newWidth && newHeight) {
      size = `${width},${height}`;
    }
  }

  const [mediaType] = image.source.mediaType.split(';');
  const extension = mediaType === 'image/png' ? 'png' : 'jpg';

  return `${uri}/${region}/${size}/0/default.${extension}`;
};
