import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IdentificationComponent } from './identification.component';

const routes: Routes = [
    { path: 'identification', component: IdentificationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentificationRoutingModule { }