
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';

import { AppComponent } from './src/app.component';

// Register the locale data required for the 'es-CL' locale.
registerLocaleData(localeEsCl);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideNoopAnimations(), // Use NoopAnimations to prevent renderer injection errors with ngx-charts
    { provide: LOCALE_ID, useValue: 'es-CL' }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.