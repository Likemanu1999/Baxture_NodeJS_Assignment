export interface ReportModel {
  empName: string;
  DetailsMonthYear: DetailsMonthYear;
}

interface DetailsMonthYear {
  MonthDeatils: MonthDeatil[];
  YearDeatils: YearDeatils;
}

interface YearDeatils {
  TotalHours: string;
  totalYearLate: number;
  totalYearEarly: number;
  totalYearHalf: number;
  totalYearAbsent: number;
}

interface MonthDeatil {
  OpeningLevaes: number;
  Late: number;
  Early: number;
  HalfDay: number;
  TotalCutDays: number;
  Absent: number;
  TotalMonth: number;
  TotalAbsent: number;
  Month: number;
  ClosingLeaves: number;
}

export interface ReportModelData extends Array<ReportModel> {}
