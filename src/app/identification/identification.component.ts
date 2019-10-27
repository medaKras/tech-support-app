import { Component, OnInit } from '@angular/core';

import { SessionStorageService } from '../core/session-storage.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss']
})
export class IdentificationComponent implements OnInit {

  carNr: string = '';
  
  constructor(private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
  }

  onKey(carNr: string) { 
    this.carNr = carNr;
  }

  buttonClicked() {
    this.sessionStorageService.storeNewUser(this.carNr);
  }

}
