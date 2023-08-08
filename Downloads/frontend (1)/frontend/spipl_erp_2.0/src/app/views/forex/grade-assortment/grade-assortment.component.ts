import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { SupplierDealService } from '../foreign-supplier-deal/supplier-deal-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { Table } from 'primeng/table';
import { TableFilterPipe } from '../../../shared/filters/tablefilter.pipe';
import { ColumnFilterPipe } from '../../../shared/filters/columnfilter.pipe';
import { core } from '@angular/compiler';
import { ExportService } from '../../../shared/export-service/export-service';

import { jsPDF } from 'jspdf';
import { DateFilterPipe } from '../../../shared/filters/datefilter.pipe';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { SubOrg, oneForeignSupplierDeal, Notifications, NotificationsUserRel, UsersNotification } from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';


@Component({
	selector: 'app-grade-assortment',
	templateUrl: './grade-assortment.component.html',
	styleUrls: ['./grade-assortment.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		SupplierDealService,
		DatePipe,
		MainSubOrgService,
		ToasterService,
		TableFilterPipe,
		ColumnFilterPipe,
		DateFilterPipe,
		ExportService,
		CrudServices,
		MessagingService

	]
})
export class GradeAssortmentComponent implements OnInit {
	count = 0;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	isLoading = false;

	filterQuery = '';
	filterArray = ['deal_dt', 'deal_rate', 'deal_quantity', 'added_date'];

	user: UserDetails;
	links: string[] = [];
	serverUrl: string;
	ListDealForm: FormGroup;
	month = [];
	date = new Date();
	curr_year: number;
	year_list: any = [];
	data = [];
	show_deals = false;
	add_grade_port = false;
	edit_fs_deal = false;
	delete_fs_deal = false;
	sub_org_id: number;
	org_name: string;
	sub_org_name: string;
	unit_type: string;
	filterMonth: Number;
	filterYear: string;
	fromdate: string;
	todate: string;

	public filter = [];
	value = 'deal_dt';
	bsRangeValue: any = [];


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	@ViewChild('dt', { static: false }) table: Table;

	// table declarations

	cols: any[];
	exportColumns: any[];
	array: any;
	export_data: any[];
	export_cols: { field: string; header: string; }[];
	sub_org_address: string;
	minYear: number;
	dealQt = 0;
	dealRate = 0;
	indentQty = 0;
	indent_pi_recv = 0;
	lc_pi_recv = 0;
	non_lc_pi_recv = 0;
	lcOpen = 0;
	NonlcOpen = 0;
	totalpi = 0;
	TotalLc_nonLc = 0;
	inHand = 0;
	totalOs = 0;

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;

