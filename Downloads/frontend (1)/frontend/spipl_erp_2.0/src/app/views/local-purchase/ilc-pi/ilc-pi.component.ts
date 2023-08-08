import { Component, ElementRef, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { ModalDirective } from 'ngx-bootstrap';
import { LoginService } from '../../login/login.service';
import { DatePipe } from '@angular/common';

import { PayableParameter } from '../../../shared/payable-request/payable-parameter.model';
import { PayableRequestModule } from '../../../shared/payable-request/payable-request.module';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { ExportService } from '../../../shared/export-service/export-service';
import { environment } from '../../../../environments/environment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Ilc_Pi } from '../../../shared/apis-path/apis-path';



@Component({
	selector: 'app-ilc-pi',
	templateUrl: './ilc-pi.component.html',
	styleUrls: ['./ilc-pi.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
		InrCurrencyPipe,
		ToasterService,
		ExportService,
		CrudServices

	]
})
export class IlcPiComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('createLcModal', { static: false }) public createLcModal: ModalDirective;
	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
	currentYear: number;
	date = new Date();
	bsRangeValue = [];
	ilc_pi_from_dt: string;
	ilc_pi_to_dt: string;
	cols: { field: string; header: string; style: string; }[];
	pi_list = [];
	deal_list = [];
	user: UserDetails;
	links: string[] = [];
	payablePara: PayableRequestModule;
	payableExit: boolean = true;
	checkstatus: boolean = false;
	generatePiFlag: boolean = false;
	checkedList = [];
	dealArrayForPI = [];
	mode: string = 'Edit';

	lcCreation: boolean = false;
	lcCreationArray = [];
	modeLc: string = 'Create';

	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;



	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	tot_quantity: number;
	tot_amount: number;
	tot_amountUtilized: number;
	filteredValuess: any[];
	export_purchase_list = [];
	global_list_pi = [];

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	serverUrl: any;
	paymentMethod: { label: string; id: number; }[];
	paymentTypeFlag: number = 0;
	excel_download: boolean = false;
	pdf_download: boolean = false;
	payment_request: boolean = false;
	create_lc: boolean = false;
	deals: boolean = false;
	role_id: any;
	company_id: any;
	isLoading: boolean;


	constructor(
		private permissionService: PermissionService,
		private loginService: LoginService,
		private datePipe: DatePipe,
		private currencyPipe: InrCurrencyPipe,
		private exportService: ExportService,
		private toasterService: ToasterService,
		private crudServices: CrudServices
	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();

		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.excel_download = (this.links.indexOf('Ilc Pi Export Excel') > -1);
		this.pdf_download = (this.links.indexOf('Ilc Pi Export PDF') > -1);
		this.payment_request = (this.links.indexOf('Ilc Pi Payment Request') > -1);
		this.create_lc = (this.links.indexOf('Ilc Pi Create Ilc') > -1);
		this.deals = (this.links.indexOf('Ilc Pi Deal List') > -1);

		
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;

		this.currentYear = Number(this.datePipe.transform(this.date, 'yyyy'));
		if (this.datePipe.transform(this.date, 'MM') > '03') {

            this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

        } else {

            this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

        }
	//	this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		this.paymentMethod = [{ label: 'RTGS/NEFT', id: 1 }, { label: 'LC', id: 2 }, { label: 'RTGS/NEFT / LC', id: 3 }];

		this.cols = [
			{ field: 'sub_org_name', header: 'Supplier Name', style: '250px' },
			{ field: 'pi_date', header: 'PI Date', style: '150px' },
			{ field: 'pi_invoice_no', header: 'PI Invoice No.', style: '100px' },
			{ field: 'place_of_loading', header: 'Place Of Loading', style: '100px' },
			{ field: 'place_of_destination', header: 'Place of Destination', style: '150px' },
			{ field: 'remark', header: 'Remark', style: '150px' },

		];

	}

	ngOnInit() {
	}

	onDateRangeSelect(dateEvent) {

		if (dateEvent !== null) {

			this.ilc_pi_from_dt = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
			this.ilc_pi_to_dt = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
		} else {
			this.ilc_pi_from_dt = '';
			this.ilc_pi_to_dt = '';
		}

		this.get_Ilc_Pi_List();

	}

	get_Ilc_Pi_List() {
        this.isLoading = true
		this.crudServices.getOne<any>(Ilc_Pi.getAll, {
			ilc_pi_from_dt: this.ilc_pi_from_dt,
			ilc_pi_to_dt: this.ilc_pi_to_dt,
			company_id : this.role_id == 1 ? null : this.company_id 
		}).subscribe(result => {
			this.pi_list = [];
			this.isLoading = false
			for (const val of result) {
				const dealDetail = val.LocalPurchaseDealDet;
				let amount_utilized_rtgs = 0;
				let amount_utilized_lc = 0;
				let quantity_utilized_lc = 0;

				for (const arr of dealDetail) {
					if (arr.PayMethodAgainstDeal === 1) {
						amount_utilized_rtgs += Number(arr.AmountUtiliseAgainstDeal);
					} else if (arr.PayMethodAgainstDeal === 2) {
						amount_utilized_lc += Number(arr.AmountUtiliseAgainstDeal);

					}

					if (arr.PiQuantity) {
						quantity_utilized_lc += Number(arr.PiQuantity);
					}

				}
				val['amount_utilized_rtgs'] = amount_utilized_rtgs;
				val['amount_utilized_lc'] = amount_utilized_lc;
				val['quantity_utilized_lc'] = quantity_utilized_lc;
				this.pi_list.push(val);
			}
			console.log(this.pi_list);

			this.global_list_pi = this.pi_list;

			//  this.pi_list = result;

		});

	}

	filterData(event) {
		this.pi_list = this.global_list_pi
		
		if(event.target.checked) {
			
        this.pi_list = this.pi_list.filter(item => item.ilc_id == null)
		}
		
	}

	getDeals(deals) {
		this.deal_list = [];
		for (const val of deals) {
			const amount = val.quantity * val.rate;
			const gst_percent = val.sgst_percent + val.cgst_percent;
			const tcs_percent = val.tcs_percent;
			const deal_value = ((amount) * gst_percent / 100);
			const deal_value_gst_tcs = (amount + deal_value) * (tcs_percent / 100);
			const deal_value_gst = (amount) + deal_value_gst_tcs + deal_value;

			val.deal_value_gst = Math.round(deal_value_gst);
			this.deal_list.push(val);
		}

		this.calculateTotal(this.deal_list);
		//  this.deal_list = deals;
		//  console.log(this.deal_list);
		this.myModal.show();
	}

	getPaymentMode(val) {
		if (val === 1) {
			return 'RTGS/NEFT';
		} else if (val === 2) {
			return 'LC';
		}
	}

	ilcPaymentRequest(item) {
		const record_id = item.id;
		const sub_org_id = item.supplier_id;
		const sub_org_name = item.sub_org_name;
		const deal_rate = item.amount_utilized_rtgs;

		const req_flag = 4; // ilc pi
		const emp_id = 0;
		const dealRateInr = this.currencyPipe.transform(deal_rate);
		const headerMsg = 'Payment Details for ILC PI No: ' + record_id;

		const createRequestAcess = (this.links.indexOf('Create ILC PI Payment') > -1);
		const editRequestAcess = (this.links.indexOf('Edit ILC PI Payment') > -1);
		this.payablePara = new PayableParameter(sub_org_id, emp_id, headerMsg, deal_rate, record_id, req_flag, sub_org_name, createRequestAcess, editRequestAcess, this.company_id);
		this.payableExit = false;

	}

	calculateTotal(deal) {
		this.tot_quantity = deal.reduce((sum, item) => sum + item.quantity, 0);
		this.tot_amount = deal.reduce((sum, item) => sum + Number(item.deal_value_gst), 0);
		this.tot_amountUtilized = deal.reduce((sum, item) => sum + Number(item.AmountUtiliseAgainstDeal), 0);
	}

	filterOnMethod(event) {
		if (event !== null && event !== undefined) {
			this.paymentTypeFlag = event.id;
			if (event.id === 1) {
				this.pi_list = this.global_list_pi.filter(val => val.amount_utilized_rtgs > 0);
			} else if (event.id === 2) {
				this.pi_list = this.global_list_pi.filter(val => val.amount_utilized_lc > 0);
			} else if (event.id === 3) {
				this.pi_list = this.global_list_pi.filter(val => val.amount_utilized_lc > 0 && val.amount_utilized_rtgs > 0);
			}
		} else {
			this.paymentTypeFlag = 0;
			this.pi_list = this.global_list_pi;
		}
	}

	payableRequestBack(event) {
		this.payablePara = null;
		this.payableExit = true;
	}

	exportData() {
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.pi_list;
		} else {
			arr = this.filteredValuess;
		}
		// console.log(arr);
		for (let i = 0; i < arr.length; i++) {
			const export_data = {};
			for (let j = 0; j < this.cols.length; j++) {
				export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

			}
			this.export_purchase_list.push(export_data);


		}


	}


	exportPdf() {
		this.export_purchase_list = [];
		this.exportData();
		const exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(exportColumns, this.export_purchase_list, 'ILC-PI-List');
	}

	exportExcel() {
		this.export_purchase_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_purchase_list, 'ILC-PI-List');
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;
	}


	// set check item list
	onCheck(checked, item) {
		this.checkstatus = false;
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}
		this.checkSelection();
		console.log(this.checkedList);
	}


	checkSelection() {
		if (this.checkedList.length > 0) {
			for (let i = 0; i < this.checkedList.length; i++) {
				if (this.checkedList[0]['supplier_id'] === this.checkedList[i]['supplier_id']) {
					this.checkstatus = true;
				} else {
					this.checkstatus = false;
					break;
				}
			}
			if (this.checkstatus) {
				//  this.generatePiFlag = true;
			} else {
				this.toasterService.pop('warning', 'warning', 'Supplier Not Same ');
			}
		}
	}

	// for all check box check
	onCheckAll(checked) {

		this.checkstatus = false;
		this.checkedList = [];

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.pi_list;
		} else {
			arr = this.filteredValuess;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				if (val.amount_utilized_lc > 0 && val.ilc_id === 0) {
					this.checkedList.push(val);
				}

			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				if (val.amount_utilized_lc > 0) {
					this.checkedList.splice(this.checkedList.indexOf(val), 1);
				}
			}
		}

		this.checkSelection();


	}

	createLc() {
		this.lcCreation = true;
		// console.log(this.checkedList);
		this.lcCreationArray = this.checkedList;
		// this.createLcModal.show();
	}

	onEdit(item) {

		this.generatePiFlag = true;
		this.dealArrayForPI = item;
	}

	onDelete(item, index) {

		if (item.id) {
			this.crudServices.deleteData<any>(Ilc_Pi.delete, {
        id:item.id
      }).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.pi_list.splice(index, 1);
				});

		}
	}

	BackFromPi(event) {
		this.generatePiFlag = event;
	}

	BackFromLc(event) {
		this.checkedList = [];
		this.lcCreation = event;
		this.checkstatus = false;
	}

	getDocArray(doc) {
		return JSON.parse(doc);
	}


}
