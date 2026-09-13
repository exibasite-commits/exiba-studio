export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (padrão: 0.82)
  mimeType?: 'image/webp' | 'image/jpeg';
}

export interface CompressResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

/**
 * Comprime e redimensiona uma imagem no navegador usando HTML5 Canvas.
 * Transforma fotos de 3MB a 10MB em arquivos WebP ultraleves de ~80KB a 150KB.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  // Se for vídeo, não comprime via Canvas
  if (file.type.startsWith('video/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          file,
          dataUrl: String(reader.result || ''),
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Mantém a proporção de aspecto limitando a maxWidth / maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível inicializar o contexto 2D do Canvas.'));
          return;
        }

        // Configuração para interpolação suave
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Gera o DataURL comprimido
        let dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Se o navegador não suportar WebP no toDataURL, usa JPEG como fallback
        if (!dataUrl.startsWith('data:image/webp') && mimeType === 'image/webp') {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Converte o canvas para Blob / File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao exportar Blob da imagem comprimida.'));
              return;
            }

            const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
            const finalExt = mimeType === 'image/webp' ? '.webp' : '.jpg';
            const compressedFile = new File([blob], `${cleanBaseName}${finalExt}`, {
              type: blob.type,
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const reduction = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize,
              compressedSize,
              reductionPercentage: reduction,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Falha ao decodificar a imagem para compressão.'));
      img.src = String(e.target?.result || '');
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo local.'));
    reader.readAsDataURL(file);
  });
}
