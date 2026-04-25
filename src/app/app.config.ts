import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interseptor/interceptor/auth-interceptor';
import { provideToastr, TOAST_CONFIG } from 'ngx-toastr';

const toastrConfig = {
  timeOut: 4000,
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  preventDuplicates: true,
  countDuplicates: true,
  maxOpened: 4,
  autoDismiss: true,
  newestOnTop: true,
  tapToDismiss: true,
  enableHtml: true,
  toastClass: 'ngx-toastr',
  titleClass: 'toast-title',
  messageClass: 'toast-message',
  easeTime: 300,
  iconClasses: {
    error: 'toast-error',
    info: 'toast-info',
    success: 'toast-success',
    warning: 'toast-warning'
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr(toastrConfig)
  ]

};
