import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { now } from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { Table } from 'primeng/table';
import { ExportService } from '../../../shared/export-service/export-service';
import { HrServices } from '../hr-services';
import { TDSResultList } from './tds-result-model';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { actualBudgtedTDS } from '../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-tds-cal',
  templateUrl: './tds-cal.component.html',
  styleUrls: ['./tds-cal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [HrServices, ExportService, ToasterService, CrudServices]
})
/**
* This component shows TDS calculation reports.
*/
export class TdsCalComponent implements OnInit {
  result: any;
  isLoading = false;
  financial_year: string;
  first_financial_year: string;
  second_financial_year: string;
  cardTitle: string;
  bsValue: Date = new Date();
  bsValue2: Date = new Date();
  selectedDate: Date;
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      positionClass: 'toast-bottom-right',
      tapToDismiss: true,
      timeout: 5000
    });
  @ViewChild('dt', { static: false }) table: Table;
  cols: any[];
  public yearMask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  exportColumns: { title: any; dataKey: any; }[];
  isCollapsedActual: boolean = false;
  optradio: any = '0';
  constructor(private hrServices: HrServices,
    private exportService: ExportService, private toasterService: ToasterService, private CrudServices: CrudServices) {
    const d = new Date();
    this.financial_year = (String(d.getFullYear() - 1)) + '-' + (String(d.getFullYear()));
    this.cols = [
      { field: 'emp_name', header: 'Employee Name' },
      { field: 'basic', header: 'Basic' },
      { field: 'da', header: 'Da' },
      { field: 'hra', header: 'Hra' },
      { field: 'lta', header: 'Lta' },
      { field: 'child_edu_allowance', header: 'Child Education Allowance' },
      { field: 'special_allowance', header: 'Special Allowance' },
      { field: 'bonus', header: 'Bonus' },
      { field: 'performance_bonus', header: 'Performance Bonus' },
      { field: 'incentive', header: 'Incentive On Sales' },
      { field: 'TotalEarning', header: 'Total Earning' },
      { field: 'rent_paid', header: 'Rent Paid' },
      { field: 'hra_received', header: 'Hra Received' },
      { field: 'excess_of_rent_paid_10_per_salary', header: 'Excess Of Rent Paid Over 10 % Of Salary' },
      { field: 'basic_da_40_per', header: '40 % Basic And Da' },
      { field: 'hra_allowance', header: 'Hra Allowance' },
      { field: 'child_edu_all', header: 'Child Education Allowance Month' },
      { field: 'Total_Hra_allow_child_edu_allow', header: 'Total' },
      { field: 'salary_after_exempt_all', header: 'Salary After Exempt All' },
      { field: 'tax_on_employement', header: 'Tax On Employment' },
      { field: 'standard_deduction', header: 'Standard Deduction' },
      { field: 'TotalDeduction', header: 'Total Deduction' },
      { field: 'SalaryReceivedInHand', header: 'Salary Received In Hand' },
      { field: 'intrestOnHomeLoan', header: 'Interest On Home Loan' },
      { field: 'incomeFromHouseProperty', header: 'Income From House Property' },
      { field: 'grossTotalIncome', header: 'Gross Total Income' },
      { field: 'lic', header: 'Lic' },
      { field: 'pf', header: 'Provident Fund (epf)' },
      { field: 'ppf', header: 'Public Provident Fund' },
      { field: 'housing_loan_principle', header: 'Repayment Of Housing Loan Principle' },
      { field: 'tuitionFees', header: 'Tuition Fees ' },
      { field: 'sukanya_schme', header: 'Sukanya Samrudhi Scheme' },
      { field: 'pension', header: 'National Pension System  80ccd (1b)' },
      { field: 'nsc', header: 'National Saving Certificates (nsc)' },
      { field: 'tax_saving_mutual_fund', header: 'Tax Saving Mutual Fund' },
      { field: 'other', header: 'Others' },
      { field: 'TotalInvestment', header: 'Total Investment' },
      { field: 'deductionApplicable', header: 'Applicable Deduction' },
      { field: 'nonSeniorCitizen', header: 'Self And Family(non Senior Citizen Max 25000/-)' },
      { field: 'seniorCitizen', header: 'Self And Family(including Senior Citizen Max 50000/-)' },
      { field: 'medicalExpenditure_max_50k', header: 'Medical Expenditure Max 50000 /-' },
      { field: 'Total80D', header: 'Total 80d' },
      { field: 'deductionUnderChapterVIA', header: 'Deduction Under Cahpter Vi A' },
      { field: 'TotalIncome', header: 'Total Income' },
      { field: 'TaxableIncome', header: 'Taxable Income' },
      { field: 'incomTax', header: 'Income Tax' },
      { field: 'surcharge', header: 'Surcharge' },
      { field: 'taxIncludeSurcharge', header: 'Tax Include Surcharge' },
      { field: 'rebate', header: 'Rebate U/s 87a' },
      { field: 'taxPayableAfterRebate', header: 'Tax Payable After Rebate' },
      { field: 'education_cess', header: 'Education Cess' },
      { field: 'TotalTaxPayable', header: 'Total Tax Payable' },
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  ngOnInit() {
    this.bsConfig = Object.assign({}, {
      minMode: this.minMode,
      dateInputFormat: 'YYYY-MM',
      adaptivePosition: true
    });

  }
  exportPdf() {
    this.exportService.exportPdf(this.exportColumns, this.result, 'TDSWorking_' + new Date());
  }

  exportExcel() {
    this.exportService.exportExcel(this.result, 'TDSWorking_' + new Date());
  }
  /**
  * This function is used to get budgeted TDS report & we are passing financial year to the backend we get reponse of type TDSResultList.
  */
  getBudgetList() {
    this.isLoading = true;
    this.cardTitle = 'Budgted List';
    this.CrudServices.postRequest<any>(actualBudgtedTDS.budgeted_list, {
      financial_year: this.financial_year
    }).subscribe((response: TDSResultList) => {
      this.isCollapsedActual = true;
      this.result = response;
      this.isLoading = false;
    });

    // this.hrServices.budgeted_list(this.financial_year)
    // .subscribe((response: TDSResultList) => {
    //   this.isCollapsedActual = true;
    //   this.result = response;
    //   this.isLoading = false;
    // });
  }
  /**
  * This function is used to get actual TDS report & we are passing from month to month & financial year to the backend we get reponse of type TDSResultList.
  */
  getActualList() {
    this.selectedDate = this.bsValue;
    const calculateMonth = this.selectedDate.getMonth() + 1;
    const calculateYear = Number(this.selectedDate.getFullYear());
    if (calculateMonth <= 3) {
      this.first_financial_year = (calculateYear - 1) + '-' + calculateYear;
    } else {
      this.first_financial_year = calculateYear + '-' + (calculateYear + 1);
    }

    this.selectedDate = this.bsValue2;
    const calculateMonth1 = this.selectedDate.getMonth() + 1;
    const calculateYear1 = Number(this.selectedDate.getFullYear());
    if (calculateMonth1 <= 3) {
      this.second_financial_year = (calculateYear1 - 1) + '-' + calculateYear1;
    } else {
      this.second_financial_year = calculateYear1 + '-' + (calculateYear1 + 1);
    }
    if (this.first_financial_year === this.second_financial_year) {
      this.isLoading = true;
      this.cardTitle = 'Actual List';
      const fromMonthYear = this.bsValue.getFullYear() + '-' + ('0' + this.bsValue.getMonth()).slice(-2);
      const toMonthYear = this.bsValue2.getFullYear() + '-' + ('0' + this.bsValue2.getMonth()).slice(-2);

      this.CrudServices.postRequest<any>(actualBudgtedTDS.actual_list, {
        from_month_year: fromMonthYear,
        to_month_year: toMonthYear,
        finacial_year: this.first_financial_year
      }).subscribe((response: TDSResultList) => {
        this.result = response;
        this.isLoading = false;
        this.isCollapsedActual = true;
      });

      //   this.hrServices.actual_list(fromMonthYear, toMonthYear, this.first_financial_year)
      // .subscribe((response: TDSResultList) => {
      //   this.result = response;
      //   this.isLoading = false;
      //   this.isCollapsedActual = true;
      // });


    } else {
      this.toasterService.pop('info', 'Info', 'Duration must be of same financial year');
    }
  }
}
