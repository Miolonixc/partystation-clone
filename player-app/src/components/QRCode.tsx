import { useMemo } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const svg = useMemo(() => generateQRSvg(value, size), [value, size]);
  return (
    <div
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function generateQRSvg(text: string, size: number): string {
  const modules = generateQRMatrix(text);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;
  let rects = '';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = col * cellSize;
        const y = row * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#fff"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#1A1A2E"/>
    ${rects}
  </svg>`;
}

function generateQRMatrix(text: string): boolean[][] {
  const data = encode(text);
  const size = Math.max(21, Math.ceil(Math.sqrt(data.length * 8)) | 1);
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);
  addTimingPatterns(matrix, size);

  let bitIndex = 0;
  const dataBits = textToBits(text);

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col--;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const actualCol = col - c;
        if (actualCol < 0 || actualCol >= size) continue;
        if (isReserved(matrix, row, actualCol, size)) continue;
        matrix[row][actualCol] = bitIndex < dataBits.length ? dataBits[bitIndex] === 1 : false;
        bitIndex++;
      }
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[row + r][col + c] = isOuter || isInner;
    }
  }
}

function addTimingPatterns(matrix: boolean[][], size: number) {
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
}

function isReserved(matrix: boolean[][], row: number, col: number, size: number): boolean {
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  if (row === 6 || col === 6) return true;
  return false;
}

function textToBits(text: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      bits.push((charCode >> b) & 1);
    }
  }
  return bits;
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
