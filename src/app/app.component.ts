import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IdbService } from './services/idb.service';
import { Doneit } from './doneit';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'doneit';

  constructor (private idbService: IdbService) {}

  timeInput = new Date();
  titleInput = new FormControl();

  items: Array<Doneit> = [
    { time: '08:00', title: 'Breakfast with Simon' },
    { time: '08:30', title: 'Daily Standup Meeting (recurring)' },
    { time: '09:00', title: 'Call with HRs' }
  ];


  addNewItem() {
    const value: Doneit = {
      time: this.timeInput.toString(),
      title: this.titleInput.value
    };

    this.items.push(value);
    this.titleInput.setValue('');

    this.idbService.addItems('pwa-database', value);
  }
}
