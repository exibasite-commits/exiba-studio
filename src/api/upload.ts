import { compressImage, CompressOptions } from '../utils/imageCompressor';

export interface UploadResult {
  url: string;
  originalName: string;
  size: number;
  type: 'image' | 'video';
  isFallback: boolean;
}

/**
 * Envia um arquivo (imagem ou vídeo) para o backend com compressão automática.
 * Se o backend estiver offline (modo demonstração), utiliza a imagem comprimida localmente (WebP leve).
 */
export async function uploadMediaFile(
  file: File,
  options?: CompressOptions
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  
  // 1. Comprime no cliente se for imagem
  let compressedResult: { file: File; dataUrl: string; compressedSize: number } = {
    file,
    dataUrl: '',
    compressedSize: file.size,
  };

  try {
    if (!isVideo) {
      compressedResult = await compressImage(file, options);
    }
  } catch (err) {
    console.warn('[Upload] Aviso na compressão client-side, prosseguindo com original:', err);
  }

  // 2. Tenta fazer o upload multipart no endpoint do backend
  try {
    const formData = new FormData();
    formData.append('file', compressedResult.file);

    const base = import.meta.env.VITE_API_URL ?? '';
    const res = await fetch(`${base}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url,
        originalName: data.originalName || file.name,
        size: data.size || compressedResult.compressedSize,
        type: isVideo ? 'video' : 'image',
        isFallback: false,
      };
    }
  } catch (err) {
    // Backend offline / modo demonstração
    console.info('[Upload] Backend indisponível, usando fallback comprimido localmente.');
  }

  // 3. Fallback inteligente: se não foi possível subir no servidor, usa o DataURL comprimido
  let fallbackUrl = compressedResult.dataUrl;
  if (!fallbackUrl) {
    fallbackUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
  }

  return {
    url: fallbackUrl,
    originalName: file.name,
    size: compressedResult.compressedSize,
    type: isVideo ? 'video' : 'image',
    isFallback: true,
  };
}

/**
 * Upload de múltiplos arquivos com relatório de progresso.
 */
export async function uploadMultipleMedia(
  files: File[],
  options?: CompressOptions,
  onProgress?: (current: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const res = await uploadMediaFile(files[i], options);
    results.push(res);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return results;
}
