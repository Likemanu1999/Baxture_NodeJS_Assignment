import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from "../../shared/crud-services/crud-services";
import { FileUpload, EwayDeclaration } from '../../shared/apis-path/apis-path';
import { CommonService } from '../../shared/common-service/common-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from "moment";
@Component({
	selector: 'app-eway-declaration-form',
	templateUrl: './eway-declaration-form.component.html',
	styleUrls: ['./eway-declaration-form.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, CommonService]
})

export class EwayDeclarationFormComponent implements OnInit {

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});
	
	loadingBtn: boolean = false;
	ewayForm: FormGroup;
	fileData = new FormData();
	financial_year: any = this.commonService.getCurrentFinancialYear();

	constructor(
		toasterService: ToasterService,
		private crudServices: CrudServices,
		private commonService: CommonService
	) {
		this.toasterService = toasterService;
	}

	ngOnInit() {
		this.initForm()
	}

	initForm() {
		this.ewayForm = new FormGroup({
			sub_org_name: new FormControl(null, Validators.required),
			gst_no: new FormControl(null, Validators.required),
			pan_no: new FormControl(null, Validators.required),
			eway_declaration_form: new FormControl(null, Validators.required),
			acknowledge: new FormControl(false, Validators.requiredTrue)
		});
	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("e_way_form", files[i], files[i]['name']);
		}
	}

	onSubmit() {
		let fy = this.financial_year.split('-');
		let from_date = fy[0] + "-04-01";
		let to_date = fy[1] + "-03-31";
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let eway_declaration_form = res_aws.uploads["e_way_form"][0].location;
			let data = {
				sub_org_name: this.ewayForm.value.sub_org_name,
				gst_no: this.ewayForm.value.gst_no,
				pan_no: this.ewayForm.value.pan_no,
				eway_declaration_form: eway_declaration_form,
				financial_year: this.financial_year,
				from_date: moment(from_date).format("YYYY-MM-DD"),
				to_date: moment(to_date).format("YYYY-MM-DD")
			};
			let body = {
				data: data
			};
			this.crudServices.updateData(EwayDeclaration.addData, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'E-Way Declaration Submitted Successfully');
					this.ewayForm.reset();
				}
			});
		});
	}
}

