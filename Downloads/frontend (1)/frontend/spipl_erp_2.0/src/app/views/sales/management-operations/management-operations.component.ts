
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ManagementOperations } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
@Component({
	selector: 'app-management-operations',
	templateUrl: './management-operations.component.html',
	styleUrls: ['./management-operations.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, CrudServices, PermissionService, ToasterService],
})

export class ManagementOperationsComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Management Operations";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to stop Godown?';
	popoverMessage2: string = 'Are you sure, you want to start Godown?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	godown_stop: boolean = false;
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
		this.godown_stop = (this.links.find(x => x == 'godown_stop') != null) ? true : false;
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "godown_id", header: "ID", sort: true, filter: true, type: null },
			{ field: "godown_name", header: "Godown Name", sort: true, filter: true, type: null },
			{ field: "godown_incharge_name", header: "Godown Incharge Name", sort: true, filter: true, type: null },
			{ field: "port_name", header: "Port Name", sort: true, filter: true, type: null },
			{ field: "status", header: "Status (SPIPL)", sort: false, filter: false, type: "Action" },
			{ field: "status_pvc", header: "Status (SSURISHA)", sort: false, filter: false, type: "Action" },
		];
		this.filter = ['godown_name', 'godown_incharge_name', 'port_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(ManagementOperations.getGodowns, {
			deleted: 0
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						let is_stop = (element.is_stop == 1) ? true : false;
						let is_stop_pvc = (element.is_stop_pvc == 1) ? true : false;
						element.status = (is_stop) ? "Stop" : "Start";
						element.status_pvc = (is_stop_pvc) ? "Stop" : "Start";
					});
					this.data = res.data;
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	onAction(item, type) {
		if (type == 'Status_SPIPL') {
			let is_stop = (item.is_stop == 1) ? 0 : 1;
			this.crudServices.getOne<any>(ManagementOperations.updateGodown, {
				data: {
					is_stop: is_stop
				},
				id: item.godown_id
			}).subscribe((res) => {
				this.getCols();
			});
		} else if (type == "Status_PVC") {
			let is_stop_pvc = (item.is_stop_pvc == 1) ? 0 : 1;
			this.crudServices.getOne<any>(ManagementOperations.updateGodown, {
				data: {
					is_stop_pvc: is_stop_pvc
				},
				id: item.godown_id
			}).subscribe((res) => {
				this.getCols();
			});
		}
	}

}
