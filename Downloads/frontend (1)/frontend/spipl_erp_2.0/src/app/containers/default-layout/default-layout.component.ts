import { TokenInterceptorService } from './../../shared/interceptors/token-interceptor-service';
import { Component, OnDestroy, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LoginService } from '../../views/login/login.service';
import { INavData } from '@coreui/angular';
import { environment } from '../../../environments/environment';
import { UserDetails } from '../../views/login/UserDetails.model';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { UsersNotification } from '../../shared/apis-path/apis-path';
import { MessagingService } from '../../service/messaging.service';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { ModalDirective } from 'ngx-bootstrap';


@Component({
	selector: 'app-dashboard',
	templateUrl: './default-layout.component.html',
	styleUrls: ['./default-layout.component.scss'],
	providers: [LoginService, CrudServices, MessagingService]
})

export class DefaultLayoutComponent implements OnDestroy {
	currentYear = (new Date()).getFullYear();
	navItems: INavData[] = JSON.parse(localStorage.getItem('menu'));
	profile_photo: string;
	sidebarMinimized = true;
	changes: MutationObserver;
	element: HTMLElement;
	user: UserDetails;
	routerLinkVariable: any;
	calendar: any;
	telephoneExtensions: any;
	upcomingBirthdays: any;
	myJobReferences: any;
	logo: any = null;
	breadcrumbs: any = [];
	birthdays: any = null;
	message: any;
	notfications: any = [];
	selectedNotification: any;
	@ViewChild("notificationModal", { static: false }) public notificationModal: ModalDirective;
	constructor(private loginService: LoginService, private angularFireMessaging: AngularFireMessaging, private crudServices: CrudServices, public messagingService: MessagingService,
		@Inject(DOCUMENT) _document?: any) {
		this.logo = {
			src: 'assets/img/brand/parmar_logo.png',
			width: 48,
			height: 48,
			alt: 'Parmar',
			style: {
				padding: '2px'
			}
		};
		this.changes = new MutationObserver((mutations) => {
			this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
		});
		this.element = _document.body;
		this.changes.observe(<Element>this.element, {
			attributes: true,
			attributeFilter: ['class']
		});
		this.user = this.loginService.getUserDetails();
		let birthdaysList = this.user['birthdays'];
		let birthdaysArr = [];

		if (birthdaysList && birthdaysList.length > 0) {
			birthdaysList.forEach(element => {
				birthdaysArr.push(element.name);
			});
		}

		this.birthdays = birthdaysArr.join(' & ');

		if (this.user.userDet[0].profile_photo) {
			this.profile_photo = this.user.userDet[0].profile_photo;
			//this.profile_photo = '../../../assets/img/default_image1.png';
		} else {
			this.profile_photo = '../../../assets/img/default_image.png';
		}
		this.routerLinkVariable = '/hr/my-profile/' + this.user.userDet[0].id;
		this.telephoneExtensions = '/account/telephone-extensions';
		this.upcomingBirthdays = '/account/upcoming-birthdays';
		this.myJobReferences = '/account/my-job-references';
		// this.calendar = '/hr/holiday-calendar';

		if (this.user.userDet[0].id) {
			this.getAllNotifications();
		}
	}



	async getAllNotifications() {
		this.notfications = []
		this.crudServices.postRequest<any>(UsersNotification.getOne, {
			user_id: this.user.userDet[0].id
		}).subscribe((result) => {
			if (result.code == '100') {
				if (result.data.length > 0) {
					this.notfications = result.data;
				}
			}
		});

	}

	ngOnDestroy(): void {
		this.changes.disconnect();
	}

	onLogout() {
		this.loginService.logout();
	}

	getAllUnreadCount() {
		if (this.notfications) {
			return this.notfications.filter((data) => data.read == 0).length;
		}
		else {
			return 0;
		}
	}

	openNotifications(notification) {
		this.notificationModal.show();
		this.selectedNotification = notification;
	}
	updateNotifications(notification) {
		this.crudServices.updateData(UsersNotification.update, { data: { read: 1 }, id: notification.id }).subscribe((result) => {
			this.getAllNotifications();
		})

	}
}
