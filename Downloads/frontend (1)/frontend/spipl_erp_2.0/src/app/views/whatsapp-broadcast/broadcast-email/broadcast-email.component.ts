import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { emailBroadcast, EmailTemplateMaster, OrganizationCategory, StaffMemberMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { staticValues } from '../../../shared/common-service/common-service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
	selector: 'app-broadcast-email',
	templateUrl: './broadcast-email.component.html',
	styleUrls: ['./broadcast-email.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, FileNamePipe, Calculations]
})
export class BroadcastEmailComponent implements OnInit {


	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('sendMailModal', { static: false }) public sendMailModal: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Organization Email List";

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	companyList: any = staticValues.company_list_new;
	staff: any = [];


	selected_company: any = this.companyList[0];
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	filterList: any = [];
	subject: string;
	html: string;
	//   messageTypes: any = [
	// 		{
	// 			id: 1,
	// 			name: "STANDARD",

	// 		},
	// 		{
	// 			id: 2,
	// 			name: "VVIP",

	// 		}
	// 	];

	message: any
	categories: any = [];
	MarketingPersonsArr = [];
	categories_ids: any = [];
	sales_acc_holder_ids: any = [];
	sales_acc_holder_id: any = [];

	division_ids: any = [];
	divisions: any = [];

	@ViewChild('myEditor', { static: true }) myEditor: any;
	templates: any;
	template_name: any;
	mycontent: string;
	template_id: any;
	emailSubject: any;
	from: any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
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
		this.get_list_template();


		this.getCols();
		this.crudServices.getAll<any>(OrganizationCategory.getAll).subscribe((response) => {
			this.categories = response;
		});

		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			response["data"].map(item => item.first_name = item.first_name + ' ' + item.last_name);
			this.staff = response.data;
		});
	}



	getCols() {
		this.cols = [
			{ field: "email_id", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sub_org_name", header: "Organization Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "org_category", header: "Category", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "division", header: "Division", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sales_person_name", header: "Sales Person Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },

		];
		this.filter = ['email_id', 'sub_org_name', 'org_category', 'division', 'sales_person_name'];

		this.getData();
		// this.getDivison();
	}

	get_list_template() {
		this.crudServices.getAll<any>(EmailTemplateMaster.getAll).subscribe(res => {
			this.templates = res;
		})
	}

	onChangeCompany(event) {
		if (event && event.value.id != null) {
			this.getData()

		} else {
			this.getData()
		}
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SubOrg.getOrgContactsList, {
			contact_type: 1,
			category_id: this.categories_ids.length > 0 ? this.categories_ids : null,
			company_id: this.division_ids.id,
			sales_acc_holder_ids: this.sales_acc_holder_id > 0 ? this.sales_acc_holder_id : null
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.filterList = res.data;
					this.pushDropdown(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}

		});
	}

	getDivison() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SubOrg.getOrgContactsList, {
			contact_type: 1,
			division_id: this.division_ids.length > 0 ? this.division_ids : null
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.filterList = res.data;
					this.pushDropdown(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}

		})

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
		this.filterList = e.filteredValue
		// 
	}

	onAction(rowData, type, event) {
		if (type == 'View') {
			// 
		}
	}


	exportData(type) {
		let fileName = this.page_title;
		let exportData = [];
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}

		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			foot[this.cols[j]["header"]] = "";
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

	previewMail() {
		this.sendMailModal.show();


	}

	getTemplate(event) {
		if (event) {
			this.template_name = event['template_name'];
			this.mycontent = event['custom_html'];
			this.template_name = event['template_name'];
			this.emailSubject = event['subject'];
			this.from = event['from_name'];
		}

	}

	//   getTemplate() {

	//     let name = ''
	//     if(this.message == 1) {
	//       name = 'Plast India Template STANDARD';
	//     }

	//     else  if(this.message == 2) {
	//       name = 'Plast India Template VVIP';
	//     } else {
	//       this.html = ''
	//       this.subject = ''
	//     }
	//     if(name != '') {
	//       this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
	//         template_name: name
	//       }).subscribe(response => {		
	//         if (response.length > 0) {
	//           this.html = response[0].custom_html;
	//           this.subject = response[0].subject;


	//         }
	//       });
	//     }

	//   }


	sendMail() {

		if (confirm("Whant to broadcast!") == true) {
			// let unique = this.filterList.map(item =>
			// 	item['category_id']
			// ).filter((value, index, self) =>
			// 	self.indexOf(value) === index
			// );
			// let array = [];
			// unique.forEach(item => {
			// 	array.push(item);
			// });


			if (this.categories_ids.length) {
				let mail_Object = { cat_id: this.categories_ids, company_id: this.division_ids.id, sales_acc_holder_ids: this.sales_acc_holder_ids, subject: this.subject, html: this.html, message_type: this.message }

				this.crudServices.postRequest<any>(emailBroadcast.sendMailBroadcast, mail_Object).subscribe(response => {
					this.toasterService.pop('success', 'Success', "Message Sent Successfully");
					this.closeModal();

				})
			}
		}





	}

	closeModal() {
		this.sendMailModal.hide();
		this.html = '';
		this.subject = '';
		this.message = null
	}

}
