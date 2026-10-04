import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { GetSecurityEventsUseCase } from '../../../application/use-cases/get-security-events.use-case';

@Component({
  selector: 'app-security-page',
  imports: [
    AsyncPipe
  ],
  templateUrl: './security-page.html',
  styleUrl: './security-page.scss'
})
export class SecurityPage {

  private readonly getSecurityEvents =
    inject(GetSecurityEventsUseCase);

  readonly events$ =
    this.getSecurityEvents.execute(2);
}
