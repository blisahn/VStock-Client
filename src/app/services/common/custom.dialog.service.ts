import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomDialogService {
  private _request$ = new Subject<Pending>();
  request$ = this._request$.asObservable();
  constructor() { }


  async confirmDialog(options: Partial<DialogOptions>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._request$.next({ options, resolve });
    });
  }
}

export class DialogOptions {
  title?: string = 'Onay gerekmektedir.';
  message?: string = 'Bu islemi onayliyor musunuz?';
  confirmText?: string = 'Evet';
  cancelText?: string = 'Hayir';
}

type Pending = {
  options: Partial<DialogOptions>;
  resolve: (value: boolean) => void;
}