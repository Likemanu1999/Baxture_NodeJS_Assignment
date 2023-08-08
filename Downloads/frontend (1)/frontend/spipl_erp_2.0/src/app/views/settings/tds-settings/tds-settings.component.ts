import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { YearCtc } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
	selector: 'app-tds-settings',
	templateUrl: './tds-settings.component.html',
	styleUrls: ['./tds-settings.component.css', './tds-settings.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService],
	encapsulation: ViewEncapsulation.None,
})
export class TdsSettingsComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('TdsDateOpenCloseModal', { static: false }) public TdsDateOpenCloseModal: ModalDirective;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	financialYearList: any = [];
	_selectedColumns: any[];

	formCloseDate: string;
	formOpenDate: string;
	actual_budgted_flag_list = staticValues.actual_budgted;
	actual_budgted_status: any;


	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	updateForm: FormGroup;

	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService) {

		this.cols = [

			{ field: 'financial_year', header: 'Financial Year' },
			{ field: 'tds_form_fill_flag', header: 'Actual/Budgted Flag' },
			{ field: 'tds_form_open_from', header: 'Form Open Date' },
			{ field: 'tds_form_open_to', header: 'Form Close Date' },
			{ field: 'tds_form_remark', header: 'Remark' },
			{ field: 'edit', header: 'Edit' },

		];

		this._selectedColumns = this.cols;

		this.updateForm = new FormGroup({
			//'update_unit_type': new FormControl(null),
			'financial_year': new FormControl(null),
			'tds_form_fill_flag': new FormControl(null),
			'tds_form_open_from': new FormControl(null),
			'tds_form_open_to': new FormControl(null),
			'tds_form_remark': new FormControl(null),
		});


	}

	ngOnInit() {
		this.getFinancialTdsDetails();
	}

	getFinancialTdsDetails() {



		this.CrudServices.getAll<any>(YearCtc.dateDetailsActualBudgted).subscribe((response) => {
			this.isLoading = false;
			this.financialYearList = response;
		});
	}


	closeModal() {

		this.TdsDateOpenCloseModal.hide();
		this.getFinancialTdsDetails();
	}

	onEdit(detailsData) {
		this.TdsDateOpenCloseModal.show();
		this.updateForm = new FormGroup({
			'financial_year': new FormControl(detailsData.financial_year),
			'tds_form_fill_flag': new FormControl(detailsData.tds_form_fill_flag),
			'tds_form_open_from': new FormControl(detailsData.tds_form_open_from),
			'tds_form_open_to': new FormControl(detailsData.tds_form_open_to),
			'tds_form_remark': new FormControl(detailsData.tds_form_remark),
		});


	}
	getValue(val) {
		let str = '';
		if (val == 1) {
			str = "Budgeted";
		} else if (val == 2) {
			str = "Actual";
		}
		return str;
	}
	updateTdsFormOpenCloseDate() {
		this.CrudServices.postRequest<any>(YearCtc.updateTdsFormOpenCloseDate, {
			financial_year: this.updateForm.value.financial_year,
			tds_form_fill_flag: this.updateForm.value.tds_form_fill_flag,
			tds_form_open_from: this.updateForm.value.tds_form_open_from,
			tds_form_open_to: this.updateForm.value.tds_form_open_to,
			tds_form_remark: this.updateForm.value.tds_form_remark,

		}).subscribe((response) => {

			if (response.code == '101') {

			} else {

				this.toasterService.pop(response.message, 'Success', response.data);
				this.TdsDateOpenCloseModal.hide();
				this.getFinancialTdsDetails();

			}
		})
	}
}
