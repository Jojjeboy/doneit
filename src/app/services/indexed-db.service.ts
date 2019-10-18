import { Injectable } from '@angular/core';
import { Doneit } from '../doneit';


@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  constructor() {}

    addEntry(doneit: Doneit) {
      // this.dexieService.addOne('entries', doneit);
    }
}
