import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  saveResponse(response: HttpResponse<Blob>, fallbackName: string): void {
    const blob = response.body;
    if (!blob) {
      return;
    }

    const contentDisposition = response.headers.get('content-disposition') ?? '';
    const fileName = this.fileNameFromDisposition(contentDisposition) || fallbackName;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private fileNameFromDisposition(contentDisposition: string): string {
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(contentDisposition);
    return decodeURIComponent(match?.[1] || match?.[2] || '');
  }
}
