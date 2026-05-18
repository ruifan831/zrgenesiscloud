import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppCatalogService } from '../../../core/services/app-catalog.service';
import { AppEntry } from '../../../models/app.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ui-site-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent implements OnInit {
  private catalogService = inject(AppCatalogService);

  apps$: Observable<ReadonlyArray<AppEntry>> = of([]);
  currentYear = new Date().getFullYear();
  icp = environment.icp;
  companyName = environment.companyName;
  contactEmail = environment.contactEmail;

  ngOnInit(): void {
    this.apps$ = this.catalogService.list().pipe(
      catchError(() => of([]))
    );
  }
}
