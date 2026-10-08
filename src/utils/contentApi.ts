import { ConfessionConfig, DiaryStarEntry, MemoryStarPhoto } from '../types';

export interface ServerContentPayload {
  config?: ConfessionConfig;
  memoryStars?: MemoryStarPhoto[];
  diaryStars?: DiaryStarEntry[];
}

export async function fetchContent(): Promise<ServerContentPayload> {
  const response = await fetch('/api/content');
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.status}`);
  }
  return response.json();
}

export async function saveContent(payload: ServerContentPayload): Promise<void> {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to save content: ${response.status}`);
  }
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status}`);
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Upload response did not include a file URL');
  }

  return data.url;
}
