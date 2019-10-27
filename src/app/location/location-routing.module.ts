import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationComponent } from './location.component';
import { SupportComponent } from './support/support.component';

const routes: Routes = [
    { path: 'setLocation/:carNr', component: LocationComponent },
    { path: 'trackTechSupport/:carNr', component: SupportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationRoutingModule { }