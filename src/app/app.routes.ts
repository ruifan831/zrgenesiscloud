import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';
import { CalendarComponent } from './products/calendar/calendar.component';
import { VisionCueComponent } from './products/vision-cue/vision-cue.component';
import { ContactComponent } from './contact/contact.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { CalendarPrivacyComponent } from './privacy/calendar-privacy/calendar-privacy.component';
import { VisionCuePrivacyComponent } from './privacy/vision-cue-privacy/vision-cue-privacy.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', loadComponent: () => import('./about/about.component').then(m => m.AboutComponent) },
  { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
  { path: 'products/calendar', loadComponent: () => import('./products/calendar/calendar.component').then(m => m.CalendarComponent)  },
  { path: 'products/vision-cue', loadComponent: () => import('./products/vision-cue/vision-cue.component').then(m => m.VisionCueComponent) },
  { path: 'contact', loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent) },
  { path: 'privacy-policy', loadComponent: () => import('./privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
  { path: 'privacy/calendar', loadComponent: () => import('./privacy/calendar-privacy/calendar-privacy.component').then(m => m.CalendarPrivacyComponent) },
  { path: 'privacy/teleprompter', loadComponent: () => import('./privacy/vision-cue-privacy/vision-cue-privacy.component').then(m => m.VisionCuePrivacyComponent) },
  { 
    path: 'invite/calendar', 
    loadComponent: () => import('./pages/calendar-invite/calendar-invite.component').then(m => m.CalendarInviteComponent),
    data: { showHeader: false, showFooter: false }
  },
  { path: '**', redirectTo: '' } // 重定向到首页
];
