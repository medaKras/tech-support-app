import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdentificationComponent } from './identification.component';
import { IdentificationRoutingModule } from './identification-routing.module';

@NgModule({
  declarations: [IdentificationComponent],
  imports: [
    CommonModule,
    IdentificationRoutingModule
  ]
})
export class IdentificationModule { }
