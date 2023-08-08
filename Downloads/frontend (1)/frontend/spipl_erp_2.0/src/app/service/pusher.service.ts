import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

@Injectable({
	providedIn: 'root'
})

export class PusherService {
	private _pusher: any;

	API_KEY: any = 'c602372ff44831296ff6';
	CLUSTER: any = 'ap2';

	constructor() {
		this._pusher = new Pusher(this.API_KEY, {
			cluster: this.CLUSTER
		});
	}

	getPusher() {
		return this._pusher;
	}

}
