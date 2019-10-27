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

  carNr: string = '';
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
  error: boolean = false;

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
      center: this.user.location,
      styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]
    });
    const icon = {
      url: "../../../assets/user-point.png", // url
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    this.userMarker = new google.maps.Marker({position: this.user.location, map: this.map, icon: icon});
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
      travelMode: google.maps.TravelMode["DRIVING"]
    };

    this.directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        const icon = {
          url: "../../../assets/worker-point.png",
          scaledSize: new google.maps.Size(30, 30), 
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0) 
        };
        
        this.path = result.routes[0].overview_path;

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i <  this.path.length; i++) {
          bounds.extend(this.path[i]);
        }
        this.map.fitBounds(bounds);

        this.workerMarker = new google.maps.Marker({
          position: this.path[this.path.length-1], 
          map: this.map,
          icon: icon
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
    }, this.steps * 1000)
  }
}
