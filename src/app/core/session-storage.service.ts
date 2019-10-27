import { Injectable, Inject } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { IUser, IWorker } from '../shared/interfaces';

const STORAGE_KEY = 'session_userLocation';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) { }

  public getUser(carNumber: string): IUser[] {
    const users = this.storage.get(STORAGE_KEY) || [];

    if (users) {
      const user = users.filter((u: IUser) => u.carNumber === carNumber);
      return user;
    }
    return [];
  }

  public storeNewUser(carNumber: string): void {

    const users: IUser[] = this.storage.get(STORAGE_KEY) || [];
    const defaultLoc = {
      lat: 54.9205,
      lng: 23.9526
    };

    const newUser: IUser = {
      carNumber,
      location: {
        lat: defaultLoc.lat,
        lng: defaultLoc.lng
      }
    }

    if (users) {
      for (const user of users) {
        if (user.carNumber === carNumber) {
          return;
        }
      }
      this.storage.set(STORAGE_KEY, [...users, newUser]);

    } else if (users.length === 0) {
      this.storage.set(STORAGE_KEY, [...users, newUser]);
      return;
    }
  }

  updateUser(carNumber: string, lat: number, lng: number): boolean {
    const users: IUser[] = this.storage.get(STORAGE_KEY) || [];

    if (users) {
      for (const user of users) {
        if (user.carNumber === carNumber) {
          user.location.lat = lat;
          user.location.lng = lng;
          this.storage.set(STORAGE_KEY, users);
          return true;
        }
      }
    }
    return false;
  }

  setUserTechSupportWorker(carNumber: string, worker: IWorker): boolean {
    const users: IUser[] = this.storage.get(STORAGE_KEY) || [];
    if (users) {
      for (const user of users) {
        if (user.carNumber === carNumber) {
          user['techSupportWorker'] = worker;
          this.storage.set(STORAGE_KEY, users);
          return true;
        }
      }
    }
    return false;
  }

  deleteUserTechSupportWorker(carNumber: string): boolean {
    const users: IUser[] = this.storage.get(STORAGE_KEY) || [];

    if (users) {
      for (const user of users) {
        if (user.carNumber === carNumber) {
          delete user.techSupportWorker;
          this.storage.set(STORAGE_KEY, users);
          return true;
        }
      }
    }
    return false;
  }
}