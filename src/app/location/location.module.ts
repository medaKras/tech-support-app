import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageServiceModule } from 'ngx-webstorage-service';

import { LocationRoutingModule } from './location-routing.module';
import { LocationComponent } from './location.component';
import { SupportComponent } from './support/support.component';
import { SessionStorageService } from '../core/session-storage.service';

@NgModule({
  declarations: [ LocationComponent, SupportComponent ],
  imports: [
    CommonModule,
    LocationRoutingModule,
    StorageServiceModule
  ],
  providers: [SessionStorageService]
})
export class LocationModule { }
