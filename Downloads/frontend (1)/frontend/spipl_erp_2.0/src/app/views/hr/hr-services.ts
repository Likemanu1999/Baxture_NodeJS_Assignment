import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LeavesList } from './leaves-master/leaves-model';
import { SalaryResultList } from './salary-calculator/salary-result-model';
import { ReportModelData } from './attendance-report/report-model';
import { TDSResultList } from './tds-cal/tds-result-model';
/**
* Blue print of Staff Members attributes
*/
export interface MemberList {
  id: number;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: number;
  mobile: string;
  job_profile: string;
  company_id: number;
  employee_type_id: number;
  department: string;
  active_status?: number;
}
export interface MemberListData extends Array<MemberList> { }

@Injectable()
export class HrServices {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  /**
  * To get member list.
  */
  getMemberList() {
    return this.http.get<MemberListData>(
      environment.serverUrl + 'api/hr/staffMember/getAll'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }
  /**
  * This method is used to post member data to server.
  */
  addMember(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/hr/addEmployee', formData).pipe(catchError(this.handleError), tap(resData => {
        // const userdata = resData.data;
      }));
  }

  /**
  * This method is used to get member data from backend.
  */
  getMember(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/hr/employee',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      //
    }));
  }
  /**
  * This method is used to post member data to backend for updation.
  */
  updateMember(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/register/update_staff_one', formData).pipe(catchError(this.handleError), tap(resData => {
        // const userdata = resData.data;
      }));
  }
  /**
  * This method is used to delete member from backend.
  */
  deleteMember(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/register/delete_staff_one',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /* Leaves API Call */
  /**
  * This method is used to get all leaves from backend.
  */
  getAllLeaves() {
    return this.http.get<LeavesList>(
      environment.serverUrl + 'api/leaves/get_all_leaves'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }
  /**
  * This method is used to get leaves for perticular user / member from backend.
  */
  getMyLeaves(id: number) {
    return this.http.post<LeavesList>(
      environment.serverUrl + 'api/leaves/get_leaves_one_emp',
      {
        emp_id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get single leave from backend.
  */
  getOneLeaves(id: number) {
    return this.http.post<LeavesList>(
      environment.serverUrl + 'api/leaves/get_one_leave',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to post leave data to backend.
  */
  addLeave(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/leaves/add_leaves', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to post leave data to backend for updation.
  */
  updateLeave(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/leaves/update_status_leave', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to delete leave from backend.
  */
  deleteLeave(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/leaves/delete_leave',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  /**
  * This method is used to post attendance rule to backend.
  */
  addRule(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance_rule/add_attendance_rule', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to update attendance rule.
  */
  updateRule(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance_rule/update_attendance_rule', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to delete attendance rule.
  */
  deleteRule(id: any) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance_rule/delete_attendance_rule', {
      id: id
    }).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get all attendance rules.
  */
  get_all_attendace_rule() {
    return this.http.get<any>(
      environment.serverUrl + 'api/attendance_rule/get_all_attendace_rule'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }
  /**
  * This method is used to get single attendance rule.
  */
  get_one_attendace(id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance_rule/get_one_attendace',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get attendance of staff member for month & year sent.
  */
  get_attendace_all_emp(id, month, year) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance/get_attendace_all_emp',
      {
        id: id,
        month: month,
        year: year
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to update specific attendance record in case of correction.
  */
  update_attendance(id, year, day, status) {
    return this.http.post<any>(
      environment.serverUrl + 'api/attendance/update_attendance',
      {
        staff_id: id,
        currentDate: day,
        status: status,
        currentYear: year
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get specific members salary details.
  */
  get_emp_yearly_ctc(id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/year_ctc/get_emp_yearly_ctc',
      {
        emp_id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  get_one_yearly_ctc(id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/year_ctc/get_one_yearly_ctc',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to post salary details.
  */
  add_yearly_ctc(emp_id, yearly_ctc, basic, da, hra, lta, financial_year, child_edu_allowance, special_allowance, incentive, yearly_pf, yearly_pt, employer_pf) {
    return this.http.post<any>(
      environment.serverUrl + 'api/year_ctc/add_yearly_ctc',
      {
        emp_id: emp_id,
        yearly_ctc: yearly_ctc,
        basic: basic,
        da: da,
        hra: hra,
        lta: lta,
        financial_year: financial_year,
        child_edu_allowance: child_edu_allowance,
        special_allowance: special_allowance,
        incentive: incentive,
        yearly_pf: yearly_pf,
        yearly_pt: yearly_pt,
        employer_pf: employer_pf,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to update salary details.
  */
  update_year_ctc(id, emp_id, yearly_ctc, basic, da, hra, lta, financial_year, child_edu_allowance, special_allowance, incentive, yearly_pf, yearly_pt, employer_pf) {
    return this.http.post<any>(
      environment.serverUrl + 'api/year_ctc/update_year_ctc',
      {
        id: id,
        emp_id: emp_id,
        yearly_ctc: yearly_ctc,
        basic: basic,
        da: da,
        hra: hra,
        lta: lta,
        financial_year: financial_year,
        child_edu_allowance: child_edu_allowance,
        special_allowance: special_allowance,
        incentive: incentive,
        yearly_pf: yearly_pf,
        yearly_pt: yearly_pt,
        employer_pf: employer_pf,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to delete salary details.
  */
  delete_ctc(id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/year_ctc/delete_ctc',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to send Salary Breakup to staff member.
  */
  sendMail(thepdf,
    tomail,
    subject,
    bodytext,
    filename) {
    return this.http.post<any>(
      environment.serverUrl + 'api/hr/salary/salaryBreakUp',
      {
        thepdf: thepdf,
        tomail: tomail,
        subject: subject,
        bodytext: bodytext,
        filename: filename,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get calculated salary details for all staff members.
  */
  get_salary_details(financial_year,
    month,
    year,
    flag) {
    return this.http.post<SalaryResultList | any>(
      environment.serverUrl + 'api/monthly_salary/calculate_salary_attendance',
      {
        financial_year: financial_year,
        month: month,
        year: year,
        flag: flag
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to add more details into salary records like TDS, Incentive after salary calculation for specific month.
  */
  salary_update(object) {
    return this.http.post<SalaryResultList | any>(
      environment.serverUrl + 'api/monthly_salary/salary_update', object)
      .pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to get attendance report of all employees.
  */
  attendanceReport(year: string) {
    return this.http.post<ReportModelData>(
      environment.serverUrl + 'api/attendance/calculate_year_attendance',
      {
        year: year
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to update investment.
  */
  udateInvestment(formData: FormData) {
    return this.http.post<any>(

      //api/budgted_routes/add_update_budgeted_actual_deatils
      environment.serverUrl + 'api/budgted_routes/add_update_budgeted_actual_deatils', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
  }
  /**
  * This method is used to update investment status.
  */
  update_status(flag: number, status: string, year_ctc_id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/budgted_routes/update_status', {
      flag: flag,
      status: status,
      year_ctc_id: year_ctc_id
    }).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get budget TDS Payable report of financial year.
  */
  budgeted_list(financial_year) {
    return this.http.post<TDSResultList>(
      environment.serverUrl + 'api/budgted_routes/budgeted_list', {
      financial_year: financial_year
    }).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  /**
  * This method is used to get actual TDS Payable report  between months & financial year.
  */
  actual_list(from_month_year, to_month_year, finacial_year) {
    return this.http.post<TDSResultList>(
      environment.serverUrl + 'api/budgted_routes/actual_list', {
      from_month_year: from_month_year,
      to_month_year: to_month_year,
      finacial_year: finacial_year,
    }).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
}
