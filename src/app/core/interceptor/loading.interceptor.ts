// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { LoadingService } from '../services/loading.service';

// @Injectable()
// export class LoadingInterceptor implements HttpInterceptor {
//   constructor(private loadingService: LoadingService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     this.loadingService.show();
//     return next.handle(req).pipe(
//       finalize(() => this.loadingService.hide())
//     );
//   }
// }

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Start loader before API call
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        // Stop loader as soon as API completes (success or error)
        this.loadingService.hide();
      })
    );
  }
}
