import { Status } from './status';

export interface Doneit {
    datetime: string;
    title: string;
    status: Status;
    uuid: string;
}