	transnationalQty = 0;
	forwardQty = 0;
	highSeasQty = 0;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private supplierDealService: SupplierDealService,
		public datepipe: DatePipe,
		private SubOrgService: MainSubOrgService,
		private toasterService: ToasterService,
		private tableFilter: TableFilterPipe,
		private columnFilter: ColumnFilterPipe,
		private exportService: ExportService,
		private dateFilter: DateFilterPipe,
		private CrudServices: CrudServices,
		private MessagingService: MessagingService,
	) {

		this.serverUrl = environment.serverUrl;

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.add_grade_port = (this.links.indexOf('add grade port') > -1);
		this.edit_fs_deal = (this.links.indexOf('edit fs deal') > -1);
		this.delete_fs_deal = (this.links.indexOf('delete fs deal') > -1);

		this.cols = [
			{ field: 'deal_dt', header: 'Deal Date' },
			{ field: 'month.name', header: 'Month/Year' },
			{ field: 'deal_quantity', header: 'Deal Quantity' },
			{ field: 'deal_rate', header: 'Deal Rate' },
			{ field: 'currency', header: 'Currency' },
			{ field: 'indent_quantity', header: 'Indent Qunatity' },
			{ field: 'transnational_sale_pi_qty', header: 'Transnational Qunatity' },
			{ field: 'forward_sale_pi_qty', header: 'Forward Qunatity' },
			{ field: 'highseas_sale_pi_qty', header: 'HighSeas Qunatity' },
			{ field: '', header: 'Grade Assortment' },
			{ field: 'deal_docs', header: 'Document' },
			{ field: 'indent_pi_received', header: 'Indent PI Received' },
			{ field: 'lc_pi_received', header: 'LC PI Received' },
			{ field: 'non_lc_pi_received', header: 'Non LC PI Received' },
			{ field: '', header: 'Total PI Received' },
			{ field: 'lc_opened', header: 'LC Opened' },
			{ field: 'nonlc_opend', header: 'Non LC Opened' },
			{ field: '', header: 'Total LC/NON LC Opened' },
			{ field: '', header: 'In Hand' },
			{ field: '', header: 'Total O/s' },
			{ field: 'added_date', header: 'Added Date' },
			{ field: 'remark', header: 'Remark' },
		];

		this.export_cols = [
			{ field: 'deal_dt', header: 'Deal Date' },
			{ field: 'month.name', header: 'Shipment Month' },
			{ field: 'deal_quantity', header: 'Deal Quantity' },
			{ field: 'deal_rate', header: 'Deal Rate' },
			{ field: 'CurrencyName', header: 'Currency' },
			{ field: 'indent_quantity', header: 'Indent Qunatity' },
			{ field: 'transnational_sale_pi_qty', header: 'Transnational Qunatity' },
			{ field: 'forward_sale_pi_qty', header: 'Forward Qunatity' },
			{ field: 'highseas_sale_pi_qty', header: 'HighSeas Qunatity' },
			{ field: 'indent_pi_received', header: 'Indent PI Received' },
			{ field: 'lc_pi_received', header: 'LC PI Received' },
			{ field: 'non_lc_pi_received', header: 'Non LC PI Received' },
			{ field: '', header: 'Total PI Received' },
			{ field: 'lc_opened', header: 'LC Opened' },
			{ field: 'nonlc_opend', header: 'Non LC Opened' },
			{ field: '', header: 'Total Lc Non Lc Opened' },
			{ field: '', header: 'In Hand' },
			{ field: '', header: 'Total O/s' },
			{ field: 'added_date', header: 'Added Date' },
			{ field: 'remark', header: 'Remark' },

		];


		this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));

		this.route.params.subscribe((params: Params) => {
			this.sub_org_id = +params['sub_org_id'];
		});


		this.month = [
			{ 'name': 'January', 'id': 1 },
			{ 'name': 'February', 'id': 2 },
			{ 'name': 'March', 'id': 3 },
			{ 'name': 'April', 'id': 4 },
			{ 'name': 'May', 'id': 5 },
			{ 'name': 'June', 'id': 6 },
			{ 'name': 'July', 'id': 7 },
			{ 'name': 'August', 'id': 8 },
			{ 'name': 'September', 'id': 9 },
			{ 'name': 'October', 'id': 10 },
			{ 'name': 'November', 'id': 11 },
			{ 'name': 'December', 'id': 12 },
		];

		this.curr_year = Number(this.datepipe.transform(this.date, 'yyyy'));

		this.CrudServices.getOne<any>(SubOrg.get_one_sub_org, {
			sub_org_id: this.sub_org_id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.org_name = response[0]['org_name'];
				this.sub_org_name = response[0]['sub_org_name'];
				this.sub_org_address = response[0]['org_address'];
				this.unit_type = response[0]['unit_type'];
			}

		});

		//this.SubOrgService.getOneSubOrg(this.sub_org_id).subscribe((response) => {
		//   this.org_name = response[0]['org_name'];
		//   this.sub_org_name = response[0]['sub_org_name'];
		//   this.sub_org_address = response[0]['org_address'];
		//   this.unit_type = response[0]['unit_type'];
		// });



	}

	ngOnInit() {

		this.getNotifications('FOREIGN_SALE_DEAL_DELETED');

		this.getList();
		// this.filterMonth = Number(this.datepipe.transform(this.date, 'M'));
		this.filterYear = this.datepipe.transform(this.date, 'yyyy');
	}



	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];

		this.CrudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				console.log(this.notification_details, "received details")
				this.CrudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					console.log(notificationUser, 'DATA');

					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
								console.log(this.notification_tokens, this.notification_id_users)
							}
						});
					}
				});
			}
		})
	}

	async generateNotification(data, id) {
		console.log(this.notification_details, 'DIKSHA************');
		if (this.notification_details != undefined) {
			let body = {
				notification: data,
				registration_ids: this.notification_tokens
			};

			console.log(body, 'BODY****************');


			await this.MessagingService.sendNotification(body).then((response) => {
				if (response) {
					console.log(response);

					this.saveNotifications(body['notification'], id)
				}
				this.MessagingService.receiveMessage();
				this.message = this.MessagingService.currentMessage;

			})

		}
	}

	saveNotifications(notification_body, id) {
		console.log(id, 'DATA');

		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: id,
				table_name: 'foreign_supplier_deals',
			})
		}
		console.log(this.notification_users, "this.notification_users")
		this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	onBack() {
		this.router.navigate(['forex/sales-contract']);
	}

	getList() {
		this.isLoading = true;
		const lookup = {};
		const year = [];

		this.dealQt = 0;
		this.dealRate = 0;
		this.indentQty = 0;
		this.indent_pi_recv = 0;
		this.lc_pi_recv = 0;
		this.non_lc_pi_recv = 0;
		this.lcOpen = 0;
		this.NonlcOpen = 0;
		this.totalpi = 0;
		this.TotalLc_nonLc = 0;
		this.inHand = 0;
		this.totalOs = 0;
		this.transnationalQty = 0;
		this.forwardQty = 0;
		this.highSeasQty = 0;


		this.CrudServices.getOne<any>(oneForeignSupplierDeal.getAllDealOneSupplier, {
			sub_org_id: this.sub_org_id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				this.data = response;
				console.log(response, "deal");
				this.array = this.columnFilter.transform(this.data, 'shipment_month', this.filterMonth);
				this.array = this.columnFilter.transform(this.array, 'shipment_year', this.filterYear);
				this.array = this.dateFilter.transform(this.array, this.fromdate, this.todate, 'deal_dt');


				for (let item, i = 0; item = response[i++];) {
					const name = item.shipment_year;

					if (!(name in lookup)) {
						lookup[name] = 1;
						year.push(name);
					}
				}

				for (const yr of year) {
					this.year_list.push({ 'name': yr });
				}

				for (const val of this.array) {
					this.dealQt = this.dealQt + Number(val.deal_quantity);
					this.dealRate = this.dealRate + Number(val.deal_rate);
					this.indentQty = this.indentQty + Number(val.indent_quantity);
					this.transnationalQty = this.transnationalQty + Number(val.transnational_sale_pi_qty);
					this.forwardQty = this.forwardQty + Number(val.forward_sale_pi_qty);
					this.highSeasQty = this.highSeasQty + Number(val.highseas_sale_pi_qty);
					this.indent_pi_recv = this.indent_pi_recv + Number(val.indent_pi_received);
					this.lc_pi_recv = this.lc_pi_recv + Number(val.lc_pi_received);
					this.non_lc_pi_recv = this.non_lc_pi_recv + Number(val.non_lc_pi_received);
					this.lcOpen = this.lcOpen + Number(val.lc_opened);
					this.NonlcOpen = this.NonlcOpen + Number(val.nonlc_opend);
					this.totalpi = this.totalpi + Number(val.lc_pi_received) + Number(val.non_lc_pi_received);
					this.TotalLc_nonLc = this.TotalLc_nonLc + Number(val.lc_opened) + Number(val.nonlc_opend);
					this.inHand = this.inHand + (val.lc_pi_received + val.non_lc_pi_received) - (val.lc_opened + val.nonlc_opend);
					this.totalOs = this.totalOs + (val.deal_quantity + val.forward_sale_pi_qty + val.transnational_sale_pi_qty + val.highseas_sale_pi_qty) - (val.lc_opened + val.nonlc_opend);
				}
			}

		});

		//this.supplierDealService.getDealOneSupplier(this.sub_org_id).subscribe((response) => {

		//   this.isLoading = false;
		//   this.data = response;
		//   console.log(response ,"deal");
		//   this.array = this.columnFilter.transform(this.data , 'shipment_month', this.filterMonth);
		//   this.array = this.columnFilter.transform(this.array , 'shipment_year', this.filterYear);
		//   this.array = this.dateFilter.transform(this.array , this.fromdate , this.todate , 'deal_dt');


		//   for (let item, i = 0; item = response[i++];) {
		//     const name = item.shipment_year;

		//     if (!(name in lookup)) {
		//       lookup[name] = 1;
		//       year.push(name);
		//     }
		//   }

		//   for (const yr of year) {
		//     this.year_list.push({'name': yr});
		//   }

		//  for (const val of  this.array ) {
		//    this.dealQt = this.dealQt + Number(val.deal_quantity);
		//    this.dealRate = this.dealRate + Number(val.deal_rate);
		//    this.indentQty = this.indentQty + Number(val.indent_quantity);
		//    this.indent_pi_recv = this.indent_pi_recv + Number(val.indent_pi_received);
		//    this.lc_pi_recv = this.lc_pi_recv + Number(val.lc_pi_received);
		//    this.non_lc_pi_recv = this.non_lc_pi_recv + Number(val.non_lc_pi_received);
		//    this.lcOpen = this.lcOpen + Number(val.lc_opened);
		//    this.NonlcOpen = this.NonlcOpen + Number(val.nonlc_opend);
		//    this.totalpi = this.totalpi + Number(val.lc_pi_received) + Number(val.non_lc_pi_received);
		//    this.TotalLc_nonLc = this.TotalLc_nonLc + Number(val.lc_opened) + Number(val.nonlc_opend);
		//    this.inHand = this.inHand + (val.lc_pi_received + val.non_lc_pi_received) - (val.lc_opened +  val.nonlc_opend);
		//    this.totalOs = this.totalOs + (val.deal_quantity) - (val.lc_opened +  val.nonlc_opend);
		//  }
		// });



	}
	gradeAssortment(id: number) {
		this.router.navigate(['forex/add-grade-port/' + id]);
	}


	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	onEdit(id: Number) {
		this.router.navigate(['forex/edit-fs-deal/' + id]);
	}

	onDelete(id: number) {

		if (id) {
			this.CrudServices.getOne<any>(oneForeignSupplierDeal.deletSupplierDeal, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {


					let subOrgDetailsNew: any = [];
					subOrgDetailsNew = this.data.find(item => item.sub_org_id === this.sub_org_id);
					let data = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Foreign Sales Deal: Deleted Sales Deal Against ${subOrgDetailsNew.sub_org_name} of Quantity : ${subOrgDetailsNew.deal_quantity}, Rate: ${subOrgDetailsNew.deal_rate}  `,
						"click_action": "#"
					}
					this.generateNotification(data, 1);
					this.getList();
					this.toasterService.pop(response.message, 'Success', response.data);
				}
			});

			// this.supplierDealService.deleteFsDeal(id).subscribe((response) => {
			// 	this.getList();
			// 	this.toasterService.pop(response.message, 'Success', response.data);
			// });
		}
	}

	getDocsArray(docs) {

		// console.log(docs,"docs");
		// if(docs != null)
		// {
		// 	return JSON.parse(docs);
		// }else
		// {
		// 	return null;
		// }

		return null;

	}

	onchange(filterMonth, filterYear) {

		if (this.bsRangeValue === null) {
			this.bsRangeValue = [];
		}
		this.dealQt = 0;
		this.dealRate = 0;
		this.indentQty = 0;
		this.transnationalQty = 0;
		this.forwardQty = 0;
		this.indent_pi_recv = 0;
		this.lc_pi_recv = 0;
		this.non_lc_pi_recv = 0;
		this.lcOpen = 0;
		this.NonlcOpen = 0;
		this.totalpi = 0;
		this.TotalLc_nonLc = 0;
		this.inHand = 0;
		this.totalOs = 0;
		this.highSeasQty = 0;
		if (this.bsRangeValue.length > 0) {
			this.fromdate = this.convert(this.bsRangeValue[0]);
			this.todate = this.convert(this.bsRangeValue[1]);
		} else {
			this.fromdate = '';
			this.todate = '';
		}
		console.log(this.fromdate);
		console.log(this.todate);

		this.array = this.columnFilter.transform(this.data, 'shipment_month', filterMonth);
		this.array = this.columnFilter.transform(this.array, 'shipment_year', filterYear);
		this.array = this.dateFilter.transform(this.array, this.fromdate, this.todate, 'deal_dt');
		for (const val of this.array) {
			this.dealQt = this.dealQt + Number(val.deal_quantity);
			this.dealRate = this.dealRate + Number(val.deal_rate);
			this.indentQty = this.indentQty + Number(val.indent_quantity);
			this.transnationalQty = this.transnationalQty + Number(val.transnational_sale_pi_qty);
			this.forwardQty = this.forwardQty + Number(val.forward_sale_pi_qty);
			this.highSeasQty = this.highSeasQty + Number(val.highseas_sale_pi_qty);
			this.indent_pi_recv = this.indent_pi_recv + Number(val.indent_pi_received);
			this.lc_pi_recv = this.lc_pi_recv + Number(val.lc_pi_received);
			this.non_lc_pi_recv = this.non_lc_pi_recv + Number(val.non_lc_pi_received);
			this.lcOpen = this.lcOpen + Number(val.lc_opened);
			this.NonlcOpen = this.NonlcOpen + Number(val.nonlc_opend);
			this.totalpi = this.totalpi + Number(val.lc_pi_received) + Number(val.non_lc_pi_received);
			this.TotalLc_nonLc = this.TotalLc_nonLc + Number(val.lc_opened) + Number(val.nonlc_opend);
			this.inHand = this.inHand + (val.lc_pi_received + val.non_lc_pi_received) - (val.lc_opened + val.nonlc_opend);
			this.totalOs = this.totalOs + (val.deal_quantity + val.forward_sale_pi_qty + val.highseas_sale_pi_qty + val.transnational_sale_pi_qty) - (val.lc_opened + val.nonlc_opend);
		}



	}


	// on your component class declare
	onFilter(event, dt) {

		this.dealQt = 0;
		this.dealRate = 0;
		this.indentQty = 0;
		this.transnationalQty = 0;
		this.forwardQty = 0;
		this.indent_pi_recv = 0;
		this.lc_pi_recv = 0;
		this.non_lc_pi_recv = 0;
		this.lcOpen = 0;
		this.NonlcOpen = 0;
		this.totalpi = 0;
		this.TotalLc_nonLc = 0;
		this.inHand = 0;
		this.totalOs = 0;
		this.highSeasQty = 0;
		this.array = event.filteredValue;
		this.array = this.columnFilter.transform(this.array, 'shipment_month', this.filterMonth);
		this.array = this.columnFilter.transform(this.array, 'shipment_year', this.filterYear);
		this.array = this.dateFilter.transform(this.array, this.fromdate, this.todate, 'deal_dt');

		for (const val of this.array) {
			this.dealQt = this.dealQt + Number(val.deal_quantity);
			this.dealRate = this.dealRate + Number(val.deal_rate);
			this.indentQty = this.indentQty + Number(val.indent_quantity);
			this.transnationalQty = this.transnationalQty + Number(val.transnational_sale_pi_qty);
			this.forwardQty = this.forwardQty + Number(val.forward_sale_pi_qty);
			this.highSeasQty = this.highSeasQty + Number(val.highseas_sale_pi_qty);
			this.indent_pi_recv = this.indent_pi_recv + Number(val.indent_pi_received);
			this.lc_pi_recv = this.lc_pi_recv + Number(val.lc_pi_received);
			this.non_lc_pi_recv = this.non_lc_pi_recv + Number(val.non_lc_pi_received);
			this.lcOpen = this.lcOpen + Number(val.lc_opened);
			this.NonlcOpen = this.NonlcOpen + Number(val.nonlc_opend);
			this.totalpi = this.totalpi + Number(val.lc_pi_received) + Number(val.non_lc_pi_received);
			this.TotalLc_nonLc = this.TotalLc_nonLc + Number(val.lc_opened) + Number(val.nonlc_opend);
			this.inHand = this.inHand + (val.lc_pi_received + val.non_lc_pi_received) - (val.lc_opened + val.nonlc_opend);
			this.totalOs = this.totalOs + (val.deal_quantity + val.forward_sale_pi_qty + val.highseas_sale_pi_qty + val.transnational_sale_pi_qty) - (val.lc_opened + val.nonlc_opend);
		}





	}



	convert(date) {
		if (date != null) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}

	}

	dateReset() {
		this.fromdate = '';
		this.todate = '';
		this.bsRangeValue = ['', ''];
	}




	getMonth(month: Number) {
		switch (month) {
			case 1: {
				return 'January';
				break;
			}
			case 2: {
				return 'February';
				break;
			}
			case 3: {
				return 'March';
				break;
			}
			case 4: {
				return 'April';
				break;
			}
			case 5: {
				return 'May';
				break;
			}
			case 6: {
				return 'June';
				break;
			}
			case 7: {
				return 'July';
				break;
			}
			case 8: {
				return 'August';
				break;
			}
			case 9: {
				return 'September';
				break;
			}
			case 10: {
				return 'October';
				break;
			}
			case 11: {
				return 'November';
				break;
			}
			case 12: {
				return 'December';
				break;
			}

		}
	}


	exportData() {
		let data = {};
		this.export_data = [];
		// console.log(this.data);
		// console.log(this.array);
		for (const val of this.array) {
			data = {
				'Deal Date': val.deal_dt,
				'Shipment Month': this.getMonth(val.shipment_month) + '-' + val.shipment_year,
				'Deal Quantity': val.deal_quantity,
				'Deal Rate': val.deal_rate,
				'Currency': val.CurrencyName,
				'Indent Qunatity': val.indent_quantity,
				'Transnational Qunatity': val.transnational_sale_pi_qty,
				'Forward Qunatity': val.forward_sale_pi_qty,
				'HighSeas Qunatity': val.highseas_sale_pi_qty,
				'Indent PI Received': val.indent_pi_received,
				'LC PI Received': val.lc_pi_received,
				'Non LC PI Received': val.non_lc_pi_received,
				'Total PI Received': val.lc_pi_received + val.non_lc_pi_received,
				'LC Opened': val.lc_opened,
				'Non LC Opened': val.nonlc_opend,
				'Total Lc Non Lc Opened': Number(val.lc_opened) + Number(val.nonlc_opend),
				'In Hand': (val.lc_pi_received + val.non_lc_pi_received) - (val.lc_opened + val.nonlc_opend),
				'Total O/s': (val.deal_quantity) - (val.lc_opened + val.nonlc_opend),
				'Added Date': val.added_date,
				'Remark': val.remark
			};
			this.export_data.push(data);


		}
		const foot = {
			'Deal Date': 'Total',
			'Shipment Month': '',
			'Deal Quantity': this.dealQt,
			'Deal Rate': this.dealRate,
			'Currency': '',
			'Indent Qunatity': this.indentQty,
			'Transnational Qunatity': this.transnationalQty,
			'Forward Qunatity': this.forwardQty,
			'HighSeas Qunatity': this.highSeasQty,
			'Indent PI Received': this.indent_pi_recv,
			'LC PI Received': this.lc_pi_recv,
			'Non LC PI Received': this.non_lc_pi_recv,
			'Total PI Received': this.totalpi,
			'LC Opened': this.lcOpen,
			'Non LC Opened': this.NonlcOpen,
			'Total Lc Non Lc Opened': this.TotalLc_nonLc,
			'In Hand': this.inHand,
			'Total O/s': this.totalOs,
			'Added Date': '',
			'Remark': ''
		};
		this.export_data.push(foot);

	}



	exportExcel() {
		this.export_data = [];
		this.exportData();
		this.exportService.exportExcel(this.export_data, 'Flc-deal List');
	}

	exportPdf() {
		this.export_data = [];
		this.exportData();
		this.exportColumns = this.export_cols.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Flc-deal List');
	}





}
