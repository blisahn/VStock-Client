import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CustomToastrService {

  constructor(private toastrService: ToastrService) { }


  showToastr(message: string, title: string, options: Partial<TastrOptions>) {
    this.toastrService[options.type ? options.type : 'info'](message, title, {
      positionClass: options.position ? options.position : ToastrPosition.TopRight
    });
  }
}


export class TastrOptions {
  position?: ToastrPosition;
  type?: ToastrType;
}



export enum ToastrPosition {
  CenterCenter = "toast-center-center",
  TopLeft = "toast-top-left",
  TopRight = "toast-top-right",
  BottomLeft = "toast-bottom-left",
  BottomRight = "toast-bottom-right",
  TopCenter = "toast-top-center",
  BottomCenter = "toast-bottom-center",
  BottomFullWidth = "toast-bottom-full-width",
  TopFullWidth = "toast-top-full-width"
}
export enum ToastrType {
  Info = "info",
  Succes = "success",
  Warning = "warning",
  Error = "error"
}

