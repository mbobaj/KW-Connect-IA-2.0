import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es-CL' }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.