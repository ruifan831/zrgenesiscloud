import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { MetaService } from '../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  readonly contactEmail = environment.contactEmail;

  constructor(private metaService: MetaService) {}

  ngOnInit(): void {
    this.metaService.setForContact();
  }
}
