import { BehaviorSubject, Subject } from 'rxjs'
import { Notifications, StaffMemberMaster, SubOrg } from '../shared/apis-path/apis-path';

import { AngularFireMessaging } from '@angular/fire/messaging';
import { CrudServices } from '../shared/crud-services/crud-services';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class MessagingService {
	currentMessage = new BehaviorSubject(null);
	componentMethodCallSource = new Subject<any>();
	fcm_auth_key: any = environment.firebaseConfig.fcm_auth_key;
	constructor(
		private angularFireMessaging: AngularFireMessaging,
		private http: HttpClient) {
		this.angularFireMessaging.messaging.subscribe(
			(_messaging) => {
				_messaging.onMessage = _messaging.onMessage.bind(_messaging);
				_messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
			}
		)
	}




	async generateTockenAndSave() {
		await this.angularFireMessaging.requestToken.subscribe((token) => { return token });
	}

	requestPermissionNew() {
		this.angularFireMessaging.requestPermission
			.subscribe(() => { console.log('Permission granted!'); },
				(error) => { console.error("error"); },
			);
	}


	async sendNotification(body) {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'key=' + this.fcm_auth_key
		});
		return this.http.post('https://fcm.googleapis.com/fcm/send', body, { headers: headers }).subscribe((notification) => {
			this.componentMethodCallSource.next();
		})
	}


	save(token, user) {
		let body = {
			staff_data: {
				fcmtoken: token
			},
			staff_member_id: user.id
		}
		return this.http.post<any>(environment.serverUrl + 'api/hr/staffMember/update', body).subscribe((data) => {
			// 
		})
	}


	requestPermission(user) {
		this.angularFireMessaging.requestToken.subscribe(
			(token) => {
				if (token) {
					localStorage.setItem('fcmToken', token)
				}
			},
			(err) => {
				console.error('Unable to get permission to notify.', err);
			}
		);
	}

	receiveMessageNew() {
		return this.angularFireMessaging.messages;
	}

	receiveMessage() {
		return this.angularFireMessaging.messages.subscribe((payload) => {
			if (payload) {
				const NotificationOptions = {
					body: payload['notification'].body,
					data: payload['notification'].body,
				}
				navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope').then(registration => {
					registration.showNotification(payload['notification'].title, NotificationOptions);
				})
				this.currentMessage.next(payload);
			}
		});
	}
}
