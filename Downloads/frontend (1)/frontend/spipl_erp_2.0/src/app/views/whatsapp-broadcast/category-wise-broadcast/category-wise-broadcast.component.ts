import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { EmailTemplateMaster, OrganizationCategory, WhatsappBroadcastCategorywize } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { MessagingService } from '../../../service/messaging.service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { HttpClient } from '@angular/common/http';
import { staticValues } from '../../../shared/common-service/common-service';
import { WhatsappService } from '../whatsapp.service';
@Component({
	selector: 'app-category-wise-broadcast',
	templateUrl: './category-wise-broadcast.component.html',
	styleUrls: ['./category-wise-broadcast.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, FileNamePipe, Calculations]
})

export class CategoryWiseBroadcastComponent implements OnInit {
	[x: string]: any;
	@ViewChild('myEditor', { static: true }) myEditor: any;
	@ViewChild("transferModal", { static: false }) public transferModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Category Wise Broadcast";

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	isLoading: boolean = false;
	isBtnLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];
	transferForm: FormGroup;
	orgCategories: any = [];
	selectedOrgCategories: any = null;
	selected_row: any = [];
	companyList: any = staticValues.company_list_new;


	selected_company: any = this.companyList[0];

	org_categories_id: any = [];
	org_division_id: any = [];



	messageTypes: any = [
		{
			id: 0,
			name: "STANDARD",
			video_url: "https://spipl-release.s3.ap-south-1.amazonaws.com/plast-india-2023/Parmar-Expo+Invitation+02.mp4"
		},
		{
			id: 1,
			name: "VVIP",
			video_url: "https://spipl-release.s3.ap-south-1.amazonaws.com/plast-india-2023/Parmar-VIP+Invite.mp4"
		}
	];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
		private FileNamePipe: FileNamePipe,
		private calculations: Calculations,
		private http: HttpClient,
		private whatsapp: WhatsappService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
		this.getOrgCategory();
		this.get_list_template();
	}

	initForm() {
		this.transferForm = new FormGroup({
			type: new FormControl(null, Validators.required)
		});
	}

	getOrgCategory() {
		this.crudServices.getAll<any>(OrganizationCategory.getAll).subscribe(res => {
			if (res.length > 0) {
				this.orgCategories = res;
			}
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(WhatsappBroadcastCategorywize.getCategoryWise, {
			org_categories_id: this.org_categories_id.toString(),
			org_division_id: this.selected_company.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
				}
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "", header: "", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Check", width: "100px" },
			{ field: "contact_no", header: "Contact No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "cont_type", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },

		];
		this.filter = ['contact_no', 'cont_type', 'division'];
		this.getData();
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;
		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
	}

	onFilter(e, dt) {
		// 
	}
	onAction(rowData, type, event) {
		if (type == 'Check_All') {
			if (event) {
				this.checked = (this.table.filteredValue) ? this.table.filteredValue : this.data;
			} else {
				this.checked = [];
			}
		}
		if (type == 'Transfer') {
			this.transferForm.reset();
			this.transferModal.show();
		}

		if (type == 'Org_Category') {
			if (event.value.length > 0) {
				this.data = [];
				this.org_categories_id = event.value.map(x => {
					return x.id
				});
				this.isLoading = true;
				let body = {
					org_categories_id: this.org_categories_id.toString(),
					org_division_id: this.selected_company.id
				};
				this.crudServices.getOne<any>(WhatsappBroadcastCategorywize.getCategoryWise, body).subscribe(res => {
					this.isLoading = false;
					if (res.code == '100') {
						if (res.data.length > 0) {
							this.data = res.data;
							this.pushDropdown(this.data);
						}
					}
					this.table.reset();
				});
			}
		}
		if (type == 'Org_Division') {
			this.data = [];
			if (event != null && event != undefined) {
				this.selected_company = {
					id: event.value.id,
					name: event.value.name
				};
				this.isLoading = true;
				this.crudServices.getOne<any>(WhatsappBroadcastCategorywize.getCategoryWise, {
					org_categories_id: this.org_categories_id.toString(),
					org_division_id: this.selected_company.id
				}).subscribe(res => {
					this.isLoading = false;
					if (res.code == '100') {
						if (res.data.length > 0) {
							this.data = res.data;
							this.pushDropdown(this.division);
						} else {
							this.toasterService.pop('error', 'Alert', 'No Data Found..!');
						}
					}
					this.table.reset();
				});
			}
		}
	}
	get_list_template() {
		this.whatsapp.getChatDetails('api/whatsapp/gettemplateDet', {}).subscribe(res => {
			this.templates = res;
		})
	}
	submitTransferForm() {

		let message_type_id = this.transferForm.value.type;
		let message_type = this.templates.find(x => x.id == message_type_id);
		let checked_data = this.checked.filter(x => x.is_transfered == 0);

		let numbers = checked_data.map(x => {
			if (x.is_transfered == 0) {
				return x.contact_no.trim();
			}
		});

		let cont_ids = checked_data.map(x => {
			if (x.is_transfered == 0) {
				return x.id;
			}
		});

		let body = [{
			"template_name": message_type.template_name,
			"locale": "en",
			"numbers": numbers,
			"params": [],
			"id": message_type.id,
			"video_url": message_type.video_url,
			"name": message_type.name
		}];

		this.crudServices.getOne<any>(WhatsappBroadcastCategorywize.sendWhatsappVideo, body).subscribe(res => {
			if (res.code == '100') {
				this.crudServices.getOne<any>(WhatsappBroadcastCategorywize.updateTransferStatus, {
					ids: cont_ids.toString()
				}).subscribe(res2 => {
					if (res2.code == '100') {
						this.toasterService.pop('success', 'Success', "Message Sent Successfully");
						this.transferForm.reset();
						this.transferModal.hide();
						this.data = [];
						this.checked = [];
						this.selectedOrgCategories = null;
					}
				});
			}
		});
	}
}


