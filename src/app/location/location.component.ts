import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionStorageService } from '../core/session-storage.service';
import { IUser, IWorker } from '../shared/interfaces';
import { DataService } from '../core/data.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  carNr: string = '';
  user: IUser;
  worker: IWorker;
  map: google.maps.Map;
  marker: google.maps.Marker;

  @ViewChild('mapWrapper', {static: false}) mapElement: ElementRef;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    this.carNr = this.route.snapshot.paramMap.get('carNr');
    this.user = this.sessionStorageService.getUser(this.carNr)[0];

    if (!this.user) {
      this.router.navigateByUrl('/identification');
      return;
    } else {
      this.dataService.getWorkers()
          .subscribe((workers: IWorker[]) => this.getRandomWorker(workers));
    }
  }

  ngAfterViewInit() {
    if (this.user) {
      this.initializeMap();
    }
  }

  initializeMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12, 
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
    
    // get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }; 
        this.map.setCenter(currentPos);
        
        this.setMarker(currentPos, this.map);
      
      }, () => {
        // Block by user
        this.setMarker(this.user.location, this.map);
      });
    } else {
      // Browser doesn't support Geolocation
      this.setMarker(this.user.location, this.map);
    }
  }

  setMarker(pos, map) {
    this.marker = new google.maps.Marker({position: pos, map: map, draggable: true});
    this.sessionStorageService.updateUser(this.carNr, pos.lat, pos.lng);
    this.marker.addListener('dragend', (evt) => {
      console.log(evt.latLng.lat());
      this.sessionStorageService.updateUser(this.carNr, evt.latLng.lat(), evt.latLng.lng());
    });
  }

  getRandomWorker(workers): void {
    const randomId = Math.floor(Math.random() * workers.length) + 1;
    this.worker = workers.filter((w: IWorker) => w.id === randomId)[0];
  }

  setDirections() {
    this.sessionStorageService.setUserTechSupportWorker(this.carNr, this.worker);
  }
}
