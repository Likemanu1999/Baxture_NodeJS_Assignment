import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { bank_gaurantee } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-bank-gaurantee',
	templateUrl: './bank-gaurantee.component.html',
	styleUrls: ['./bank-gaurantee.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	
})
export class BankGauranteeComponent implements OnInit {


	@ViewChild('dt', { static: false }) table: Table;
	cols: { field: string; header: string; }[];
	isLoading: boolean = true;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	_selectedColumns: any[];
	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();
	fromDate: any;
	toDate: any;

	bg_list: any = []

	lookup_bank = {};
	banks = [];

	lookup_company = {};
	companies = [];

	
	bg_sblc_arr = staticValues.bg_sblc_type;

	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService, private exportService: ExportService) {

		this.cols = [

			{ field: 'sub_org_name', header: 'Company Name' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'bg_date', header: 'BG/SBLC Date' },
			{ field: 'bg_no', header: 'BG/SBLC No.' },
			{ field: 'bg_amount', header: 'BG/SBLC Amount' },
			{ field: 'expiry_date', header: 'Expiry Date' },
			{ field: 'edit', header: 'Edit' },
		];

		this._selectedColumns = this.cols;

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.bsRangeValue = [];


		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];
	}

	ngOnInit() {
		this.isLoading = true;
		this.getBgData();
	}

	getBgData() {

		this.CrudServices.postRequest<any>(bank_gaurantee.get_all, { fromdate: this.fromDate, todate: this.toDate }).subscribe((response) => {
			
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.bg_list = [];
			} else {
				this.isLoading = false;

				this.bg_list = [];

				for (let item, i = 0; item = response[i++];) {
					const bank = item.spipl_bank.bank_name;
					const compnay_name = item.sub_org_master.sub_org_name;
					item.bank_name = bank;
					item.sub_org_name = compnay_name;
					this.bg_list.push(item);

					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'bank_name': bank });

					}
					if (!(compnay_name in this.lookup_company)) {
						this.lookup_company[compnay_name] = 1;
						this.companies.push({ 'sub_org_name': compnay_name });
					}

				}

				console.log(this.bg_list,"bg_list")

			}
		});


	}

	onSelect($e) {
		if ($e) {
			this.fromDate = $e[0];
			this.toDate = $e[1];
		}
		this.getBgData();
	}

	getColumnPresent(name) {

		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	onFilter(event, dt) {
	}


	add_bg() {
		this.router.navigate(["/forex/add-bg"]);
	}

	onEdit(id) {

		this.router.navigate(["/forex/edit-bg", id]);
	}


	onDelete(id) {
		this.CrudServices.postRequest<any>( bank_gaurantee.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBgData();
			}
		});
	}


}
