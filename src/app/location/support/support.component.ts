import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionStorageService } from 'src/app/core/session-storage.service';
import { IUser, IWorker } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  carNr = '';
  user: IUser;
  worker: IWorker;

  map: google.maps.Map;
  userMarker: google.maps.Marker;
  workerMarker: google.maps.Marker;
  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;

  travelTimeSec: number;
  arrivalDate: Date;
  arrivalTime;
  path: any[];
  text: string;
  steps: number;
  error = false;

  @ViewChild('mapWrapper', {static: false}) mapElement: ElementRef;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    this.carNr = this.route.snapshot.paramMap.get('carNr');
    this.user = this.sessionStorageService.getUser(this.carNr)[0];
    if (!this.user) {
      this.router.navigateByUrl('/identification');
      return;
    } else if (this.user && !this.user.hasOwnProperty('techSupportWorker')) {
      this.router.navigateByUrl(`/setLocation/${this.carNr}`);
      return;
    } else {
      this.worker = this.user.techSupportWorker;
    }
  }

  ngAfterViewInit() {
    if (this.user && this.user.techSupportWorker) {
      this.initializeMap();
      this.setDirection();
    }
  }

  initializeMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: this.user.location
    });
    const icon = {
      url: '../../../assets/user-point.png',
      scaledSize: new google.maps.Size(25, 25)
    };
    this.userMarker = new google.maps.Marker({position: this.user.location, map: this.map, icon});
  }

  setDirection() {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    const start = {
      lat: this.user.location.lat,
      lng: this.user.location.lng
    };
    const end = {
      lat: this.worker.location.lat,
      lng: this.worker.location.lng
    };

    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode['DRIVING']
    };

    this.directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        const icon = {
          url: '../../../assets/worker-point.png',
          scaledSize: new google.maps.Size(25, 25)
        };

        this.path = result.routes[0].overview_path;

        const bounds = new google.maps.LatLngBounds();
        for (var i = 0; i <  this.path.length; i++) {
          bounds.extend(this.path[i]);
        }
        this.map.fitBounds(bounds);

        this.workerMarker = new google.maps.Marker({
          position: this.path[this.path.length - 1],
          map: this.map,
          icon
        });

        this.travelTimeSec = +result.routes[0].legs[0].duration.value;
        this.steps = this.travelTimeSec / this.path.length;
        const currentTime = new Date();
        this.arrivalDate = new Date(currentTime.getTime() + 1000 * this.travelTimeSec);

        this.arrivalTime = {
          hours: this.arrivalDate.getHours(),
          mins: this.arrivalDate.getMinutes()
        };
        this.text = `Tech. pagalbos preliminarus atvykimo laikas 
        ${this.arrivalTime.hours} val. ${this.arrivalTime.mins} min.`;

        this.startTimer();
      } else {
        this.error = true;
      }
    });
    this.directionsRenderer.setMap(this.map);
  }

  startTimer() {
    let points: number = this.path.length - 1;
    const interval = setInterval(() => {
      if(points > 0) {
        points--;
        this.workerMarker.setPosition(this.path[points]);
      } else {
        this.text = 'Techninė pagalba atvyko!';
        clearInterval(interval);
        this.sessionStorageService.deleteUserTechSupportWorker(this.carNr);
      }
    }, this.steps * 1000);
  }
}
