import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Doneit } from './doneit';
import { NgxNeoIDB } from '@neocomplexx/ngx-neo-indexeddb';
import { IndexedDbService } from './services/indexed-db.service';
import { UUIDService } from './services/uuid.service';
import { Hashtags } from './hashtags';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private todos = 'doit';
  private hashtag = 'hash';
  private indexedDB: NgxNeoIDB;
  public doit: Array<Doneit>;
  public hashtags: Array<Hashtags>;
  public selected: Doneit;
  public findId: number;
  status = 0;
  titleInput = new FormControl();

  constructor(private indexedDbService: IndexedDbService, private uUIDService: UUIDService) {
    this.indexedDB = new NgxNeoIDB(this.todos, 1);
    this.doit = new Array();
  }



  ngOnInit() {
    this.indexedDB.openDatabase(5, (evt) => {
      const objectStoreTodos = evt.currentTarget.result.createObjectStore(
        this.todos, { keyPath: 'id', autoIncrement: true });

      objectStoreTodos.createIndex('title', 'title', { unique: false });
      objectStoreTodos.createIndex('datetime', 'datetime', { unique: true });
      objectStoreTodos.createIndex('status', 'status', { unique: false });
      objectStoreTodos.createIndex('uuid', 'uuid', { unique: true });

      const objectStoreHashTags = evt.currentTarget.result.createObjectStore(
        this.hashtag, { keyPath: 'id', autoIncrement: true });

      objectStoreHashTags.createIndex('title', 'title', { unique: false });
      objectStoreHashTags.createIndex('arrOfIndex', 'arrOfIndex', { unique: false });


    }).then(a => {
      this.reloadAllEntries();
    });
  }


  toggleStatus(id: number) {
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
      datetime: new Date().toString(),
      uuid: this.uUIDService.UUID().toString(),
      status: 0
    };

    const asdad = this.saveDoneItToDb(doit).then(a => {
      const extractedHtags = this.extractHashtags(doit.title);
      if (extractedHtags != null && extractedHtags.length > 0) {

        extractedHtags.forEach((extractedHtag) => {
          if (this.doesHashTagAlreadyExist(extractedHtag)) {
            const hTagToUpdate = this.getHashTagInstance(extractedHtag);
            hTagToUpdate.uuid.push(doit.uuid);
            this.updateHtags(hTagToUpdate);

          } else {
            const hashtags: Hashtags = {
              uuid: [doit.uuid],
              hashtag: extractedHtag
            };
            this.saveHashTagsToDb(hashtags);
          }
        });
      }
      this.reloadAllEntries();
    });

  }


  private extractHashtags(inputString: string): Array<string> {
    let retArr = new Array<string>();
    retArr = inputString.match(/#[^\s#]+/g);
    return retArr;
  }


  private doesHashTagAlreadyExist(hashTag: string): boolean {
    if (hashTag != null) {
      this.hashtags.forEach((tag) => {
        if (tag.hashtag === hashTag) {
          return true;
        }
      });
      return false;

    }
  }

  private getHashTagInstance(hashtag: string): any {
    this.reloadAllEntries();
    this.hashtags.forEach((savedHtag) => {
      if (savedHtag.hashtag === hashtag) {
        return savedHtag;
      }
      return null;
    });
  }

  public async saveDoneItToDb(doit: Doneit) {
    try {
      await this.indexedDB.add(this.todos, doit).then(a => {
        console.log('Saved to db');
        this.titleInput.setValue('');
        return a;
      });
    } catch (erro) {
      window.alert('Error saving to db');
      console.error(erro);
    }
  }

  public async saveHashTagsToDb(hashtags: Hashtags) {
    try {
      await this.indexedDB.add(this.hashtag, hashtags).then(a => {
        console.log('Saved hashtags to db');
        return a;
      });
    } catch (erro) {
      window.alert('Error saving to db');
      console.error(erro);
    }
  }



  public async reloadAllEntries() {
    this.doit = await this.indexedDB.getAll(this.todos);
    this.hashtags = await this.indexedDB.getAll(this.hashtag);
  }

  public async getById() {
    try {
      this.selected = await this.indexedDB.getByKey(this.todos, this.findId);
    } catch (erro) {
      window.alert('Error getting: ' + this.findId);
      console.error(erro);
    }
  }

  public async update(doit: Doneit) {
    try {
      this.indexedDB.update(this.todos, doit).then(a => {
        this.reloadAllEntries();
      });
    } catch (erro) {
      window.alert('Error getting: ' + this.findId);
      console.error(erro);
    }
  }

  public async updateHtags(hashtags: Hashtags) {
    try {
      this.indexedDB.update(this.hashtag, hashtags).then(a => {
        this.reloadAllEntries();
      });
    } catch (erro) {
      window.alert('Error getting: ' + this.findId);
      console.error(erro);
    }
  }

  public async delete(clientId: string) {
    this.indexedDB.delete(this.todos, this.findId);
  }




}
