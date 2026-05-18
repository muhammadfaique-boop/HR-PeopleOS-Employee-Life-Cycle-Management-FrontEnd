import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationDismissalService {
  private readonly storageKey = 'peopleos-dismissed-notifications';

  getDismissedKeys(): Set<string> {
    const stored = sessionStorage.getItem(this.storageKey);
    if (!stored) {
      return new Set<string>();
    }

    try {
      const keys = JSON.parse(stored) as string[];
      return new Set(keys);
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return new Set<string>();
    }
  }

  dismiss(key: string): Set<string> {
    const keys = this.getDismissedKeys();
    keys.add(key);
    sessionStorage.setItem(this.storageKey, JSON.stringify([...keys]));
    return keys;
  }
}
