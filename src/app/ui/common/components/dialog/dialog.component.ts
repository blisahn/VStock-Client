import { Component, OnDestroy } from '@angular/core';
import { CustomDialogService, DialogOptions } from '../../../../services/common/custom.dialog.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dialog',
    imports: [],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.css'
})
export class DialogComponent implements OnDestroy {
  open = false;
  dialogOptions: DialogOptions = new DialogOptions();
  private sub?: Subscription;
  private resolver: ((v: boolean) => void) | null = null;
  modalId = 'app-global-dialog';

  constructor(private dialogSvc: CustomDialogService) {
    this.sub = this.dialogSvc.request$.subscribe((pending) => {
      this.dialogOptions = {
        title: pending.options.title,
        message: pending.options.message,
        confirmText: pending.options.confirmText,
        cancelText: pending.options.cancelText,
      };
      this.resolver = pending.resolve;
      this.open = true;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  confirm() {
    this.open = false;
    this.resolver?.(true);
    this.cleanUp();
  }

  cleanUp() {
    this.resolver = null;
  }

  onCheckboxToggle($e: Event) {
    const checked = ($e.target as HTMLInputElement).checked;
    this.open = checked;
    if (!checked && this.resolver) {
      this.cancel();
    }
  }

  cancel() {
    this.open = false;
    this.resolver?.(false);
    this.cleanUp();
  }
}