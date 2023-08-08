
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { staticValues } from "../../../shared/common-service/common-service";
import { WhatsappService } from '../whatsapp.service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';




@Component({
	selector: 'app-whatsapp-grade-details',
	templateUrl: './whatsapp-grade-details.component.html',
	styleUrls: ['./whatsapp-grade-details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ToasterService, PermissionService, WhatsappService, LoginService],
})
export class WhatsappGradeDetailsComponent implements OnInit {

	zone_type: any = staticValues.zone_type;

	data: any = [];


	private toasterService: ToasterService;
	id: number;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	zone_id: any;
	user: UserDetails;
	userId: any;


	constructor(

		toasterService: ToasterService,
		private whatsapp: WhatsappService,
		private permissionService: PermissionService, private loginService: LoginService) {

		this.user = this.loginService.getUserDetails();
		this.userId = this.user.userDet[0].id;
		this.toasterService = toasterService;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];


	}

	ngOnInit() {

	}

	getData() {


		if (this.zone_id != null) {

			this.whatsapp.sendBulkWhatsapp('api/whastappBroadcast/getZoneWiseGrades', { zone_id: this.zone_id, userId: this.userId }).subscribe(response => {
				if (response.length) {
					this.zone_id = null;
					this.toasterService.pop('success', 'success', 'Whastapp Sent to the customers of this Zone');
				} else {
					this.toasterService.pop('error', 'error', 'No Data Available to this zone');
				}



			})

		}


	}





}

