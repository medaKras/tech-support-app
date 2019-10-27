import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationRoutingModule } from './location-routing.module';
import { LocationComponent } from './location.component';
import { SupportComponent } from './support/support.component';
import { SessionStorageService } from '../core/session-storage.service';

@NgModule({
  declarations: [ LocationComponent, SupportComponent ],
  imports: [
    CommonModule,
    LocationRoutingModule
  ],
  providers: [SessionStorageService]
})
export class LocationModule { }
