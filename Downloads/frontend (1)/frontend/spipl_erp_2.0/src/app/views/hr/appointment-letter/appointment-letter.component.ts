import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { AppointmentMail, EmailTemplateMaster, PercentageDetails, percentage_master } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import * as moment from 'moment';

@Component({
	selector: 'app-appointment-letter',
	templateUrl: './appointment-letter.component.html',
	styleUrls: ['./appointment-letter.component.scss'],
	providers: [CrudServices, ToasterService, DatePipe, InrCurrencyPipe],
	encapsulation: ViewEncapsulation.None
})

export class AppointmentLetterComponent implements OnInit {
	addForm: FormGroup;
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };
	templateData: any;
	hraPer: any;
	basicPer: any;
	daPer: any;
	emploerpfPer: any;
	ltaPer: any;
	childEducationAllow: any;
	yearlypfPer: any;
	arr: any = [];
	mycontent: any;
	editor: boolean;
	converted: Blob;
	mail: any;
	subject: any;
	from: any;
	html: any;
	foot: any;
	isLoading: boolean = false;
	constructor(
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private datePipe: DatePipe,
		private inrCurrencyPipe: InrCurrencyPipe,
	) {
		this.toasterService = toasterService;
		this.addForm = new FormGroup({
			'first_name': new FormControl(null, Validators.required),
			'title': new FormControl(null, Validators.required),
			'last_name': new FormControl(null, Validators.required),
			'address': new FormControl(null, Validators.required),
			'email': new FormControl(null, Validators.required),
			'mob_no': new FormControl(null, Validators.required),
			'yearly_ctc': new FormControl(null, Validators.required),
			'joining_date': new FormControl(null, Validators.required),
			'interview_date': new FormControl(null,Validators.required),
			'post': new FormControl(null, Validators.required),
		});
		this.ckeConfig = {
			'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
		};
	}

	ngOnInit() {
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Appointment Letter' }).subscribe(response => {
			this.templateData = response;
			this.mycontent = response[0].custom_html;

		})

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Appointment Mail' }).subscribe(response => {
			this.subject = response[0].subject;
			this.from = response[0].from_name;
			this.html = response[0].custom_html;
		})

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
			this.foot = response[0].custom_html;

		})
		this.crudServices.getAll<any>(percentage_master.getAllDataByCurrentDate).subscribe(response => {

			response.forEach(element => {
				if (element.percentage_type.type == 'Basic') {

					this.basicPer = element.percent_value;
				}
				if (element.percentage_type.type == 'DA') {
					this.daPer = element.percent_value;
				}
				if (element.percentage_type.type == 'HRA') {
					this.hraPer = element.percent_value;
				}
				if (element.percentage_type.type == 'Employer PF') {
					this.emploerpfPer = element.percent_value;
				}
				if (element.percentage_type.type == 'LTA') {
					this.ltaPer = element.percent_value;
				}
				if (element.percentage_type.type == 'Child Education') {
					this.childEducationAllow = element.percent_value;
				}
				if (element.percentage_type.type == 'Employee PF') {
					this.yearlypfPer = element.percent_value;
				}
			});

		})
	}

	downloadLetter() {
		this.editor = true;

		let DATE = this.datePipe.transform(new Date(), 'dd.MM.yyyy');
		let NAME = this.addForm.value.first_name + ' ' + this.addForm.value.last_name;
		let ADDRESS = this.addForm.value.address;
		let MOBILE = this.addForm.value.mob_no;
		let FIRST_NAME = this.addForm.value.first_name;

		let CTC = this.addForm.value.yearly_ctc;
		let YEARLY_CTC = CTC * 12/100000;
		let YEARLY_SALARY = CTC * 12;
		let POST = this.addForm.value.post
		let JOINING_DATE = this.addForm.value.joining_date
		let INTERVIEW_DATE = this.addForm.value.interview_date
		let BASIC_SALARY = Math.round(this.addForm.value.yearly_ctc * this.basicPer / 100);
		let YEARLY_BASIC_SALARY = Math.round(BASIC_SALARY * 12);
		let DA = Math.round(this.addForm.value.yearly_ctc * this.daPer / 100);
		let YEARLY_DA = Math.round(DA * 12);
		let HRA = Math.round((BASIC_SALARY + DA) * this.hraPer / 100);
		let YEARLY_HRA = Math.round(HRA * 12); 
		let salary_for_employer_pf = this.addForm.value.yearly_ctc - DA - BASIC_SALARY;
		let EMPLOYER_PF = 0;

		if (salary_for_employer_pf < (15000)) {
			EMPLOYER_PF = Math.round(salary_for_employer_pf * this.emploerpfPer / 100); // 11
		} else {
			EMPLOYER_PF = Math.round((15000) * this.emploerpfPer / 100); // 11
		}
		let YEARLY_EMPLOYER_PF = Math.round(EMPLOYER_PF * 12);
		let PER_MONTH = (this.addForm.value.yearly_ctc - (EMPLOYER_PF));
		let LTA = Math.round(PER_MONTH * this.ltaPer / 100);
		let YEARLY_LTA = Math.round(LTA * 12);
		let EDU_ALLOWANCE = this.childEducationAllow;
		let YEARLY_EDU_ALLOWANCE = EDU_ALLOWANCE * 12;
		let SPECIAL_ALLOWANCE = PER_MONTH - (BASIC_SALARY + DA + HRA + LTA + EDU_ALLOWANCE);
		let YEARLY_SPECIAL_ALLOWANCE = Math.round(SPECIAL_ALLOWANCE * 12);
		let GROSS_SALARY = BASIC_SALARY + DA + HRA + LTA + EDU_ALLOWANCE + SPECIAL_ALLOWANCE;
		let YEARLY_GROSS_SALARY = Math.round(GROSS_SALARY * 12);
		let PT = 0;

		if (this.datePipe.transform(new Date(), 'MM') == '02') {
			PT = 300;
		} else {
			PT = 200;
		}
		let YEARLY_PT = Math.round(PT * 12);



		let EMP_PF = 0;

		if (GROSS_SALARY < (15000)) {
			EMP_PF = Math.round(GROSS_SALARY * this.yearlypfPer / 100); // 12
		} else {
			EMP_PF = Math.round((15000) * this.yearlypfPer / 100);  // 12
		}
		let YEARLY_EMP_PF = Math.round(EMP_PF * 12);

		let NET_SALARY = GROSS_SALARY - EMP_PF - PT - EMPLOYER_PF;
		
		let YEARLY_NET_SALARY = Math.round(NET_SALARY * 12);


		this.arr = {
			DATE: DATE,
			NAME: NAME,
			ADDRESS: ADDRESS,
			MOBILE: MOBILE,
			FIRST_NAME: FIRST_NAME,
			BASIC_SALARY: this.inrCurrencyPipe.transform(BASIC_SALARY),
			YEARLY_BASIC_SALARY:this.inrCurrencyPipe.transform(YEARLY_BASIC_SALARY),
			PER_MONTH: CTC,
			CTC: CTC,
			YEARLY_CTC: YEARLY_CTC,
			YEARLY_SALARY: YEARLY_SALARY,
			POST: POST,
			JOINING_DATE: moment(JOINING_DATE).format('Do MMMM YYYY'),
			INTERVIEW_DATE: moment(INTERVIEW_DATE).format('Do MMMM YYYY'),
			DA: this.inrCurrencyPipe.transform(DA),
			YEARLY_DA: this.inrCurrencyPipe.transform(YEARLY_DA),
			HRA: this.inrCurrencyPipe.transform(HRA),
			YEARLY_HRA: this.inrCurrencyPipe.transform(YEARLY_HRA),
			LTA: this.inrCurrencyPipe.transform(LTA),
			YEARLY_LTA: this.inrCurrencyPipe.transform(YEARLY_LTA),
			EDU_ALLOWANCE: this.inrCurrencyPipe.transform(EDU_ALLOWANCE),
			YEARLY_EDU_ALLOWANCE: this.inrCurrencyPipe.transform(YEARLY_EDU_ALLOWANCE),
			SPECIAL_ALLOWANCE: this.inrCurrencyPipe.transform(SPECIAL_ALLOWANCE),
			YEARLY_SPECIAL_ALLOWANCE : this.inrCurrencyPipe.transform(YEARLY_SPECIAL_ALLOWANCE),
			GROSS_SALARY: this.inrCurrencyPipe.transform(GROSS_SALARY),
			YEARLY_GROSS_SALARY: this.inrCurrencyPipe.transform(YEARLY_GROSS_SALARY),
			NET_SALARY: this.inrCurrencyPipe.transform(NET_SALARY),
			YEARLY_NET_SALARY:this.inrCurrencyPipe.transform(YEARLY_NET_SALARY),
			PT: this.inrCurrencyPipe.transform(PT),
			YEARLY_PT: this.inrCurrencyPipe.transform(YEARLY_PT),
			EMP_PF: EMP_PF,
			YEARLY_EMP_PF : YEARLY_EMP_PF,
			EMPLOYER_PF: EMPLOYER_PF,
			YEARLY_EMPLOYER_PF : YEARLY_EMPLOYER_PF,
			TITLE: this.addForm.value.title

		};

		this.replaceStr();
	}


	onBack() {
		this.editor = false;
	}

	download() {

		const newstr = this.mycontent;
		let html_document = '<!DOCTYPE html><html><head><title></title>';
		html_document += '</head><body>' + newstr + '</body></html>';
		this.converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
		saveAs(this.converted, 'Appointment-Letter-' + this.addForm.value.first_name);
	}


	sendMailAppointmentLetter() {

		let arr = {
			TITLE: this.addForm.value.title,
			NAME: this.addForm.value.first_name + ' ' + this.addForm.value.last_name,
			JOINING_DATE: this.datePipe.transform(this.addForm.value.joining_date, 'dd.MM.yyyy'),
		};

		for (const key in arr) {
			if (!arr.hasOwnProperty(key)) {
				continue;
			}

			this.html = this.html.replace(new RegExp('{' + key + '}', 'g'), arr[key]);

		}

		this.html = this.html + this.foot;

		const send = { 'from': this.from, 'to': this.addForm.value.email, 'subject': this.subject, 'html': this.html };

		this.isLoading = true;
		this.crudServices.postRequest<any>(AppointmentMail.sendMail, { mail_object: send }).subscribe(res => {
			this.isLoading = false;
			if (res.code = '100') {
				this.toasterService.pop(res.message, res.message, res.data);
			} else {
				this.toasterService.pop('error', 'error', 'Not Sent');
			}
		});
	}

	replaceStr() {
		for (const key in this.arr) {
			if (!this.arr.hasOwnProperty(key)) {
				continue;
			}

			this.mycontent = this.mycontent.replace(new RegExp('{' + key + '}', 'g'), this.arr[key]);
		}
	}

	reset() {
		this.addForm.reset();
	}

}
