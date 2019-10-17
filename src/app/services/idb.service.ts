import { Injectable } from '@angular/core';
import idb from 'idb';
import { Observable, Subject } from 'rxjs';
import { Doneit } from '../doneit';

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  private _DATA_CHANGE: Subject<Doneit> = new Subject<Doneit>();
  private _DB_PROMISE;

  constructor() {
  }

  connectToIDB() {
    this._DB_PROMISE = idb.open('pwa-database', 1, UpgradeDB => {
      if (!UpgradeDB.objectStoreNames.contains('Items')) {
        UpgradeDB.createObjectStore('Items', { keyPath: 'id', autoIncrement: true });
      }
      if (!UpgradeDB.objectStoreNames.contains('Sync-Items')) {
        UpgradeDB.createObjectStore('Sync-Items', { keyPath: 'id', autoIncrement: true });
      }
    });
  }

  addItems(target: string, value: Doneit) {
    this._DB_PROMISE.then((db: any) => {
      const tx = db.transaction(target, 'readwrite');
      tx.objectStore(target).put({
        time: value.time,
        title: value.title
      });
      this.getAllData('Items').then((items: Doneit) => {
        this._DATA_CHANGE.next(items);
      });
      return tx.complete;
    });
  }

  deleteItems(target: string, value: Doneit) {
    this._DB_PROMISE.then((db: any) => {
      const tx = db.transaction(target, 'readwrite');
      const store = tx.objectStore(target);
      store.delete(value);
      this.getAllData(target).then((items: Doneit) => {
        this._DATA_CHANGE.next(items);
      });
      return tx.complete;
    });
  }

  getAllData(target: string) {
    return this._DB_PROMISE.then((db: any) => {
      const tx = db.transaction(target, 'readonly');
      const store = tx.objectStore(target);
      return store.getAll();
    });
  }

  dataChanged(): Observable<Doneit> {
    return this._DATA_CHANGE;
  }
}
