import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileAttachmentDto } from '../../features/peopleos/models/peopleos.dto';

@Injectable({ providedIn: 'root' })
export class FileReaderService {
  readAttachment(event: Event): Observable<FileAttachmentDto | null> {
    return new Observable(observer => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) {
        observer.next(null);
        observer.complete();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        observer.next({ fileName: file.name, dataUrl: String(reader.result) });
        observer.complete();
      };
      reader.onerror = () => observer.error(reader.error);
      reader.readAsDataURL(file);
      input.value = '';
    });
  }
}
