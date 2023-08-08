import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { StaffMemberMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';

@Component({
	selector: 'app-sub-org-update',
	templateUrl: './sub-org-update.component.html',
	styleUrls: ['./sub-org-update.component.css', './sub_org_update.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		SelectService,
		CrudServices,
	],
})
export class SubOrgUpdateComponent implements OnInit {


	public filterQuery = '';
	data: any = [];
	isLoading = false;
	org_id: number;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	add_sub_org: boolean = false;
	edit_sub_org: boolean = false;
	delete_sub_org: boolean = false;
	view_sub_org: boolean = false;
	mode: string;
	editmode: boolean = false;
	form_error = new Array();
	links: any = [];
	staff = [];
	cols: { field: string; header: string; style: string; }[];
	trade_manu_list = [];
	manuTraderChecked: boolean;
	salesaccholderCheckBox: boolean;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	saleAccHolder: any;


	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private selectService: SelectService,
		private crudServices: CrudServices) {


		this.cols = [

			{ field: 'org_unit', header: 'Unit', style: '150' },
			{ field: 'sub_org_name', header: 'Sub Org Name', style: '150' },
			{ field: 'org_address', header: 'Org Address ', style: '150' },
			{ field: 'sales_acc_holder', header: 'Sales Account Holder', style: '100' },
			{ field: 'category_id', header: 'Category', style: '120' }

		];

		this.trade_manu_list = [{ name: 'Trader', id: 1 }, { name: 'Manufacture', id: 2 }];
	}

	ngOnInit() {
		this.getMemberList();
		this.get_list();
	}

	get_list() {
		this.isLoading = true;
		//11 - 4 
		this.crudServices.postRequest<any>(SubOrg.getSubOrgListNew, {
			category_id: 11
		}).subscribe(
			response => {
				this.data = response;
				if (this.data.sales_acc_holder == null) {
					this.data.sales_acc_holder = -1;
				}

				if (this.data.trader_manufacture == null) {
					this.data.trader_manufacture = -1;
				}


				this.isLoading = false;
			},
			(error) => {
				this.isLoading = false;
			}
		);

	}



	getMemberList() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			this.staff = response.data;
		});

	}

	updateSalesHolder($event, mkpid, suborgid, value) {

		//this.data.sales_acc_holder = mkpid;
		this.salesaccholderCheckBox = value;
		this.crudServices.postRequest<any>(SubOrg.updateSalesAcc, {
			sales_acc_holder: mkpid,
			sub_org_id: suborgid,
			ischecked: this.salesaccholderCheckBox

		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, 'something Went Wrong');
			}
		});

	}


	updateTraderManu($event, trade_manu_id, suborgid, value) {

		this.manuTraderChecked = value;

		this.crudServices.postRequest<any>(SubOrg.updateTradeManu, {
			trader_manufacture: trade_manu_id,
			sub_org_id: suborgid,
			ischecked: this.manuTraderChecked

		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, 'something Went Wrong');
			}
		});

	}

}
