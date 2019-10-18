import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Doneit } from './doneit';
import { NgxNeoIDB } from '@neocomplexx/ngx-neo-indexeddb';
import { IndexedDbService } from './services/indexed-db.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private dbTitle = 'doit';
  private indexedDB: NgxNeoIDB;
  public doit: Array<Doneit>;
  public selected: Doneit;
  public findId: number;
  status = 0;
  titleInput = new FormControl();

  constructor(private indexedDbService: IndexedDbService) {
    this.indexedDB = new NgxNeoIDB(this.dbTitle, 1);
    this.doit = new Array();
  }



  ngOnInit() {
    this.indexedDB.openDatabase(3, (evt) => {
      const objectStore = evt.currentTarget.result.createObjectStore(
        this.dbTitle, { keyPath: 'id', autoIncrement: true });

      objectStore.createIndex('title', 'title', { unique: false });
      objectStore.createIndex('datetime', 'datetime', { unique: true });
      objectStore.createIndex('status', 'status', { unique: false });
    }).then(a => {
      this.reloadAll();
    });
  }


  toggleStatus(id: number) {
    console.log(id);
    this.findId = id;
    this.getById().then(e => {
      console.log(this.selected);
      this.selected.status = this.selected.status === 0 ? 2 : 0;
      this.update(this.selected);
    });

  }
   addNewItem() {
    const doit: Doneit = {
      title: this.titleInput.value,
      datetime:  new Date().toString(),
      status: 0

    };

    this.saveToDb(doit);
    this.reloadAll();

  }


  public async saveToDb(doit: Doneit) {
    try {
      await this.indexedDB.add('doit', doit);
      console.log('Saved to db');
      this.titleInput.setValue('');
    } catch (erro) {
      window.alert('Error saving to db');
      console.error(erro);
    }
  }



  public async reloadAll() {
    this.doit = await this.indexedDB.getAll('doit');
    const test = 'asd';
  }

  public async getById() {
    try {
      this.selected = await this.indexedDB.getByKey('doit', this.findId);
    } catch (erro) {
      window.alert('Error getting: ' + this.findId);
      console.error(erro);
    }
  }

  public async update(doit: Doneit) {
    try {
      this.indexedDB.update('doit', doit).then(a => {
        this.reloadAll();
      });
    } catch (erro) {
      window.alert('Error getting: ' + this.findId);
      console.error(erro);
    }
  }

  public async delete(clientId: string) {
    this.indexedDB.delete('doit', this.findId);
    
  }




}
