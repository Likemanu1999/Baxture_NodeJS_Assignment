// File Upload
export const FileUpload = {
	getAllFiles: "api/file/list",
	upload: "api/file/upload",
	delete: "api/file/delete",
};

// Login APIs
export const UserLogin = {
	staff_login: "api/login/staff_login"
};

// Country / State / City Master APIs
export const CountryStateCityMaster = {
	getAllCountries: "api/masters/countries/getCountries",
	getAllStates: "api/masters/states/getAllStates",
	getStates: "api/masters/states/getStates",
	getCities: "api/masters/cities/getCities",
	getCountryCities: "api/masters/cities/getCountryCities",
	getAllIndiaCity: "api/masters/cities/get_all_india_city",
};

// Country Master APIs
export const CountryMaster = {
	getAll: "api/masters/countries/getAll",
	getOne: "api/masters/countries/getOne",
	add: "api/masters/countries/add",
	update: "api/masters/countries/update",
	delete: "api/masters/countries/delete"
};

// State Master APIs
export const StateMaster = {
	getAll: "api/masters/states/getAll",
	getOne: "api/masters/states/getOne",
	add: "api/masters/states/add",
	update: "api/masters/states/update",
	delete: "api/masters/states/delete",
	getStateNameStateCode: "api/masters/states/getStateNameStateCode",
};

// City Master APIs
export const CityMaster = {
	getAll: "api/masters/cities/getAll",
	getOne: "api/masters/cities/getOne",
	add: "api/masters/cities/add",
	update: "api/masters/cities/update",
	delete: "api/masters/cities/delete"
};

// Role Master APIs
export const RoleMaster = {
	getAll: "api/masters/role/getAll",
	getOne: "api/masters/role/getOne",
	add: "api/masters/role/add",
	update: "api/masters/role/update",
	delete: "api/masters/role/delete"
};

// Menu Master APIs
export const MenuMaster = {
	getAll: "api/masters/menu/getAll",
	getOne: "api/masters/menu/getOne",
	add: "api/masters/menu/add",
	update: "api/masters/menu/update",
	delete: "api/masters/menu/delete"
};

// Link Master APIs
export const LinkMaster = {
	getAll: "api/masters/link/getAll",
	getOne: "api/masters/link/getOne",
	add: "api/masters/link/add",
	update: "api/masters/link/update",
	delete: "api/masters/link/delete"
};

// Permission APIs
export const Permission = {
	signleCheckUpdate: "api/masters/permission/signleCheckUpdate",
	getOne: "api/masters/permission/getOne",
	signleCheckLinkUpdate: "api/masters/permission/signleCheckLinkUpdate",
	allCheckUpdate: "api/masters/permission/allCheckUpdate",
	superadminDeveloperLinkPermission: "api/masters/permission/superadminDeveloperPermission",
	superadminDeveloperMenuPermission: "api/masters/permission/superadminDeveloperMenuPermission",
};

// Organisation Unit Master APIs
export const OrgUnitMaster = {
	getAll: "api/masters/orgUnit/getAll",
	getOne: "api/masters/orgUnit/getOne",
	add: "api/masters/orgUnit/add",
	update: "api/masters/orgUnit/update",
	delete: "api/masters/orgUnit/delete",
	getUnusedUnits: "api/masters/orgUnit/getUnusedUnits"
};

// Godown Master APIs
export const GodownMaster = {
	getAll: "api/masters/godown/getAll",
	getAllHeadGodown: "api/masters/godown/get_all_head_godown",
	getOne: "api/masters/godown/getOne",
	add: "api/masters/godown/add",
	update: "api/masters/godown/update",
	delete: "api/masters/godown/delete",
	getAllGodownByZone: "api/masters/godown/getAllGodownByZone",
	getMainGodownList: "api/masters/godown/main_godown_list",
	getSubGodowns: "api/masters/godown/getSubGodowns",
	getPorts: "api/masters/godown/getPorts",
	// 
	getAllGodownByUser: "api/masters/godown/getAllGodownByUser",
};

// Port Master APIs
export const PortMaster = {
	getAll: "api/masters/port/getAll",
	getOne: "api/masters/port/getOne",
	add: "api/masters/port/add",
	update: "api/masters/port/update",
	delete: "api/masters/port/delete"
};

// Product Master APIs
export const ProductMaster = {
	getAll: "api/masters/product/getAll",
	getOne: "api/masters/product/getOne",
	add: "api/masters/product/add",
	update: "api/masters/product/update",
	delete: "api/masters/product/delete",
	getOneDataByField: "api/masters/product/getOneDataByField"
};

// Main Grade APIs
export const MainGrade = {
	getAll: "api/masters/mainGrade/getAll",
	getOne: "api/masters/mainGrade/getOne",
	getMutipleMainGrade: "api/masters/mainGrade/get_mutiple_main_grade",
};

// Grade Master APIs
export const GradeMaster = {
	getAll: "api/masters/grade/getAll",
	getOne: "api/masters/grade/getOne",
	add: "api/masters/grade/add",
	update: "api/masters/grade/update",
	delete: "api/masters/grade/delete",
	getCatGrade: "api/masters/grade/getCatGrade",
	getMainGrades: "api/masters/grade/getMainGrades",
	gradeCategory: "api/masters/grade/get_grade_category",
	getManufactureWiseGrade: "api/masters/grade/get_manufacture_wise_grade",
	getGradeAgainstDCA_CS: "api/masters/grade/getGradeAgainstDCA_CS",
	getSurishaGrades: "api/masters/grade/getSurishaGrades",
	getGradePrice: "api/masters/grade/getGradePrice",
};

// Material Load Port Master APIs
export const MaterialLoadPortMaster = {
	getAll: "api/masters/materialLoadPort/getAll",
	getOne: "api/masters/materialLoadPort/getOne",
	add: "api/masters/materialLoadPort/add",
	update: "api/masters/materialLoadPort/update",
	delete: "api/masters/materialLoadPort/delete",
	getOneByType: "api/masters/materialLoadPort/getPayTermPaytype"
};

export const termMaster = {
	getAllData: "api/masters/termMaster/getAll",
	getOne: "api/masters/termMaster/getOne",
	add: "api/masters/termMaster/add",
	update: "api/masters/termMaster/update",
	delete: "api/masters/termMaster/delete"
}

// Payment Term Master APIs
export const PaymentTermMaster = {
	getAll: "api/masters/paymentTerm/getAll",
	getOne: "api/masters/paymentTerm/getOne",
	add: "api/masters/paymentTerm/add",
	update: "api/masters/paymentTerm/update",
	delete: "api/masters/paymentTerm/delete",
	getOneByType: "api/masters/paymentTerm/getPayTermPaytype",
};

// Email Template Master APIs
export const EmailTemplateMaster = {
	getAll: "api/masters/emailTemplate/getAll",
	getOne: "api/masters/emailTemplate/getOne",
	add: "api/masters/emailTemplate/add",
	update: "api/masters/emailTemplate/update",
	delete: "api/masters/emailTemplate/delete"
};
//whatsapp Template Master APIs
export const whatsappTemplateMaster = {
	getAll: "api/masters/whatsappTemplate/getAll",
	getOne: "api/masters/whatsappTemplate/getOneData",
	add: "api/masters/whatsappTemplate/add",
	update: "api/masters/whatsappTemplate/update",
	delete: "api/masters/whatsappTemplate/delete"
};

//Whatsapp Type Template
export const whatsappTypeTemplate = {
	getAll: "api/master/whatsappTypeTemplate/getAll",
	getOne: "api/masters/whatsappTypeTemplate/getOne",
	add: "api/masters/whatsappTypeTemplate/add",
	update: "api/masters/whatsappTypeTemplate/update",
	delete: "api/masters/whatsappTypeTemplate/delete"
};

// SPIPL Bank Master APIs
export const SpiplBankMaster = {
	getAll: "api/masters/spiplBank/getAll",
	getOne: "api/masters/spiplBank/getOne",
	getParticularBanks:"api/masters/spiplBank/getParticularBanks",
	add: "api/masters/spiplBank/add",
	update: "api/masters/spiplBank/update",
	delete: "api/masters/spiplBank/delete",
	bankType: "api/masters/spiplBank/bankType",
	getCompanyBank: "api/masters/spiplBank/getCompanyBank"
};

// Value Store APIs
export const ValueStore = {
	getAll: "api/masters/valueStore/getAll",
	getOne: "api/masters/valueStore/getOne"
};

// Percentage Details APIs
export const PercentageDetails = {
	getAll: "api/masters/percentageDetails/getAll",
	getOne: "api/masters/percentageDetails/getOne",
	getCgstSgstValue: "api/masters/percentageDetails/getCgstSgstValue",
	getGstTaxType: "api/masters/percentageDetails/getGstTaxType",
};

// Job Profile Master APIs
export const JobProfileMaster = {
	getAll: "api/hr/jobProfile/getAll",
	getOne: "api/hr/jobProfile/getOne",
	add: "api/hr/jobProfile/add",
	update: "api/hr/jobProfile/update",
	delete: "api/hr/jobProfile/delete"
};

// Job References APIs
export const JobReferences = {
	getAll: "api/hr/jobReferences/getAll",
	getOne: "api/hr/jobReferences/getOne",
	add: "api/hr/jobReferences/add",
	update: "api/hr/jobReferences/update",
	delete: "api/hr/jobReferences/delete",
	getJobReferencesList: "api/hr/jobReferences/getJobReferencesList"
};

// Holiday Type Master APIs
export const HolidayType = {
	getAll: "api/hr/holiday/getAllData",
	add: "api/hr/holiday/addData",
	update: "api/hr/holiday/updateData",
	delete: "api/hr/holiday/deleteData",
	getActiveHolidays: "api/hr/holiday/getActiveHolidays",
};

// Holiday Type Master APIs
export const newHoliday = {
	getAll: "api/hr/newHoliday/getAllData",
	getOne: "api/hr/newHoliday/getOneData",
	add: "api/hr/newHoliday/addData",
	update: "api/hr/newHoliday/updateData",
	delete: "api/hr/newHoliday/deleteData",
	getCurrentHoliday: "api/hr/newHoliday/getCurrentHoliday",
};

// Department Master APIs
export const DepartmentMaster = {
	getAll: "api/hr/department/getAll",
	getOne: "api/hr/department/getOne",
	add: "api/hr/department/add",
	update: "api/hr/department/update",
	delete: "api/hr/department/delete"
};

// Qualification Master APIs
export const QualificationMaster = {
	getAll: "api/hr/qualification/getAll",
	getOne: "api/hr/qualification/getOne",
	add: "api/hr/qualification/add",
	update: "api/hr/qualification/update",
	delete: "api/hr/qualification/delete"
};

// Staff Member APIs
export const StaffMemberMaster = {
	getAll: "api/hr/staffMember/getAll",
	getAllStaffMembers: "api/hr/staffMember/getAllStaffMembers",
	getAllStaffMembersNew: "api/hr/staffMember/getAllStaffMembersNew",
	getOne: "api/hr/staffMember/getOne",
	add: "api/hr/staffMember/add",
	update: "api/hr/staffMember/update",
	updatePassword: "api/hr/staffMember/updatePassword",
	updateProfilePhoto: "api/hr/staffMember/updateProfilePhoto",
	updateRelievingDate: "api/hr/staffMember/updateRelievingDate",
	delete: "api/hr/staffMember/delete",
	getMarketingPersons: "api/hr/staffMember/getMarketingPersons",
	getMarketingPersonsNew: "api/hr/staffMember/getMarketingPersonsNew",
	getMarketingPersonsArr: "api/hr/staffMember/getMarketingPersonsArr",
	checkEmailPresent: "api/hr/staffMember/checkEmailPresent",
	checkMachinIdPresent: "api/hr/staffMember/checkMachinIdPresent",
	getSalaryBank: "api/hr/staffMember/getSalaryBank",
	getFcmById: "api/hr/staffMember/getFcmById",
	getEmailZoneCustomers: "api/hr/staffMember/getEmailZoneCustomers",
	sendMail: "api/hr/staffMember/sendMailCustomers",
	getLocalPurchaseZone: "api/hr/staffMember/getLocalPurchaseZone",
};

// Staff Documents APIs
export const StaffDocuments = {
	getAll: "api/hr/staffDocuments/getAll",
	getOne: "api/hr/staffDocuments/getOne",
	getStaffDocs: "api/hr/staffDocuments/getStaffDocs",
	add: "api/hr/staffDocuments/add",
	update: "api/hr/staffDocuments/update",
	delete: "api/hr/staffDocuments/delete",
	deleteStaffDocs: "api/hr/staffDocuments/deleteStaffDocs"
};

// Staff Document Type Master APIs
export const StaffDocumentsTypes = {
	getAll: "api/masters/staffDocumentsTypes/getAll",
	getOne: "api/masters/staffDocumentsTypes/getOne",
	add: "api/masters/staffDocumentsTypes/add",
	update: "api/masters/staffDocumentsTypes/update",
	delete: "api/masters/staffDocumentsTypes/delete"
};

// Staff Document Type Master APIs
export const salesDocumentsTypes = {
	getAll: "api/masters/salesDocumentsTypes/getAll",
	getOne: "api/masters/salesDocumentsTypes/getOne",
	add: "api/masters/salesDocumentsTypes/add",
	update: "api/masters/salesDocumentsTypes/update",
	delete: "api/masters/salesDocumentsTypes/delete"
};

export const dealOffer = {
	getAll: 'api/sales/dealOffer/getAllRows',
	add: 'api/sales/dealOffer/add',
	update: 'api/sales/dealOffer/updateRow',
	delete: 'api/sales/dealOffer/delete',
	getDealLauncherData: 'api/sales/dealOffer/getDealLauncherData'
};

export const salesPurchaseLinking = {
	getAll: "api/sales/salesPurchaseLinking/getAll",
	getOne: "api/sales/salesPurchaseLinking/getOne",
	add: "api/sales/salesPurchaseLinking/add",
	update: "api/sales/salesPurchaseLinking/update",
	delete: "api/sales/salesPurchaseLinking/delete",
	getPendingList: "api/sales/salesPurchaseLinking/getPendingList",
	getSupplierWisePurchaseSalesPendingList: "api/sales/salesPurchaseLinking/getSupplierWisePurchaseSalesPendingList",
	getPurchaseSalesLinkedList: "api/sales/salesPurchaseLinking/getPurchaseSalesLinkedList",
	getLinkDataAgainstPi: "api/sales/salesPurchaseLinking/getLinkDataAgainstPi",
};

// Policy Type Master APIs
export const PolicyTypeMaster = {
	getAll: "api/masters/policyTypeMaster/getAll",
	getOne: "api/masters/policyTypeMaster/getOne",
	add: "api/masters/policyTypeMaster/add",
	update: "api/masters/policyTypeMaster/update",
	delete: "api/masters/policyTypeMaster/delete"
};

// Policy Master APIs
export const PolicyMaster = {
	getPolicyMasterList: "api/payables/policyMaster/getPolicyMasterList",
	add: "api/payables/policyMaster/add",
	update: "api/payables/policyMaster/update",
	delete: "api/payables/policyMaster/delete"
};

// Policy Claims APIs
export const PolicyClaims = {
	getPolicyClaimsList: "api/payables/policyClaims/getPolicyClaimsList",
	add: "api/payables/policyClaims/add",
	update: "api/payables/policyClaims/update",
	delete: "api/payables/policyClaims/delete"
};

// Policy Attachments APIs
export const PolicyAttachments = {
	getPolicyAttachmentsList: "api/payables/policyAttachments/getPolicyAttachmentsList",
	add: "api/payables/policyAttachments/add",
	delete: "api/payables/policyAttachments/delete"
};

// Policy Details APIs
export const PolicyDetails = {
	getPolicyDetailsList: "api/payables/policyDetails/getPolicyDetailsList",
	add: "api/payables/policyDetails/add",
	update: "api/payables/policyDetails/update",
	delete: "api/payables/policyDetails/delete"
};

// Property Master APIs
export const PropertyMaster = {
	getPropertyMasterList: "api/payables/propertyMaster/getPropertyMasterList",
	add: "api/payables/propertyMaster/add",
	update: "api/payables/propertyMaster/update",
	delete: "api/payables/propertyMaster/delete"
};

// Rent Master APIs
export const RentMaster = {
	getRentMasterList: "api/payables/rentMaster/getRentMasterList",
	add: "api/payables/rentMaster/add",
	update: "api/payables/rentMaster/update",
	delete: "api/payables/rentMaster/delete"
};

export const BankStatus = {
	getData: "api/middleware/payables/getBankStatusData"
}

// Leaves APIs
export const Leaves = {
	getAll: "api/hr/leaves/getAll",
	getOne: "api/hr/leaves/getOne",
	add: "api/hr/leaves/add",
	update: "api/hr/leaves/update",
	delete: "api/hr/leaves/delete",
	calculateLeaves: "api/hr/leaves/calculateLeaves",
	getOneLeave: "api/hr/leaves/getOneLeave",
	updateLeave: "api/hr/leaves/updateLeave",
	getEmployeeLeave: "api/hr/leaves/getEmployeeLeave",
	getAllLeaves: "api/hr/leaves/getAllLeaves"

};

// Attendance Rule APIs
export const AttendanceRule = {
	getAll: "api/hr/attendanceRules/getAll",
	getOne: "api/hr/attendanceRules/getOne",
	add: "api/hr/attendanceRules/add",
	update: "api/hr/attendanceRules/update",
	delete: "api/hr/attendanceRules/delete"
};

// Attendance APIs
export const Attendance = {
	getOne: "api/hr/attendance/getOne",
	updateAttendanceNew: "api/hr/attendance/updateAttendanceNew",
	getEmpMonthStatus: "api/hr/attendance/getEmpMonthStatus",
	getMonthlyReport: "api/hr/attendance/getMonthlyReport",
};


// Attendance Calculate APIs
export const CalculateAttendance = {
	getAttendanceAllEmp: "api/hr/calculate_attendance/getAttendanceAllEmp",
	updateAttendance: "api/hr/calculate_attendance/updateAttendance",
	calculateYearlyAttendance: "api/hr/calculate_attendance/calculateYearlyAttendance",
	updatespecificDtAttendance: "api/hr/calculate_attendance/updatespecificDtAttendance",
	getMonthlyReport: "api/hr/calculate_attendance/getMonthlyReport",
	getYearlyReport: "api/hr/calculate_attendance/getYearlyReport"
};

// Investment APIs
export const Investment = {
	getIncomeTaxSections: "api/hr/investment/getIncomeTaxSections",
	getInvestmentType: "api/hr/investment/getInvestmentType",
	getEmpAnnualInvestments: "api/hr/investment/getEmpAnnualInvestments",
	getAllEmpTDS: "api/hr/investment/getAllEmpTDS",
	getEmpTDSDetails: "api/hr/investment/getEmpTDSDetails",
	updateInvestmentStatus: "api/hr/investment/updateInvestmentStatus",
	updateEmpMonthlyAnnuallyTDS: "api/hr/investment/updateEmpMonthlyAnnuallyTDS",
	updateTDSDate: "api/hr/investment/updateTDSDate",
	add: "api/hr/investment/add",
	update: "api/hr/investment/update",
	delete: "api/hr/investment/delete"
};

// Employee Form 16 APIs
export const EmployeeForm16 = {
	getEmployeesForm16: "api/hr/employeeForm16/getEmployeesForm16",
	getEmployeeForm16: "api/hr/employeeForm16/getEmployeeForm16",
	add: "api/hr/employeeForm16/add",
	update: "api/hr/employeeForm16/update",
	delete: "api/hr/employeeForm16/delete",
	sendMail: "api/hr/employeeForm16/sendMail",
};


// User Activity
export const UserActivity = {
	getAll: "api/analytics/userActivity/getAll",
}

// // Organization Category Master APIs
// export const OrganizationCategoryMaster = {
// 	getAll: "api/masters/orgCategoryMaster/getAll",
// 	getOne: "api/masters/orgCategoryMaster/getOne",
// 	add: "api/masters/orgCategoryMaster/add",
// 	update: "api/masters/orgCategoryMaster/update",
// 	delete: "api/masters/orgCategoryMaster/delete"
// };

// Organization Category APIs
export const OrganizationCategory = {
	getAll: "api/organization/getAllOrgCategory",
	getOne: "api/organization/getOneOrgCategory",
	add: "api/organization/addOrgCategory",
	update: "api/organization/updateOrgCategory",
	delete: "api/organization/deleteOrgCategory"
};

export const productsTagsMaster = {
	getAll: "api/organization/getAllProductsTags",

};

// Main Organization APIs
export const MainOrg = {
	add: "api/organization/addMainOrg",
	getAll: "api/organization/getAllMainOrg",
	getOne: "api/organization/getOneMainOrg",
	getOneData: "api/organization/getOneData",
	update: "api/organization/updateMainOrg",
	delete: "api/organization/deleteMainOrg",
	addNewCustomer: "api/organization/addNewCustomer",
	getCompanyOrg: "api/organization/getCompanyOrg",
	getGrdaeAgainstManufacture: "api/organization/get_grade_against_manu",
	getManufactureSupplyDestination: "api/organization/get_suppply_destination",
	getAllPetrochemicalManutacture: "api/organization/get_all_petro_manu",
	copyAllOrgData: "api/organization/copyAllOrgData",
};

// Sub Organization APIs
export const SubOrg = {
	getTransporter: "api/organization/getTransportMasters",
	getCustomer: "api/organization/getCustomer",
	getCustomerContactData: "api/organization/getCustomerContactData",
	getCustomers: "api/organization/getCustomers",
	getCategoryCustomers: "api/organization/getCategoryCustomers",
	getCategoryCustomer: "api/organization/getCategoryCustomer",
	getCustomerPaymentTerms: "api/organization/getCustomerPaymentTerms",
	get_suborg_agst_main: "api/organization/getSubOrgAgainstMain",
	get_sub_org: "api/organization/getSubOrgList",
	get_all_foreign_supplier: "api/organization/get_all_foreign_supplier",
	get_all_supplier: "api/organization/getAllSupplier",
	getSubOrgByCategory: "api/organization/getSubOrgByCategory",
	getGroupCustomers: "api/organization/getGroupCustomers",
	getGroupCustomer: "api/organization/getGroupCustomer",
	get_one_sub_org: "api/organization/getOneSubOrganization",
	get_supplier_perticular_zone: "api/organization/getSupplierOfPurchaseAccHolder",
	add_sub_org: "api/organization/addSubOrg",
	copy_org_contact: "api/organization/copyOrgContact",
	update_sub_org: "api/organization/updateSubOrganization",
	delete_sub_org: "api/organization/deleteSubOrganization",
	blockSubOrg: "api/organization/blockSubOrg",
	addExtraPayment: "api/organization/addExtraPayment",
	addExtraAdvancePayment: "api/organization/addExtraAdvancePayment",
	groupOutStandingReport: "api/organization/groupOutStandingReport",
	getTDSTCSRate: "api/organization/getTDSTCSRate",
	getCancelOrderCount: 'api/organization/getCancelOrderCount',
	updateSalesAcc: 'api/organization/update_sales_acc',
	updateTradeManu: 'api/organization/update_trader_manufacture',
	getSubOrgListNew: 'api/organization/getSubOrgListNew',
	getDistinctCustomers: "api/organization/getDistinctCustomers",
	updateExtrapayment: "api/organization/updateExtrapayment",
	getExtrapayment: "api/organization/getExtrapayment",
	virtualAccExist: 'api/organization/virtualAccExist',
	tdstcsDeclaration: 'api/organization/tdstcsDeclaration',
	getSubOrgByContactEmail: 'api/organization/getSubOrgByContactEmail',
	updateAdvanceLCAmount: "api/organization/updateAdvanceLCAmount",
	getAdvanceLCAmount: "api/organization/getAdvanceLCAmount",
	getCustomersOnly: "api/organization/getCustomersOnly",
	addCustomer: "api/organization/add_customer",
	getPetrochemicalManufacture: "api/organization/get_petrochem_manufacture",
	getManufacturerWiseGrade: "api/organization/get_manufaturer_wise_grade",
	getDCACSList: "api/organization/get_dca_cs_list",
	getDCACSAgainstSuborg: "api/organization/get_dca_cs_agianst_sub_org",
	addDcaCsAgainstSuborg: "api/organization/add_dca_cs_against_sub_org",
	deleteDcaCsLink: "api/organization/delete_dca_cs_link",
	getManufacturerSsurisha: "api/organization/getManufacturerSsurisha",
	addBcdPercentage: "api/organization/addBcdPercentage",
	getadvancedPaymentCustomers: "api/organization/getadvancedPaymentCustomers",
	updateOrg: "api/organization/updateOrg",
	addContactPerson: "api/organization/addContactPerson",
	updateContactPersonNew: "api/organization/updateContactPersonNew",
	updateContactNumber: "api/organization/updateContactNumber",
	deleteContactNumber: "api/organization/deleteContactNumber",
	updateContactEmail: "api/organization/updateContactEmail",
	deleteContactEmail: "api/organization/deleteContactEmail",
	updateOrgBankNew: "api/organization/updateOrgBankNew",
	deleteOrgBankNew: "api/organization/deleteOrgBankNew",
	getSingleSubOrg: "api/organization/getSingleSubOrg",
	getSuppliers: "api/organization/getSuppliers",
	getDivisionData: "api/organization/getDivisionData",
	getPriceProtectionOrgList: "api/organization/getPriceProtectionOrgList",
	getRentMasterPayment: "api/payables/getRentMasterPayment",
	getOrgContactsList: "api/organization/getOrgContactsList",
	virtualAccUpdateWhatsapp: "api/whatsapp/send",
	subOrgFileUpload: "api/organization/subOrgFileUpload",
	getsubOrgFile: "api/organization/getsubOrgFile",
	getAllCountries: "api/organization/get_all_Country"

};

// Organization Bank APIs
export const OrganizationBank = {
	add_org_bank: "api/org_bank/add_org_bank",
	update_org_bank: "api/org_bank/update_org_bank",
	get_perticular_org_bank: "api/org_bank/get_perticular_org_bank",
	get_all_org_bank: "api/org_bank/get_all_org_bank",
	get_one_org_bank: "api/org_bank/get_one_org_bank",
	delete_org_bank: "api/org_bank/delete_org_bank",
};

// Organisation Contact Person APIs
export const MainContact = {
	add_org_contact_person: "api/organization/addOrgContactPerson",
	update_org_contact_person: "api/organization/updateContactPerson",
	get_org_contact_person: "api/organization/getAllOrgContactPerson",
	get_one_org_contact_person: "api/organization/getOneOrgContactPerson",
	delete_org_contact_person: "api/organization/deleteContactPerson",
	get_org_contact_person_by_suborg: "api/organization/getContactPersonAgnOrg",
	getContactPersonMainOrg: "api/organization/getContactPersonMainOrg",
	getOrgContactPerson: "api/organization/getOrgContactPerson",
	addEmailAgainstContactPerson: "api/organization/addEmailAgainstContactPerson",
	addContactNumberAgainstContactPerson: "api/organization/addContactNumberAgainstContactPerson",
};

// Organisation Contact Number APIs
export const OrganizationContact = {
	add_org_contact_num: "api/org_contact_num/add_org_contact_num",
	update_org_contact_num: "api/org_contact_num/update_org_contact_num",
	get_per_org_contact_num: "api/org_contact_num/get_per_org_contact_num",
	get_one_org_contact_num: "api/org_contact_num/get_one_org_contact_num",
	delete_org_contact_num: "api/org_contact_num/delete_org_contact_num",
};


export const orgContactPerson = {
	addOrgContactPersonBySalesOrPurchase: 'api/organization/addOrgContactPersonBySalesOrPurchase',
	addDefaultContact: 'api/organization/addDefaultContact'
}

// Expense Category Master APIs
export const ExpenseCategoryMaster = {
	getAll: "api/expense/expenseCategory/getAll",
	getOne: "api/expense/expenseCategory/getOne",
	add: "api/expense/expenseCategory/add",
	update: "api/expense/expenseCategory/update",
	delete: "api/expense/expenseCategory/delete"
};

// Expense Master APIs
export const ExpenseMaster = {
	getAll: "api/expense/expense/getAll",
	getOne: "api/expense/expense/getOne",
	add: "api/expense/expense/add",
	update: "api/expense/expense/update",
	delete: "api/expense/expense/delete",
	updateRefund: "api/expense/expense/updateRefund",
	updateReimburse: "api/expense/expense/updateReimburse",
	updateStatus: "api/expense/expense/updateStatus",
	getTripWiseExpense: "api/expense/expense/getTripWiseExpense",
	getEmployeeWisedExpense: "api/expense/expense/getEmployeeWisedExpense"
};

// Trip Master APIs
export const TripMaster = {
	getAll: "api/expense/trip/getAll",
	getOne: "api/expense/trip/getOne",
	add: "api/expense/trip/add",
	update: "api/expense/trip/update",
	delete: "api/expense/trip/delete"
};

// Stock Transfer APIs
export const StockTransfer = {
	add: "api/sales/stockTransfer/add",
	getAll: "api/sales/stockTransfer/list",
	update: "api/sales/stockTransfer/update",
	sendEmail: 'api/sales/stockTransfer/sendEmail',
	emailTempletes: 'api/masters/getAllEmailTemplate',
	updateStockTransfer: 'api/sales/stockTransfer/updateStockTransfer',
	invoiceAdd: 'api/sales/stockTransfer/invoiceAdd',
	materialRecieved: 'api/sales/stockTransfer/materialRecieved',
	deleteStock: 'api/sales/stockTransfer/deleteStock',
	stockReturn: 'api/sales/stockTransfer/stockReturn',
	debitCreaditNoteAdd: 'api/sales/stockTransfer/debitCreaditNoteAdd',
	updateBillStatus: 'api/sales/stockTransfer/updateBillStatus'
	// delete: "api/sales/stockTransfer/delete"
}

// Daily Stock Allocation APIs
export const DailyStockAllocation = {
	add: "api/sales/dailystockallocation/add",
	getAll: "api/sales/dailystockallocation/getAll",
	getOne: "api/sales/dailystockallocation/getOne",
	update: "api/sales/dailystockallocation/update",
	delete: "api/sales/dailystockallocation/delete"
}

// Transnational Sales APIs
export const TransnationalSales = {
	add: "api/sales/transnationalSales/add",
	update: "api/sales/transnationalSales/update",
	delete: "api/sales/transnationalSales/delete",
	getOne: "api/sales/transnationalSales/getOne",
	getTransnationalSalesOrders: "api/sales/transnationalSales/getTransnationalSalesOrders",
	updateTransnationalSalesOrders: "api/sales/transnationalSales/updateTransnationalSalesOrders",
	addDataLC: "api/sales/transnationalSales/addDataLC",
	getDataLC: "api/sales/transnationalSales/getDataLC",
	updateDataLC: "api/sales/transnationalSales/updateDataLC",
	addDataNON: "api/sales/transnationalSales/addDataNON",
	getDataNon: "api/sales/transnationalSales/getDataNon",
	updateNonData: "api/sales/transnationalSales/updateNonData",
	updateSwiftDet: "api/sales/transnationalSales/updateSwiftDet",
}

// Import Sales APIs
export const ImportSales = {
	add: "api/sales/importSales/add",
	update: "api/sales/importSales/update",
	delete: "api/sales/importSales/delete",
	getOne: "api/sales/importSales/getOne",
	getImportSalesOrders: "api/sales/importSales/getImportSalesOrders",
	dealCompletionMail: "api/sales/importSales/dealCompletionMail"
}

// High Seas Orders APIs
export const HighSeasOrders = {
	add: "api/sales/highSeasOrders/add",
	update: "api/sales/highSeasOrders/update",
	delete: "api/sales/highSeasOrders/delete",
	getOne: "api/sales/highSeasOrders/getOne",
	getHighSeasOrders: "api/sales/highSeasOrders/getHighSeasOrders",
	getBlList: "api/sales/highSeasOrders/getBlList",
	updateHighSeasInvoice: "api/sales/highSeasOrders/updateHighSeasInvoice"
}

// Sales Orders APIs
export const SalesOrders = {
	add: "api/sales/salesOrders/add",
	update: "api/sales/salesOrders/update",
	updateStatus: "api/sales/salesOrders/updateStatus",
	delete: "api/sales/salesOrders/delete",
	getOne: "api/sales/salesOrders/getOne",
	getSalesOrders: "api/sales/salesOrders/getSalesOrders",
	getForwardSalesOrders: "api/sales/salesOrders/getForwardSalesOrders",
	getSalesOrder: "api/sales/salesOrders/getSalesOrder",
	getSalesOrderDispatch: "api/sales/salesOrders/getSalesOrderDispatch",
	updatePaymentReverse: "api/sales/salesOrders/updatePaymentReverse",
	updatePiStatus: "api/sales/salesOrders/updatePiStatus",
	reverseExtraAmount: "api/sales/salesOrders/reverseExtraAmount",
	updateVirtualAccountNumber: "api/sales/salesOrders/updateVirtualAccountNumber",
	getOrgPendingOrders: "api/sales/salesOrders/getOrgPendingOrders",
	adjustSuspenseAmountFromInvoice: "api/sales/salesOrders/adjustSuspenseAmountFromInvoice",
	updateSuspenseInvoiceStatus: "api/sales/salesOrders/updateSuspenseInvoiceStatus",
	getSuspenseAmountList: "api/sales/salesOrders/getSuspenseAmountList",
	adjustSuspenseAmountFromMiddleware: "api/sales/salesOrders/adjustSuspenseAmountFromMiddleware",
	adjustSuspenseAmount: "api/sales/salesOrders/adjustSuspenseAmount",
	adjustSuspenseAmountAgainstDeal: "api/sales/salesOrders/adjustSuspenseAmountAgainstDeal",
	updateLcAdvancePayment: "api/sales/salesOrders/updateLcAdvancePayment",
	getTestData: "api/sales/salesOrders/getTestData",
	updateCreditAmount: "api/sales/salesOrders/updateCreditAmount",
	addData: "api/sales/salesOrderPaymentTracking/addData",
	advancePayment: "api/sales/salesOrderPaymentTracking/advancePayment",
	balancePayment: "api/sales/salesOrderPaymentTracking/balancePayment",
	getAdvancePayments: "api/sales/salesOrderPaymentTracking/getSalesOrders",
	getAdvanceSalesOrders: "api/sales/salesOrderPaymentTracking/getAdvanceSalesOrders",
	getActiveDispatchPayments: "api/sales/salesOrderPaymentTracking/getActiveDispatchPayments",
	getSalesOrdersByVirtualId: "api/sales/salesOrders/getSalesOrdersByVirtualId",
	adjustSuspenseAmountAgainstInvoice: "api/sales/salesOrders/adjustSuspenseAmountAgainstInvoice"
}

// Finance APIs
export const Finance = {
	add: "api/sales/finance/add",
	cancel: "api/sales/finance/cancel",
	update: "api/sales/finance/update",
	delete: "api/sales/finance/delete",
	getOne: "api/sales/finance/getOne",
	gradeRequestStatus: "api/sales/finance/gradeRequestStatus",
	categoryRequestStatus: "api/sales/finance/categoryRequestStatus",
	getSalesOrders: "api/sales/finance/getSalesOrders",
	getFinancePlan: "api/sales/finance/getFinancePlan",
	getFinancePlannings: "api/sales/finance/getFinancePlannings",
	getUndispatchedData: "api/sales/finance/getUndispatchedData",
	getUtilizedAdhocLimit: "api/sales/finance/getUtilizedAdhocLimit",
	getUtilizedOverdueLimit: "api/sales/finance/getUtilizedOverdueLimit",
	getDueDetails: "api/sales/finance/getDueDetails",
	getLastDispatchDate: "api/sales/finance/getLastDispatchDate",
}

// Dispatch New APIs 
export const DispatchNew = {
	add: "api/sales/dispatchNew/add",
	update: "api/sales/dispatchNew/update",
	delete: "api/sales/dispatchNew/delete",
	getOne: "api/sales/dispatchNew/getOne",
	getSalesUtility: "api/sales/dispatchNew/getSalesUtility",
	updateStatus: "api/sales/dispatchNew/updateStatus",
	getPendingDispatches: "api/sales/dispatchNew/getPendingDispatches",
	getPendingDispatchesFinance: "api/sales/dispatchNew/getPendingDispatchesFinance",
	getPendingDispatchesNew: "api/sales/dispatchNew/getPendingDispatchesNew",
	getConfirmDispatches: "api/sales/dispatchNew/getConfirmDispatches",
	getDisptachFromAddress: "api/sales/dispatchNew/getDisptachFromAddress",
	getShipToAddress: "api/sales/dispatchNew/getShipToAddress",
	updatePaymentType: "api/sales/dispatchNew/updatePaymentType",
	getPiSalesInvoice: "api/sales/dispatchNew/getPiSalesInvoice",
	updatePiStatus: "api/sales/dispatchNew/updatePiStatus",
	updateTruckImage: "api/sales/dispatchNew/updateTruckImage",
	updateFreight: "api/sales/dispatchNew/updateFreight",
	approveFreight: "api/sales/dispatchNew/approveFreight",
	updatePod: "api/sales/dispatchNew/updatePod",
	updateLr: "api/sales/dispatchNew/updateLr",
	lrReceivedRequest: "api/sales/dispatchNew/lrReceivedRequest",
	getDispatchesByVirtualId: "api/sales/dispatchNew/getDispatchesByVirtualId"
}

// Freight Tracking APIs
export const FreightTracking = {
	add: "api/sales/freightTracking/addFreight",
	update: "api/sales/freightTracking/updateFreight",
	getFreightRecords: "api/sales/freightTracking/getFreightRecords",
}

///salesActivityTracking/getOne
export const SalesActivityTracking = {
	getSalesActivityTracking: "api/sales/salesActivityTracking/getOne",
	getCancelOrders: "api/sales/salesActivityTracking/getCancelOrders",
	getExtendedOrders: "api/sales/salesActivityTracking/getExtendedOrders",
	getDispatchPayments: "api/sales/salesActivityTracking/getDispatchPayments",
	getFinancePlanning: "api/sales/salesActivityTracking/getFinancePlanning"
}

// Dispatch Billing APIs
export const DispatchBilling = {
	add: "api/sales/billing/add",
	update: "api/sales/billing/update",
	delete: "api/sales/billing/delete",
	getOne: "api/sales/billing/getOne",
	getUnbilledDispatches: "api/sales/billing/getUnbilledDispatches",
	addTranporterBill: "api/sales/billing/addTranporterBill",
	updateBilligFlag: "api/sales/billing/updateBilligFlag",
	getDispatchDetails: "api/sales/billing/getDispatchDetails",
}

// Dispatch Acknowledgment APIs
export const DispatchAcknowledgment = {
	update: "api/sales/acknowledgment/update",
	getOne: "api/sales/acknowledgment/getOne",
	getUnbilledDispatches: "api/sales/acknowledgment/getUnbilledDispatches"
}

// Dispatch Payments APIs
export const DispatchPayments = {
	add: "api/sales/payments/add",
	update: "api/sales/payments/update",
	delete: "api/sales/payments/delete",
	getOne: "api/sales/payments/getOne",
	getDispatchPayments: "api/sales/payments/getDispatchPayments",
	getMiddlewarePayments: "api/sales/dispatch/getMiddlewarePayments",
	getDistinctCustomersFromDispatchPayment: "api/sales/payments/getDistinctCustomersFromDispatchPayment",
	getDispatchPaymentsBySuborg: "api/sales/payments/getDispatchPaymentsBySuborg",
	getOneDispatchPayment: "api/sales/payments/getOneDispatchPayment",
}

export const SalesUtility = {
	add: "api/sales/salesUtility/add",
	getOne: "api/sales/salesUtility/getOne"
}

// Sales Return APIs
export const SalesReturn = {
	add: "api/sales/salesReturn/add",
	update: "api/sales/salesReturn/update",
	delete: "api/sales/salesReturn/delete",
	getOne: "api/sales/salesReturn/getOne",
	getSalesReturns: "api/sales/salesReturn/getSalesReturns",
	addCreditNote: "api/sales/salesReturn/addCreditNote"
}

// Short & Damage APIs
export const ShortDamage = {
	add: "api/sales/shortDamage/add",
	update: "api/sales/shortDamage/update",
	delete: "api/sales/shortDamage/delete",
	getOne: "api/sales/shortDamage/getOne",
	getShortDamage: "api/sales/shortDamage/getShortDamage",
	getShortDamageListNew: "api/sales/shortDamage/getShortDamageListNew",
	getShortDamageList: "api/sales/shortDamage/getShortDamageList",
	updateDebitCreditNoteNo: "api/sales/shortDamage/updateDebitCreditNoteNo"
}

// Commission APIs
export const Commission = {
	add: "api/sales/commission/add",
	update: "api/sales/commission/update",
	delete: "api/sales/commission/delete",
	getOne: "api/sales/commission/getOne",
	getCommissionList: "api/sales/commission/getCommissionList"
}

// Middleware Payment APIs
export const MiddlewarePayments = {
	add: "api/middleware/payments/add",
	addPayment: "api/middleware/payments/addPayment",
	getAll: "api/middleware/payments/getAll",
	getOne: "api/middleware/payments/getOne",
	update: "api/middleware/payments/update",
	delete: "api/middleware/payments/delete",
	getPaymentDetails: "api/middleware/payments/getPaymentDetails"
};

// Sales Reports New APIs
export const SalesReportsNew = {
	getGroupOutstandingReport: "api/sales/reports/getGroupOutstandingReport",
	getGroupOutstandingReportBycategory: "api/sales/reports/getGroupOutstandingReportBycategory",
	getCreditLimitReport: "api/sales/reports/getCreditLimitReport",
	getPartyWiseOutstandingReport: "api/sales/reports/getPartyWiseOutstandingReport",
	getMiddlewarePaymentDetails: "api/sales/reports/getMiddlewarePaymentDetails",
	moveAmountImportLocal: "api/sales/reports/moveAmountImportLocal",
	splitMPUAmount: "api/sales/reports/splitMPUAmount",
	getDispatchReport: "api/sales/reports/getDispatchReport",
	getPaymentTransfer: "api/sales/reports/getPaymentTransfer",
	getDiscountReport: "api/sales/reports/getDiscountReport",
	updateDiscountStatus: "api/sales/reports/updateDiscountStatus",
	getPriceProtectionReport: "api/sales/reports/getPriceProtectionReport",
	salesRegisterReport: "api/sales/reports/salesRegisterReport",
	purchaseRegisterReport: "api/sales/reports/purchaseRegisterReport",
	//FreightAccountingReport:"api/sales/reports/freightAccountingReport",
	freightStockTransferRegisterReport: "api/sales/reports/freightStockTransferRegisterReport",
	frieghtInwardRegisterReport: "api/sales/reports/freightInwardRegisterReport",
	frieghtOutwardRegisterReport: "api/sales/reports/freightOutwardRegisterReport",
	freightInwardReportUpdate: 'api/sales/reports/freightInwardReportUpdate',
	freightOutwardReportUpdate: 'api/sales/reports/freightOutwardReportUpdate',
	dispatchTransportersList: 'api/sales/reports/dispatchTransportersList',
	knockOffOrdersList: 'api/sales/reports/knockOffOrdersList',
	getLoadCrossType: 'api/sales/freightTracking/getLoadCrossType',
	getApprovalStatus: 'api/sales/freightTracking/getApprovalStatus',
	getSubOrgsByMainOrg: 'api/sales/reports/getSubOrgsByMainOrg',
	updateSubOrgInMPU: 'api/sales/reports/updateSubOrgInMPU'
}

// SALES AVERAGE REPORT NEW
export const SalesAverageReportNew = {
	getZoneWiseAverage: "api/sales/salesAverageReportNew/getZoneWiseAverage",
	getStateWiseAverage: "api/sales/salesAverageReportNew/getStateWiseAverage",
	getMainGradeWiseAverage: "api/sales/salesAverageReportNew/getMainGradeWiseAverage",
	getGradeWiseAverage: "api/sales/salesAverageReportNew/getGradeWiseAverage",
	getCustomerWiseAverage: "api/sales/salesAverageReportNew/getCustomerWiseAverage"
}


// REPORT REMARK
export const ReportRemark = {
	reportRemarkAdd: "api/sales/reportRemark/addRemark",
	getOneReportRemark: "api/sales/reportRemark/getOneReportRemark",
	reportRemarkUpdate: "api/sales/reportRemark/reportRemarkUpdate"
}

// Sales Load/Cross Reports APIs
export const SalesLoadCrossReports = {
	getFinancialYears: "api/sales/loadCross/getFinancialYears",
	getApprovalDates: "api/sales/loadCross/getApprovalDates",
	getVerifyReport: "api/sales/loadCross/getVerifyReport",
	verifyReport: "api/sales/loadCross/verifyReport",
	getGodownDetails: "api/sales/loadCross/getGodownDetails",
	getPaymentReport: "api/sales/loadCross/getPaymentReport",
	getConfirmedCharges: "api/sales/loadCross/getConfirmedCharges",
	addOtherConfirmedCharges: "api/sales/loadCross/addOtherConfirmedCharges",
	updateOtherConfirmedCharges: "api/sales/loadCross/updateOtherConfirmedCharges",
	getPaymentDetails: "api/sales/loadCross/getPaymentDetails",
	deleteConfirmedCharges: "api/sales/loadCross/deleteConfirmedCharges"
};

// Black List New APIs
export const BlackListNew = {
	getBlackListCustomers: "api/sales/blackList/getBlackListCustomers",
	update: "api/sales/blackList/update"
};

// Dashboard New APIs
export const DashboardNew = {
	getTotalOrdersData: "api/dashboard/dashboard/getTotalOrdersData",
	getTotalDispatchData: "api/dashboard/dashboard/getTotalDispatchData",
	getTotalOutstanding: "api/dashboard/dashboard/getTotalOutstanding",
	getTotalPaymentDue: "api/dashboard/dashboard/getTotalPaymentDue",
	getZoneWiseData: "api/dashboard/dashboard/getZoneWiseData",
	getStateWiseData: "api/dashboard/dashboard/getStateWiseData",
	getProductWiseData: "api/dashboard/dashboard/getProductWiseData",
	getGradeWiseData: "api/dashboard/dashboard/getGradeWiseData",
	getTopTenBuyersData: "api/dashboard/dashboard/getTopTenBuyersData",
	getInactiveBuyersList: "api/dashboard/dashboard/getInactiveBuyersList",
	getAutoCancelOrdersCount: "api/dashboard/dashboard/getAutoCancelOrdersCount",
	getBlacklistBuyersList: "api/dashboard/dashboard/getBlacklistBuyersList"
};

// Dashboard APIs
export const Dashboard = {
	getDashboardGradeWiseAvg: "api/sales/dashboard/getDashboardGradeWiseAvg",
	getDashboardInActiveUser: "api/sales/dashboard/getDashboardInActiveUser",
	getDashboardMainGradeWiseAvg: "api/sales/dashboard/getDashboardMainGradeWiseAvg",
	getDashboardZoneWiseAvg: "api/sales/dashboard/getDashboardZoneWiseAvg",
	getDashboardStateWiseAvg: "api/sales/dashboard/getDashboardStateWiseAvg",
	getDashboardTopTenParty: "api/sales/dashboard/getDashboardTopTenParty",
	getDashboardCustomerWiseAvg: "api/sales/dashboard/getDashboardCustomerWiseAvg",
	getDashboardCustomerWiseTrends: "api/sales/dashboard/getDashboardCustomerWiseTrend",
	getDashboardTotalDispatchLogistic: "api/sales/dashboard/getDashboardTotalDispatchLogistic",
	dashboardGradewiseAvrg: "api/sales/dashboard/dashboardGradewiseAvrg",
	dashboardStatewiseAvrg: "api/sales/dashboard/dashboardStatewiseAvrg",
	dashboardMainGradewiseAvrg: "api/sales/dashboard/dashboardMainGradewiseAvrg",
	dashboardZoneWiseOrder: "api/sales/dashboard/dashboardZoneWiseOrder",
	dashboardZoneWisePlanning: "api/sales/dashboard/dashboardZoneWisePlanning",
	dashboardZoneWiseDispatch: "api/sales/dashboard/dashboardZoneWiseDispatch",
	dashboardZonewiseAvrg: "api/sales/dashboard/dashboardZonewiseAvrg",
	getTopTenParty: "api/sales/dashboard/getTopTenParty",
	inactiveCustomers: "api/sales/dashboard/inactiveCustomers",
	cancelQuantityOrder: "api/sales/dashboard/cancelQuantityOrder",
	blacklistCustomer: "api/sales/dashboard/blacklistCustomer",
	getAllOrdersNumber: "api/sales/dashboard/getAllOrdersNumber",
	getAllFinancePlanningNumber: "api/sales/dashboard/getAllFinancePlanningNumber",
	getAllDispatchNumber: "api/sales/dashboard/getAllDispatchNumber",
	getDashboardOutstangings: "api/sales/dashboard/getDashboardOutstangings",
	getDashboardTotalPaymentDue: "api/sales/dashboard/getDashboardTotalPaymentDue",
	getTotalPaymentDue: "api/sales/dashboard/getDashboardTotalPaymentDue",
	getOutstangings: "api/sales/dashboard/getOutstangings",
	getOneDataByField: "api/sales/dashboard/getOneDataByField"
}

// surisha purchase sale dashboard
export const surishaDashboard = {
	surishaPurchasePortWise: "api/dashboard/surishaDashboard/surishaPurchasePortWise",
	surishaSalePortWise: "api/dashboard/surishaDashboard/surishaSalePortWise",
	purchaseSummary: "api/dashboard/surishaDashboard/purchaseSummary",
	SurishasalePurchaseLinking: "api/dashboard/surishaDashboard/SurishasalePurchaseLinking",
}


// Import Dashboard APIs
export const ImportDashboard = {
	getDashboardGradeWiseAvg: "api/sales/importDashboard/getDashboardGradeWiseAvg",
	getDashboardInActiveUser: "api/sales/importDashboard/getDashboardInActiveUser",
	getDashboardMainGradeWiseAvg: "api/sales/importDashboard/getDashboardMainGradeWiseAvg",
	getDashboardZoneWiseAvg: "api/sales/importDashboard/getDashboardZoneWiseAvg",
	getDashboardStateWiseAvg: "api/sales/importDashboard/getDashboardStateWiseAvg",
	getDashboardTopTenParty: "api/sales/importDashboard/getDashboardTopTenParty",
	getDashboardCustomerWiseAvg: "api/sales/importDashboard/getDashboardCustomerWiseAvg",
	getDashboardCustomerWiseTrends: "api/sales/importDashboard/getDashboardCustomerWiseTrend",
	getDashboardTotalDispatchLogistic: "api/sales/importDashboard/getDashboardTotalDispatchLogistic",
	dashboardGradewiseAvrg: "api/sales/importDashboard/dashboardGradewiseAvrg",
	dashboardStatewiseAvrg: "api/sales/importDashboard/dashboardStatewiseAvrg",
	dashboardMainGradewiseAvrg: "api/sales/importDashboard/dashboardMainGradewiseAvrg",
	dashboardZoneWiseOrder: "api/sales/importDashboard/dashboardZoneWiseOrder",
	dashboardZoneWisePlanning: "api/sales/importDashboard/dashboardZoneWisePlanning",
	dashboardZoneWiseDispatch: "api/sales/importDashboard/dashboardZoneWiseDispatch",
	dashboardZonewiseAvrg: "api/sales/importDashboard/dashboardZonewiseAvrg",
	getTopTenParty: "api/sales/importDashboard/getTopTenParty",
	inactiveCustomers: "api/sales/importDashboard/inactiveCustomers",
	cancelQuantityOrder: "api/sales/importDashboard/cancelQuantityOrder",
	blacklistCustomer: "api/sales/importDashboard/blacklistCustomer",
	getAllOrdersNumber: "api/sales/importDashboard/getAllOrdersNumber",
	getAllFinancePlanningNumber: "api/sales/importDashboard/getAllFinancePlanningNumber",
	getAllDispatchNumber: "api/sales/importDashboard/getAllDispatchNumber",
	getDashboardOutstangings: "api/sales/importDashboard/getDashboardOutstangings",
	getDashboardTotalPaymentDue: "api/sales/importDashboard/getDashboardTotalPaymentDue",
	getTotalPaymentDue: "api/sales/importDashboard/getDashboardTotalPaymentDue",
	getOutstangings: "api/sales/importDashboard/getOutstangings",
	getOneDataByField: "api/sales/importDashboard/getOneDataByField"
}

// Consignments APIs
export const Consignments = {
	add: "api/sales/consignment/add",
	getOneCustom: "api/sales/consignment/getOneCustom",
	getAll: "api/sales/consignment/getAll",
	getOne: "api/sales/consignment/getOne",
	update: "api/sales/consignment/update",
	delete: "api/sales/consignment/delete",
	sendEmail: 'api/sales/consignment/sendEmail',
	checkExists: 'api/sales/consignment/checkExists',
	getSumofQuantity: "api/sales/consignment/getSumofQuantity",
	getReport: "api/sales/consignment/getReport",
	sendReportMail: "api/sales/consignment/sendReportMail",
	getpenddingConsignment: "api/sales/consignment/getpenddingConsignment",
	updateStatus: "api/sales/consignment/updateStatus",
	updateFPStatus: "api/sales/consignment/updateFPStatus",
	updateKnockOffStatus: "api/sales/consignment/updateKnockOffStatus",
	updateKnockOffQty: "api/sales/consignment/updateKnockOffQty",
	getKnockOffList: "api/sales/consignment/getKnockOffList",
	getCustomerConsignments: "api/sales/consignment/getCustomerConsignments",
	getNumbers: "api/sales/consignment/getNumbers",
	consignmentSumQty: "api/sales/consignment/consignmentSumQty",
	financePlanningSumQty: "api/sales/consignment/financePlanningSumQty",
	dispatchSumQty: "api/sales/consignment/dispatchSumQty",
	financePlanningSumByCosignment: "api/sales/consignment/financePlanningSumByCosignment",
	getAllContactsEmailBySubOrg: "api/sales/consignment/getAllContactsEmailBySubOrg",
	getAllContactsNumberBySubOrg: "api/sales/consignment/getAllContactsNumberBySubOrg",
	checkMobileExists: "api/sales/consignment/checkMobileExists",
	checkEmailExists: "api/sales/consignment/checkEmailExists",
	getTopTenParty: "api/sales/consignment/getTopTenParty",
	inactiveCustomers: "api/sales/consignment/inactiveCustomers",
	undispatchedConsignments: "api/sales/consignment/undispatchedConsignments",
	dashboardNumbers: "api/sales/consignment/dashboardNumbers",
	dashboardZonewiseAvrg: "api/sales/consignment/dashboardZonewiseAvrg",
	dashboardGradewiseAvrg: "api/sales/consignment/dashboardGradewiseAvrg",
	dashboardStatewiseAvrg: "api/sales/consignment/dashboardStatewiseAvrg",
	dashboardMainGradewiseAvrg: "api/sales/consignment/dashboardMainGradewiseAvrg",
	dashboardZoneWiseOrder: "api/sales/consignment/dashboardZoneWiseOrder",
	dashboardZoneWisePlanning: "api/sales/consignment/dashboardZoneWisePlanning",
	dashboardZoneWiseDispatch: "api/sales/consignment/dashboardZoneWiseDispatch",
	updatePiStatus: "api/sales/consignment/updatePiStatus",
	updateLcStatus: "api/sales/consignment/updateLcStatus",
	cancelQuantityOrder: "api/sales/consignment/cancelQuantityOrder",
	blacklistCustomer: "api/sales/consignment/blacklistCustomer",
	monthWiseBookingTrend: "api/sales/consignment/monthWiseBookingTrend",
	customerWiseAvrage: "api/sales/consignment/customerWiseAvrage",
	getAllOrdersNumber: "api/sales/consignment/getAllOrdersNumber",
	getAllFinancePlanningNumber: "api/sales/consignment/getAllFinancePlanningNumber",
	getAllDispatchNumber: "api/sales/consignment/getAllDispatchNumber",
	// getAllOrdersNumber:"api/sales/consignment/getAllOrdersNumber",
	// getAllFinancePlanningNumber:"api/sales/consignment/getAllFinancePlanningNumber",
	// getAllDispatchNumber:"api/sales/consignment/getAllDispatchNumber",
	getDashboardGradeWiseAvg: "api/sales/consignment/getDashboardGradeWiseAvg",
	getDashboardInActiveUser: "api/sales/consignment/getDashboardInActiveUser",
	getDashboardMainGradeWiseAvg: "api/sales/consignment/getDashboardMainGradeWiseAvg",
	getDashboardZoneWiseAvg: "api/sales/consignment/getDashboardZoneWiseAvg",
	getDashboardStateWiseAvg: "api/sales/consignment/getDashboardStateWiseAvg",
	getDashboardTopTenParty: "api/sales/consignment/getDashboardTopTenParty",
	getDashboardCustomerWiseAvg: "api/sales/consignment/getDashboardCustomerWiseAvg",
	getDashboardCustomerWiseTrends: "api/sales/consignment/getDashboardCustomerWiseTrend",
	getDashboardTotalDispatchLogistic: "api/sales/consignment/getDashboardTotalDispatchLogistic",
	getCustomerDetailAvgWise: "api/sales/consignment/getCustomerDetailAvgWise",
	sendSurishaMail: "api/sales/consignment/sendSurishaMail",
	// sendDealCompletionMail:"api/sales/consignment/sendDealCompletionMail"
}

// Finance Planning APIs
export const financePlanning = {
	add: "api/sales/financePlanning/add",
	getAll: "api/sales/financePlanning/getAll",
	getOne: "api/sales/financePlanning/getOne",
	getBalanceQty: "api/sales/financePlanning/getBalanceQty",
	update: "api/sales/financePlanning/update",
	delete: "api/sales/financePlanning/delete",
	getDispatchFPBalance: "api/sales/financePlanning/getDispatchFPBalance",
	updateStatus: "api/sales/financePlanning/updateStatus",
	getSumofQuantity: "api/sales/financePlanning/getSumofQuantity",
	getDispatchFPQtySumFromPlanning: "api/sales/financePlanning/getDispatchFPQtySumFromPlanning",
	getDispatchFPQtySum: "api/sales/financePlanning/getDispatchFPQtySum",
	updateDispatchStatus: "api/sales/financePlanning/updateDispatchStatus",
	getUndispatchedData: "api/sales/financePlanning/getUndispatchedData",
	checkFinancePlanningQuantity: "api/sales/financePlanning/checkFinancePlanningQuantity",
	updateStatusDispatch: "api/sales/financePlanning/updateStatusDispatch",
}

// Dispatch APIs
export const Dispatch = {
	add: "api/sales/dispatch/add",
	getAll: "api/sales/dispatch/getAll",
	getOne: "api/sales/dispatch/getOne",
	update: "api/sales/dispatch/update",
	delete: "api/sales/dispatch/delete",
	getByVirtualAccNo: "api/sales/dispatch/getByVirtualAccNo",
	getSumofQuantity: "api/sales/dispatch/getSumofQuantity",
	getSumofQuantityPaid: "api/sales/dispatch/getSumofQuantityPaid",
	getAllDisptachAddress: "api/sales/dispatch/getAllDisptachAddress",
	getAllShipTOAddress: "api/sales/dispatch/getAllShipTOAddress",
	updateStatus: "api/sales/dispatch/updateStatus",
	getUtilizedOverdueLimit: "api/sales/dispatch/getUtilizedOverdueLimit",
	getUtilizedAdhocLimit: "api/sales/dispatch/getUtilizedAdhocLimit",
	getCustomerPayments: "api/sales/dispatch/getCustomerPayments",
	sendGodownMail: "api/sales/dispatch/sendGodownMail",
	sendInvoiceMail: "api/sales/dispatch/sendInvoiceMail",
	getConsignmentDispatches: "api/sales/dispatch/getConsignmentDispatches",
	updatedLoadedStatus: "api/sales/dispatch/updated_loaded_status",
	getOutstangings: "api/sales/dispatch/getOutstangings",
	getTotalPaymentDue: "api/sales/dispatch/getTotalPaymentDue",
	getDueDetails: "api/sales/dispatch/getDueDetails",
	getMiddlewarePayments: "api/sales/dispatch/getMiddlewarePayments",
	getOutstangingsAfterDueDate: "api/sales/dispatch/getOutstangingsAfterDueDate",
	getLastDispatchDate: "api/sales/dispatch/getLastDispatchDate",
	getLastDispatch: "api/sales/dispatch/getLastDispatch",
	updatePiStatus: "api/sales/dispatch/updatePiStatus",
	getPiSalesInvoice: "api/sales/dispatch/getPiSalesInvoice",
	updatePaymentType: "api/sales/dispatch/updatePaymentType",
	getDashboardOutstangings: "api/sales/dispatch/getDashboardOutstangings",
	getDashboardTotalPaymentDue: "api/sales/dispatch/getDashboardTotalPaymentDue"
};



// Sales Deals APIs
export const SalesDeals = {
	getRegularDeals: "api/sales/salesDeals/getRegularDeals",
	getAdvanceDeals: "api/sales/salesDeals/getAdvanceDeals"
};

// Sales PI APIs
export const SalesPi = {
	add: "api/sales/salesPi/add",
	getAll: "api/sales/salesPi/getAll",
	getOne: "api/sales/salesPi/getOne",
	getOneData: "api/sales/salesPi/getOneData",
	update: "api/sales/salesPi/update",
	delete: "api/sales/salesPi/delete",
	updateStatus: "api/sales/salesPi/updateStatus",
	getPiDetails: "api/sales/salesPi/getPiDetails",
	updateDispatchBilling: "api/sales/salesPi/updateDispatchBilling",
	getOnePIData: "api/sales/salesPi/getOnePIData",
	approvePi: "api/sales/salesPi/approveSalesPI",
	piApprovedData: "api/sales/salesPi/getPIApprovedData"
};

// Sales LC APIs
export const SalesLc = {
	add: "api/sales/salesLc/add",
	getAll: "api/sales/salesLc/getAll",
	getOne: "api/sales/salesLc/getOne",
	getOneData: "api/sales/salesLc/getOneData",
	update: "api/sales/salesLc/update",
	delete: "api/sales/salesLc/delete",
	updatePaymentStatus: "api/sales/salesLc/updatePaymentStatus",
	getLCAmount: "api/sales/salesLc/getLCAmount",
	approveLC: "api/sales/salesLc/getOneData",
	lcApprovedData: "api/sales/salesLc/getLCApprovedData"
};

// Sales LC APIs
export const SalesBex = {
	add: "api/sales/salesBex/add",
	getAll: "api/sales/salesBex/getAll",
	getOne: "api/sales/salesBex/getOne",
	update: "api/sales/salesBex/update",
	delete: "api/sales/salesBex/delete"
};

// Charges Stage Types APIs
export const ChargesStageTypes = {
	getAll: "api/masters/chargesStageTypes/getAll"
};

// Charges Stages APIs
export const ChargesStages = {
	add: "api/masters/chargesStages/add",
	getAll: "api/masters/chargesStages/getAll",
	getOne: "api/masters/chargesStages/getOne",
	update: "api/masters/chargesStages/update",
	delete: "api/masters/chargesStages/delete",
	getCategoryWiseCharges: "api/masters/chargesStages/getCategoryWiseCharges",
};

//Packaging Master
export const packaging = {
	add: "api/masters/packaging/add",
	getAll: "api/masters/packaging/getAll",
	getOne: "api/masters/packaging/getOne",
	update: "api/masters/packaging/update",
	delete: "api/masters/packaging/delete",
	getCategoryWiseCharges: "api/masters/packaging/getCategoryWiseCharges",
};

// Charges Heads APIs
export const ChargesHeads = {
	add: "api/masters/chargesHeads/add",
	getAll: "api/masters/chargesHeads/getAll",
	getOne: "api/masters/chargesHeads/getOne",
	update: "api/masters/chargesHeads/update",
	delete: "api/masters/chargesHeads/delete",
	getBankCharges: "api/masters/chargesHeads/getBankCharges"
};

// Charges Masters APIs
export const ChargesMasters = {
	add: "api/masters/charges/add",
	getAll: "api/masters/charges/getAll",
	getOne: "api/masters/charges/getOne",
	update: "api/masters/charges/update",
	delete: "api/masters/charges/delete",
	getBankCharges: "api/masters/charges/getBankCharges"
};


// Dispatch APIs
export const LicenseInvoice = {
	add: "api/logistics/license-invoice/add",
	getAll: "api/logistics/license-invoice/getAll",
	getOne: "api/logistics/license-invoice/getOne",
	update: "api/logistics/license-invoice/update",
	delete: "api/logistics/license-invoice/delete"
};


// Dispatch APIs
export const LicenseMaster = {
	add: "api/logistics/license-master/add",
	getAll: "api/logistics/license-master/getAll",
	getAllTransfered: "api/logistics/license-master/getAllTransfered",
	getOne: "api/logistics/license-master/getOne",
	update: "api/logistics/license-master/update",
	delete: "api/logistics/license-master/delete",
	sendEmail: "api/logistics/license-master/sendEmail",
	updateKnockoffstatus: "api/logistics/license-master/updateKnockoffstatus",
};


// Logistic License Knock of  APIs
export const LicenseKnockOf = {
	add: "api/logistics/license-knockof/add",
	getAll: "api/logistics/license-knockof/getAll",
	getOne: "api/logistics/license-knockof/getOne",
	update: "api/logistics/license-knockof/update",
	delete: "api/logistics/license-knockof/delete"
};


// ILC Opening Charges APIs
export const IlcOpeningCharges = {
	add: "api/charges/ilcOpeningCharges/add",
	getAll: "api/charges/ilcOpeningCharges/getAll",
	getOne: "api/charges/ilcOpeningCharges/getOne",
	update: "api/charges/ilcOpeningCharges/update",
	delete: "api/charges/ilcOpeningCharges/delete",
	recalculate: "api/charges/ilcOpeningCharges/recalculate",
	getLocalDealPiDetails: "api/charges/ilcOpeningCharges/getLocalDealPiDetails",
};


// ILC Amendment Charges APIs
export const IlcAmendmentCharges = {
	add: "api/charges/ilcAmendmentCharges/add",
	getAll: "api/charges/ilcAmendmentCharges/getAll",
	getOne: "api/charges/ilcAmendmentCharges/getOne",
	update: "api/charges/ilcAmendmentCharges/update",
	delete: "api/charges/ilcAmendmentCharges/delete",
	recalculate: "api/charges/ilcAmendmentCharges/recalculate",
};


// ILC Remittance Charges APIs
export const IlcRemittanceCharges = {
	add: "api/charges/ilcRemittanceCharges/add",
	getAll: "api/charges/ilcRemittanceCharges/getAll",
	getOne: "api/charges/ilcRemittanceCharges/getOne",
	update: "api/charges/ilcRemittanceCharges/update",
	delete: "api/charges/ilcRemittanceCharges/delete",
	recalculate: "api/charges/ilcRemittanceCharges/recalculate",
};

// ILC Remittance Charges APIs
export const IlcDiscountCharges = {
	add: "api/charges/ilcDiscountCharges/add",
	getAll: "api/charges/ilcDiscountCharges/getAll",
	getOne: "api/charges/ilcDiscountCharges/getOne",
	update: "api/charges/ilcDiscountCharges/update",
	recalculate: "api/charges/ilcDiscountCharges/recalculate",
};


// Live Inventory APIs
export const LiveInventory = {
	add: "api/inventory/liveInventory/add",
	getAll: "api/inventory/liveInventory/getAll",
	getOne: "api/inventory/liveInventory/getOne",
	update: "api/inventory/liveInventory/update",
	delete: "api/inventory/liveInventory/delete",
	getlivestock: "api/inventory/liveInventory/getlivestock",
	getDetailStock: "api/inventory/liveInventory/getDetailStock",
	getDetailImportLocalStock: "api/inventory/liveInventory/get_detail_import_local_stock",
	getcentrallivestock: "api/inventory/liveInventory/getcentrallivestock",
	updateCentralInventory: "api/inventory/liveInventory/updateCentralInventory",
	approveInventory: "api/inventory/liveInventory/approve_daily_inventory",
	existingApproved: "api/inventory/liveInventory/existing_approved",
	marketing_person_wise_stock: "api/inventory/liveInventory/marketin_person_wise_stock",
	centralStockCalculate: "api/inventory/liveInventory/cal_all_central_stock",
	cal_all_central_stock_optimize: "api/inventory/liveInventory/cal_all_central_stock_optimize",
	salepuchasestockreport: "api/inventory/liveInventory/sale_purchase_stock_report",
	contactEmailJsonUpdatefinance: "api/inventory/liveInventory/contact_email_json_update_finance",
	contactEmailJsonUpdatelogistics: "api/inventory/liveInventory/contact_email_json_update_logistics",
	contactEmailJsonUpdatesales: "api/inventory/liveInventory/contact_email_json_update_sales",
	updateAllocationCheck: "api/inventory/liveInventory/update_allocation_check",
	getGodownWiseGrade: "api/inventory/liveInventory/get_godown_wise_grade",
	allocateInventoryWhatsapp: "api/inventory/liveInventory/allocate_inventory_whatsapp",
	getZoneWiseGodownImportLocal: "api/inventory/liveInventory/get_zone_wise_godown_import_local",
	getZoneWiseGodown: "api/inventory/liveInventory/get_zone_wise_godown",
	getGodownStaff: "api/inventory/liveInventory/get_godown_staff",
	addGodownStaff: "api/inventory/liveInventory/add_godown_staff",
	deleteGodownStaff: "api/inventory/liveInventory/delete_godown_staff",
	getPvcPolyInventory: "api/inventory/liveInventory/pvc_po_inventory",
	getPvcPolyInventoryRedis: "api/inventory/liveInventory/pvc_po_inventory_redis",
	getPvcPolyInventoryRedisNew: "api/inventory/liveInventory/pvc_po_inventory_redis_new",
	getcentrallivestockImportLocal: "api/inventory/liveInventory/getcentrallivestock_import_local",
	updateAllocationCheckImportLocal: "api/inventory/liveInventory/update_allocation_check_import_local",
	getGodownWiseGradeImportLocal: "api/inventory/liveInventory/get_godown_wise_grade_import_local",
	getGodownWiseGradeImportLocalRedis: "api/inventory/liveInventory/get_godown_wise_grade_import_local_redis",
	getDispatchGrades: "api/inventory/liveInventory/get_dispatch_grades",
	getDispatchGradesRedis: "api/inventory/liveInventory/get_dispatch_grades_redis",
	marketing_person_wise_stock_import_local: "api/inventory/liveInventory/marketin_person_wise_stock_import_local",
	marketing_person_wise_stock_import_local_redis: "api/inventory/liveInventory/marketing_person_wise_stock_import_redis",


};

//short damage clearance
export const ShortDamageClearance = {
	addData: "api/inventory/clearance/addData",
	updateData: "api/inventory/clearance/updateData",
	getAllData: "api/inventory/clearance/getAllData",
	deleteData: "api/inventory/clearance/deleteData",
}



// Sales Reports APIs
export const SalesReports = {
	getGroupOutstandingReport: "api/sales/financePlanningReports/getGroupOutstandingReport",
	getCreditLimitReport: "api/sales/financePlanningReports/getCreditLimitReport",
	getPartyWiseOutstandingReport: "api/sales/financePlanningReports/getPartyWiseOutstandingReport",
	getPaymentDetails: "api/sales/financePlanningReports/getPaymentDetails"
};

// Godown Charges Reports APIs
export const GodownChargesReports = {
	getFinancialYears: "api/sales/godownCharges/getFinancialYears",
	getApprovalDates: "api/sales/godownCharges/getApprovalDates",
	getVerifyReport: "api/sales/godownCharges/getVerifyReport",
	verifyReport: "api/sales/godownCharges/verifyReport",
	getGodownDetails: "api/sales/godownCharges/getGodownDetails",
	getPaymentReport: "api/sales/godownCharges/getPaymentReport",
	getConfirmedCharges: "api/sales/godownCharges/getConfirmedCharges",
	addOtherConfirmedCharges: "api/sales/godownCharges/addOtherConfirmedCharges",
	updateOtherConfirmedCharges: "api/sales/godownCharges/updateOtherConfirmedCharges",
	getPaymentDetails: "api/sales/godownCharges/getPaymentDetails",
	deleteConfirmedCharges: "api/sales/godownCharges/deleteConfirmedCharges"
};

// Management Operations APIs
export const ManagementOperations = {
	getGodowns: "api/sales/managementOperations/getGodowns",
	updateGodown: "api/sales/managementOperations/updateGodown",
};

// Account And Audit Report
export const AccountAndReport = {
	expensesReport: "api/analytics/reports/clearingExpensesReport",
};


// Telephone Extensions APIs
export const TelephoneExtensions = {
	getAll: "api/masters/telephoneExtensions/getAll",
	getOne: "api/masters/telephoneExtensions/getOne",
	add: "api/masters/telephoneExtensions/add",
	update: "api/masters/telephoneExtensions/update",
	delete: "api/masters/telephoneExtensions/delete",
	getEmpExtension: "api/masters/telephoneExtensions/getEmpExtension",
	searchExtension: "api/masters/telephoneExtensions/searchExtension"
};

// Management Operations APIs
export const CommissionReport = {
	getAllCommisions: "api/sales/commissionReport/getAllCommisions",
	updateCommisionDetails: "api/sales/commissionReport/updateCommisionDetails",
};




// Deal Foreign Supplier APIs
export const DealForeignSupplier = {
	add_fs_deal: "api/deal_foreign_supp/add_fs_deal",
	get_all_fs_deal_detail: "api/deal_foreign_supp/get_all_fs_deal_detail",
	get_one_fs_deal: "api/deal_foreign_supp/get_one_fs_deal",
	update_fs_deal: "api/deal_foreign_supp/update_fs_deal",
	delete_fs_deal: "api/deal_foreign_supp/delete_fs_deal",
	get_distinct_supplier: "api/deal_foreign_supp/get_distinct_supplier",
	get_all_deal_one_supplier: "api/deal_foreign_supp/get_all_deal_one_supplier"
};

// Search APIs
export const Search = {
	getAllContact: "api/search/contact/getAllContact",
	detail_search: "api/search/detail/getAllDetailSearch",
	get_city_from_multiple_state: "api/city_master/get_city_from_multiple_state"
};

// Proforma Invoice APIs
export const ProformaInvoice = {
	add_pi: "api/flc_pi/add_pi",
	update_pi: "api/flc_pi/update_pi",
	get_pi_against_one_ga: "api/flc_pi/get_pi_against_one_ga",
	delete_pi: "api/flc_pi/delete_pi",
	get_one_pi: "api/flc_pi/get_one_pi",
	get_all_pi: "api/flc_pi/get_all_pi",
	send_pi_mail: "api/flc_pi/send_pi_mail",
	getPiForLcMail: "api/forex/getPiForLcMail",
	piRegistrationUpdate: "api/forex/piRegistrationUpdate",
	deleteRegistrationDoc: "api/forex/deleteRegistrationDoc",
};

// Payable APIs
export const Payables = {
	payable_list: "api/payables/payableList",
	contraPaymentList: "api/payables/contraPaymentList",
	add_payables_request: "api/payables/addPayableRequest",
	update_request: "api/payables/updateRequest",
	deleteRequest: "api/payables/deleteRequest",
	request_approve: "api/payables/approveRequest",
	update_sb_paid_amount: "api/payables/updateSbPaidAmount",
	process_payment_list: "api/payables/processPaymentList",
	pending_process_payment_list: "api/payables/pendingProcessPaymentList",
	bank_details_group_by_record: "api/payables/bankDetailsGroupByRecord",
	update_process_payment_details: "api/payables/updateProcessPaymentDetails",
	update_utr_no: "api/payables/updateUtrNo",
	past_payment_list: "api/payables/pastPaymentList",
	sendEmailPayment: "api/payables/sendEmailPayment",
	getInvoiceWisePaymentReport: "api/payables/getInvoiceWisePaymentReport",
	getTransferPayments: "api/payables/getTransferPayments",
	getCentralPayableLocal: "api/payables/getCentralPayableLocal",
	getLCPayments: "api/payables/getLCPayments",
	getSalesDispatchLCPayments: "api/payables/getSalesDispatchLCPayments",
	getForwardSalesPayments: "api/payables/getForwardSalesPayments",
	getMiddelwarePayments: "api/payables/getMiddelwarePayments",
};



// Non Negotiable APIs
export const NonNegotiable = {
	create_non: "api/non_negotiable/create_non",
	update_non: "api/forex/updateNon",
	get_one_non: "api/forex/getOneNon",
	update_non_original_recv_dt: "api/non_negotiable/update_non_original_recv_dt",
	update_docket_no_det: "api/non_negotiable/update_docket_no_det",
	update_revise_non: "api/non_negotiable/update_revise_non",
	payment_status: "api/non_negotiable/payment_status",
	send_non_mail: "api/non_negotiable/send_non_mail",
	delete_non: "api/non_negotiable/delete_non",
	get_all_non: "api/forex/getAllNon",
	getMaterialArrivalDet: "api/forex/getMaterialArrivalDet",
	updateCoaCopy: "api/forex/updateCoaCopy",
	sendEmailLc: "api/forex/sendEmailLc",
	getCountofDelChallanNo: "api/forex/getCountofDelChallanNo",
	deleteReviseCopy: "api/forex/deleteReviseCopy",
	getImportForexReport: "api/forex/getImportForexReport",
	getHighSeasCustomerName: "api/forex/getHighSeasCustomerName",
	getAsmReport: "api/forex/getAsmReport",
	updateArrival: "api/forex/updateArrival",
	sendArrivalWhastapp: "api/forex/sendArrivalWhastapp",
};

// Non LC APIs
export const NonLC = {
	update_swift_tt_details: "api/non_lc/update_swift_tt_details",
	get_payment_term_list: "api/non_lc/get_payment_term_list",
	get_nonlc_non: "api/non_lc/get_nonlc_non",
	delete_swift: "api/non_lc/delete_swift",
	reset_RollOver_in_nonlc: "api/non_lc/reset_RollOver_in_nonlc"
};



// Lifting Details APIs
export const LiftingDetails = {
	getAll: "api/local_purchase/completeLiftingDetailList",
	add: "api/local_purchase/addLiftingDetails",
	update: "api/local_purchase/updateLiftingDetails",
	delete: "api/local_purchase/deleteLocalPurchaseLifting",
	updateDrCrNote: "api/local_purchase/updateDrCrNote",
	verifyLocalPurchaseLIfting: "api/local_purchase/verifyLocalPurchaseLIfting",
	updateAdditionalDetails: "api/local_purchase/updateAdditionalDetails",
	sendPendingMail: "api/local_purchase/sendPendingMail",
	getOneLiftingDetails: "api/local_purchase/getOneLiftingDetails",
	addlLocalLiftingPayment: "api/local_purchase/addlLocalLiftingPayment",
	updateLiftingFile: "api/local_purchase/updateLiftingFile",
	updateBillStatus: "api/local_purchase/updateBillStatus",
};




// Local Purchase APIs
export const LocalPurchase = {
	getAll: "api/local_purchase/allLocalPurchaseDealDetails",
	add: "api/local_purchase/addLocalPurchaseDeal",
	update: "api/local_purchase/updateLocalPurchaseDeal",
	extra_qty_add: "api/local_purchase/add_extra_deal_qty",
	knock_of_qty: "api/local_purchase/knock_of_qty",
	delete: "api/local_purchase/deleteLocalPurchaseDeal",
	cancelDealQuantity: "api/local_purchase/cancelDealQuantity",
	localPurchaseCustomers: "api/local_purchase/localPurchaseCustomers",
	sendSMS: "api/whatsapp/send",
	updatePOCopy: "api/local_purchase/updatePOCopy",
	sendMailPaymentLifting: "api/local_purchase/sendMailPaymentLifting",
	getLocalPurchase: "api/local_purchase/getLocalPurchase",
	getOneLocalPurchaseDeal: "api/local_purchase/getOneLocalPurchaseDeal",
	getBalanceLiftingQuantity: "api/local_purchase/getBalanceLiftingQuantity",
	updateStatus: "api/local_purchase/updateStatus",
	adjustPayment: "api/local_purchase/adjustPayment",
	updatePaymentKnockOff: "api/local_purchase/updatePaymentKnockOff",
	updateSplitDetails: "api/local_purchase/updateSplitDetails",
	getLifting: "api/local_purchase/getLifting",
	getSections: "api/local_purchase/getSections",
	sendPoMail: "api/local_purchase/sendPoMail",
	updateMode: "api/local_purchase/updateMode",
	updateLocalArrival: "api/local_purchase/updateLocalPurchaseArrival"
};

//Local Purchase Charges

export const LocalPurchaseCharges = {
	addTransporterCharges: "api/local_purchase/addTransporterCharges",
	addStorageCharges: "api/local_purchase/addStorageCharges",
	getStorageCharges: "api/local_purchase/getStorageCharges",
	getTransporterCharges: "api/local_purchase/getTransporterCharges",

}

//Local Purchase Godown Allocation

export const LocalPurchaseGodownAlloc = {
	addGodownAllocation: "api/local_purchase/addGodownAllocation",
	getGodownAllocation: "api/local_purchase/getGodownAllocation",
	updateGodownAllocation: "api/local_purchase/updateGodownAllocation",
	deleteDataGodown: "api/local_purchase/deleteDataGodown",

}




// IndentPI APIs
export const IndentPI = {
	update_indent_pi: "api/indent_update/update_indent_pi"
};

// Ilc Loc APIs
export const Ilc_Loc = {
	getAll: "api/local_purchase/allIlcList",
	add: "api/local_purchase/addIlcApplication",
	update: "api/local_purchase/updateIlcApplication",
	delete: "api/local_purchase/deleteData",
	ilcOpen: "api/local_purchase/ilcOpen",
	ilcAmmend: "api/local_purchase/ilcAmmend",
	ilcDiscard: "api/local_purchase/ilcDiscard",
	getIlcUtilization: "api/local_purchase/getIlcUtilization",
	updateAdvanceShort: "api/local_purchase/updateAdvanceShort",
	discardAdvanceShort: "api/local_purchase/discardAdvanceShort",
	ilcTest: "api/local_purchase/ilcTest"
};



// Ilc Pi APIs
export const Ilc_Pi = {
	getAll: "api/local_purchase/allIlcProformaInvoice",
	add: "api/local_purchase/addIlcPi",
	update: "api/local_purchase/updateIlcPi",
	delete: "api/local_purchase/deleteIlcPi"
};



// Ilc Bex APIs
export const Ilc_Bex = {
	getAll: "api/local_purchase/getAllBex",
	add: "api/local_purchase/addBex",
	update: "api/local_purchase/updateBex",
	updateStatus: "api/local_purchase/updateStatusBex",
	delete: "api/local_purchase/deleteBex",
	addbexAcceptance: "api/local_purchase/addbexAcceptance"
};




// Grade Assortment APIs
// export const GradeAssortment = {
// 	add_ga: "api/grade_assortment/add_ga",
// 	update_ga: "api/grade_assortment/update_ga",
// 	get_ga_full_one_fs: "api/grade_assortment/get_ga_full_one_fs",
// 	get_one_ga: "api/grade_assortment/get_one_ga",
// 	delete_ga: "api/grade_assortment/delete_ga",
// 	get_supp_detail: "api/grade_assortment/get_supp_detail"
// };

// Letter of Credit APIs
export const LetterOfCredit = {
	create_lc: "api/letter_of_credit/create_lc",
	update_lc_application: "api/letter_of_credit/update_lc_application",
	get_lc_list: "api/letter_of_credit/get_lc_list",
	one_lc_all_pi_non_details: "api/letter_of_credit/one_lc_all_pi_non_details",
	delete_lc: "api/letter_of_credit/delete_lc",
	reset_pi_avail_pi_list: "api/letter_of_credit/reset_pi_avail_pi_list",
	reset_lc_pi: "api/letter_of_credit/reset_lc_pi",
	lc_open: "api/letter_of_credit/lc_open",
	lc_ammend: "api/letter_of_credit/lc_ammend",
	lc_insurance: "api/letter_of_credit/lc_insurance",
	discard_lc_open: "api/letter_of_credit/discard_lc_open",
	deleteLcAmmendment: "api/forex/lcAmmendDelete",

};

// Forward Book APIs
export const ForwardBook = {
	create_forwad_book: "api/forward_book/create_forwad_book",
	update_forward: "api/forward_book/update_forward",
	hedge_invoices: "api/forward_book/hedge_invoices",
	delete_hedge: "api/forward_book/delete_hedge",
	get_forward_contract: "api/forward_book/get_forward_contract",
	delete_forward: "api/forward_book/delete_forward",
	get_one_forward_book: "api/forward_book/get_one_forward_book"
};


// percentage Type
export const percentage_type = {
	add: "api/masters/percentage_type/add",
	getAll: "api/masters/percentage_type/getAll",
	update: "api/masters/percentage_type/update",
	delete: "api/masters/percentage_type/delete"
};

// percentage Type
export const percentage_master = {
	add: "api/masters/percentage_master/add",
	getAll: "api/masters/percentage_master/getAll",
	update: "api/masters/percentage_master/update",
	delete: "api/masters/percentage_master/delete",
	getAllDataByCurrentDate: "api/masters/percentage_master/getAllDataByCurrentDate",
	getByType: "api/masters/percentage_master/getByType",
	getTDSDate: "api/masters/percentage_master/getTDSDate",
	getTDSDateTypeWise: "api/masters/percentage_master/getTDSDateTypeWise"
};

// Advance APIs
export const Advance = {
	add: "api/hr/advance/add",
	getAll: "api/hr/advance/getAll",
	getOne: "api/hr/advance/getOne",
	update: "api/hr/advance/update",
	delete: "api/hr/advance/delete",
	getAdvanceInstallments: "api/hr/advance/getAdvanceInstallments"
};

// Advance Installments APIs
export const AdvanceInstallments = {
	add: "api/hr/advance_installments/add",
	getAll: "api/hr/advance_installments/getAll",
	getOne: "api/hr/advance_installments/getOne",
	update: "api/hr/advance_installments/update",
	delete: "api/hr/advance_installments/delete"
};

// Year CTC APIs
export const YearCtc = {
	getAll: "api/hr/yearlyCtc/getAll",
	getOne: "api/hr/yearlyCtc/getOne",
	getOneEmpCtc: "api/hr/yearlyCtc/getEmpYearlyCtc",
	getEmpAnnualCtc: "api/hr/yearlyCtc/getEmpAnnualCtc",
	getEmpMonthlyCtc: "api/hr/yearlyCtc/getEmpMonthlyCtc",
	add: "api/hr/yearlyCtc/add",
	update: "api/hr/yearlyCtc/update",
	delete: "api/hr/yearlyCtc/delete",
	dateDetailsActualBudgted: "api/hr/yearlyCtc/getActualBudgtedDateDetails",
	updateTdsFormOpenCloseDate: "api/hr/yearlyCtc/updateTdsFormOpenCloseDate",
	getFinancialYears: "api/hr/yearlyCtc/getFinancialYears"
};

// Monthly Salary APIs
export const MonthlySalary = {
	salaryBreakUp: "api/hr/salary/salaryBreakUp",
	calculateSalaryAttendance: "api/hr/salary/calculateSalaryAttendance",
	salaryUpdate: "api/hr/salary/salaryUpdate",
	salarySheetMail: "api/hr/salary/salarySheetMail",
	sendWhatsapp: "api/whatsapp/send"
};

// Monthly Salary New APIs
export const MonthlySalaryNew = {
	addData: "api/hr/monthlySalary/addData",
	addDataDateWise: "api/hr/monthlySalary/addDataDateWise",
	updateData: "api/hr/monthlySalary/updateData",
	deleteData: "api/hr/monthlySalary/deleteData",
	getYearlyCTC: "api/hr/monthlySalary/getYearlyCTC",
	getEmpYearlyCTC: "api/hr/monthlySalary/getEmpYearlyCTC",
	getMonthlySalaryNew: "api/hr/monthlySalary/getMonthlySalaryNew",
	getEmpMonthlySalary: "api/hr/monthlySalary/getEmpMonthlySalary",
	getSalaryDetailsForAdvance: "api/hr/monthlySalary/getSalaryDetailsForAdvance",
	getNewMonthsLeft: "api/hr/monthlySalary/getNewMonthsLeft",
	salaryProcessDone: "api/hr/monthlySalary/salaryProcessDone",
	getThirdPartyMonthlySalary: "api/hr/monthlySalary/getThirdPartyMonthlySalary",
	getMonthlySalaryNewEsi: "api/hr/monthlySalary/getMonthlySalaryNewEsi",
	viewCalculated: "api/hr/monthlySalary/viewCalculated"
};

// Yearly CTC New APIs
export const YearlyCTCNew = {
	addData: "api/hr/yearlyCTCNew/addData",
	addDataDateWise: "api/hr/yearlyCTCNew/addDataDateWise",
	updateData: "api/hr/yearlyCTCNew/updateData",
	deleteData: "api/hr/yearlyCTCNew/deleteData",
	getOne: "api/hr/yearlyCTCNew/getOneData",
	getAllYearlyCTC: "api/hr/yearlyCTCNew/getAllYearlyCTC",
	getYearlyCTC: "api/hr/yearlyCTCNew/getYearlyCTC",
	getOneYearlyCTC: "api/hr/yearlyCTCNew/getOneYearlyCTC",
	getFinancialYears: "api/hr/yearlyCTCNew/getFinancialYears",
	getEmpMonthlyCtc: "api/hr/yearlyCTCNew/getEmpMonthlyCtc"
};


// Budget APIs
export const Budget = {
	add_update_budgeted_actual_deatils: "api/budgted_routes/add_update_budgeted_actual_deatils",
	update_status: "api/budgted_routes/update_status",
	budgeted_list: "api/budgted_routes/budgeted_list",
	actual_list: "api/budgted_routes/actual_list"
};

// Employee TDS APIs
export const EmployeeTDS = {
	addData: "api/hr/employeeTDS/add",
	updateData: "api/hr/employeeTDS/update",
	deleteData: "api/hr/employeeTDS/delete",
	getEmpTDS: "api/hr/employeeTDS/getEmpTDS"
};




// Utilization APIs
export const Utilization = {
	lc_utilisation: "api/utilisation/lc_utilisation",
	doc_acceptance: "api/utilisation/doc_acceptance",
	payment_roll_over: "api/utilisation/payment_roll_over",
	NonLc_Payment_Roll_Over: "api/utilisation/NonLc_Payment_Roll_Over",
	update_payment_rate: "api/utilisation/update_payment_rate",
	paymentList: "api/utilisation/paymentList",
	update_sc_cc_charges: "api/utilisation/update_sc_cc_charges"
};

// Appointment Mail
export const AppointmentMail = {
	sendMail: "api/hr/appointment_mail/sendMail",

};

// Appointment Mail
export const IntroductionMail = {
	sendMail: "api/masters/introduction_mail/sendMail",
};

























//NEHA
//Get ForeignSuppiler List
export const foreignSupplier = {
	getAll: "api/organization/foreignSupplier/getAll"
};

/* Common Module APIs */
export const CommonApis = {
	getAllCurrency: "api/masters/currencyMaster/getAll",
	getAllUnitDrumMt: "api/masters/unitDrumMt/getAll",
	getAllMaterialPack: "api/masters/materialPacking/getAllMaterialPack",
	getPiInsurance: "api/masters/piInsurance/getPiInsurance",
	// get_all_material_pack: "api/material_pack_master/get_all_material_pack",
	// get_all_pi_insurance: "api/pi_insurance_master/get_all_pi_insurance",
	get_all_delivery_term: "api/masters/getDeliveryTerm",
	// get_store_value: "api/setting/get_store_value",
	getCompanies: "api/masters/getCompanies",
	getEmployeeTypes: "api/masters/getEmployeeTypes",
	getUpcomingBirthdays: "api/masters/getUpcomingBirthdays",
	sendExcelMail: "api/masters/sendExcelMail"
};

/* Foreign Suppiler Deal  */

export const foreignSuppilerDeals = {
	add: "api/forex/foreignSuppilerDeals/add",
	distinctForeignSupplier: "api/forex/foreignSuppilerDeals/DistinctSupplierList",
};

export const LetterofCreditCrud = {
	adjustToleranceAgainstPi: "api/forex/adjustToleranceAgainstPi"

};




/* FD */

export const fdTypeMaster = {

	add: "api/fd/fdType/add",
	getAll: "api/fd/fdType/getAll",
	getOne: "api/fd/fdType/getOne",
	update: "api/fd/fdType/update",
	delete: "api/fd/fdType/delete"

}


export const allFD = {

	add: "api/fd/fd/add",
	getAll: "api/fd/fd/getAll",
	getOne: "api/fd/fd/getOne",
	update: "api/fd/fd/update",
	delete: "api/fd/fd/delete"

}



export const FdLinking = {
	getAllInvoices: "api/fd/linking/getAllInvoices",
	add: "api/fd/linking/addData",
	fdLinkingList: "api/fd/linking/fdLinkingList",

}




// Charges
export const flcCharges = {
	getAll: "api/charges/flcCharges/getAll",
	getOne: "api/charges/flcCharges/getOne",
	add: "api/charges/flcCharges/add",
	update: "api/charges/flcCharges/update",
}

export const ilcCharges = {
	getAll: "api/charges/ilcCharges/getAll",
	getOne: "api/charges/ilcCharges/getOne",
	add: "api/charges/ilcCharges/add",
	update: "api/charges/ilcCharges/update",
}


export const currencyConvert = {
	getAll: "api/charges/currencyConvert/getAll",
	getOne: "api/charges/currencyConvert/getOne",
	add: "api/charges/currencyConvert/add",
	update: "api/charges/currencyConvert/update",
	calculateCurrencyConversionCharges: "api/charges/currencyConvert/calculateCurrencyConversionCharges",
}

export const otherCharges = {
	getAll: "api/charges/othersCharges/getAll",
	getOne: "api/charges/othersCharges/getOne",
	add: "api/charges/othersCharges/add",
	update: "api/charges/othersCharges/update",
	delete: "api/charges/othersCharges/delete",
}

export const bankChargesList = {
	getAll: "api/charges/bankChargesList/getAll",
	getAllNew: "api/charges/bankChargesList/getAllNew",
	update: "api/charges/bankChargesList/update",
	reCalculateCharges: "api/charges/bankChargesList/reCalculateCharges",
	reCalculateILCCharges: "api/charges/bankChargesList/reCalculateILCCharges",
	getGSTValue: "api/charges/bankChargesList/getGSTValue",
	voucher_check: "api/charges/bankChargesList/voucher_check",
}

export const lcAmmendmentCharges = {

	getAll: "api/charges/lcAmmendmentCharges/getAll",
	getAllNew: "api/charges/lcAmmendmentCharges/getAllNew",
	update: "api/charges/lcAmmendmentCharges/update",
	reCalculateCharges: "api/charges/lcAmmendmentCharges/reCalculateCharges",
	voucher_check: "api/charges/lcAmmendmentCharges/voucher_check",
};

export const shipmentType = {
	getAll: "api/logistics/shipmentType/getAll",

}

export const billOfLading = {
	add: "api/logistics/bill_of_lading/add",
	update: "api/logistics/bill_of_lading/update",
	delete: "api/logistics/bill_of_lading/delete",
	getData: "api/logistics/bill_of_lading/getData",
	getOneBl: "api/logistics/bill_of_lading/getOneBl",
	updateExbond: "api/logistics/bill_of_lading/updateExbond",
	updateChargesStatus: "api/logistics/bill_of_lading/updateChargesStatus",
	updateBondFlag: "api/logistics/bill_of_lading/updateBondFlag",
}

export const containerDetails = {
	update: "api/logistics/container_details/update",
	delete: "api/logistics/container_details/delete",
	updateContainer: "api/logistics/container_details/updateContainer",
	updateFiles: "api/logistics/container_details/updateFiles",
	updateChallanDetails: "api/logistics/container_details/updateChallanDetails",
	sendEmailDeliveryChallan: "api/logistics/container_details/sendEmailDeliveryChallan",
	getContainerList: "api/logistics/container_details/getContainerList",
	updateContainerWithoutInventory: "api/logistics/container_details/updateContainerWithoutInventory",

}

export const billOfEntry = {
	add: "api/logistics/bill_of_entry/add",
	getAll: "api/logistics/bill_of_entry/getAll",
	update: "api/logistics/bill_of_entry/update",
	delete: "api/logistics/bill_of_entry/delete",
	getEmailData: "api/logistics/bill_of_entry/getEmailData",
	sendEmail: "api/logistics/bill_of_entry/sendEmail"
}


export const logisticsReport = {
	palletCountReport: "api/logistics/logistics-report/palletCountReport",
	logisticsPortWiseCharges: "api/logistics/logistics-report/logisticsPortWiseCharges",
	cfsMomentReport: "api/logistics/logistics-report/cfsMomentReport",
	billOfEntryStatistics: "api/logistics/logistics-report/billOfEntryStatistics",
	sendBeMail: "api/logistics/logistics-report/sendBeMail",

}


// lot_details


export const Lot_coa = {
	add: "api/logistics/lot/add",
	getAll: "api/logistics/lot/getAll",
	update: "api/logistics/lot/update",
	delete: "api/logistics/lot/delete",
	sendEmail: "api/logistics/lot/sendEmail",
}





export const nonLcRemittanceCharges = {

	getAll: "api/charges/nonLcRemittanceCharges/getAll",
	getAllNew: "api/charges/nonLcRemittanceCharges/getAllNew",
	update: "api/charges/nonLcRemittanceCharges/update",
	reCalculateCharges: "api/charges/nonLcRemittanceCharges/reCalculateCharges",
	voucher_check: "api/charges/nonLcRemittanceCharges/voucher_check",

};


export const paymentRemittanceCharges = {

	getAll: "api/charges/paymentRemittanceCharges/getAll",
	getAllNew: "api/charges/paymentRemittanceCharges/getAllNew",
	update: "api/charges/paymentRemittanceCharges/update",
	reCalculateCharges: "api/charges/paymentRemittanceCharges/reCalculateCharges",
	voucher_check: "api/charges/paymentRemittanceCharges/voucher_check",

};

export const forwardBookingCharges = {

	getAll: "api/charges/forwardBookingCharges/getAll",
	getAllNew: "api/charges/forwardBookingCharges/getAllNew",
	update: "api/charges/forwardBookingCharges/update",
	reCalculateCharges: "api/charges/forwardBookingCharges/reCalculateCharges",
	voucher_check: "api/charges/forwardBookingCharges/voucher_check",
};

export const bankOtherCharges = {

	add: "api/charges/bankOtherCharges/add",
	update: "api/charges/bankOtherCharges/update",
	delete: "api/charges/bankOtherCharges/delete",
	getAll: "api/charges/bankOtherCharges/getAll",
	getOne: "api/charges/bankOtherCharges/getOne",
	voucher_check: "api/charges/bankOtherCharges/voucher_check",

};


export const oneForeignSupplierDeal = {

	getAllDealOneSupplier: "api/forex/oneFsDeal/getAllDealOneSupplier",
	deletSupplierDeal: "api/forex/oneFsDeal/deleteFsDeal",
	getOneFsDeal: "api/forex/oneFsDeal/getOneFsDeal",
	updateFsDeal: "api/forex/oneFsDeal/updateFsDeal",

};

export const gradeAssortment = {

	getGaAgainstOneFs: "api/forex/gradeAssortment/getGaAgainstOneFs",
	addGradeAssortment: "api/forex/gradeAssortment/addGradeAssortment",
	updateGa: "api/forex/gradeAssortment/updateGa",
	deleteGa: "api/forex/gradeAssortment/deleteGa",
	getSupplierDetail: "api/forex/gradeAssortment/getSupplierDetail",
	getOneGa: "api/forex/gradeAssortment/getOneGa",
};

export const flcProformaInvoice = {

	getOnePi: "api/forex/getOnePi",
	updatePi: "api/forex/updatePi",
	addProdformaInvoice: "api/forex/addProdformaInvoice",
	deletePi: "api/forex/deletePi",
	getPiAgainstOneGa: "api/forex/getPiAgainstOneGa",
	getAllPi: "api/forex/getAllPi",
	sendPiMail: "api/forex/sendPiMail",
	getAllPiHoldRelease: "api/forex/getAllPiHoldRelease",
	setAllPiHoldRelease: "api/forex/setAllPiHoldRelease",

};

export const subOrgRespectiveBank = {
	getPerticularOrgBank: "api/organization/getPerticularOrgBank",
};

export const lcCreation = {
	createLc: "api/forex/createLc",
};

export const indentPi = {
	updateIndentPi: "api/forex/updateIndentPi",
	updateIndentSwiftDetails: "api/forex/updateIndentSwiftDetails",
	addIndentSwiftDetails: "api/forex/addIndentSwiftDetails",
	deleteIndentSwiftDetails: "api/forex/deleteIndentSwiftDetails",
	getIndentSwiftDetails: "api/forex/getIndentSwiftDetails",
};

export const nonLcPi = {
	getPaymentTermList: "api/forex/getPaymentTermList",
	getNonLcNon: "api/forex/getNonLcNon",
	getNonLcNonCreditDet: "api/forex/getNonLcNonCreditDet",
	addPaymentDate: "api/forex/addPaymentDate",
	updateSwiftDetails: "api/forex/updateSwiftDetails",
	deleteSwift: "api/forex/deleteSwift",
	getNonLcRollOverPaymentDetails: "api/forex/getNonLcRollOverPaymentDetails",
	UpdatePaymentStatusNonLc: "api/forex/UpdatePaymentStatusNonLc",

};

export const nonNegotiable = {
	updateNon: "api/forex/updateNon",
	createNon: "api/forex/createNon",
	getOneNon: "api/forex/getOneNon",
	deleteNon: "api/forex/deleteNon",
	updateReviseNon: "api/forex/updateReviseNon",
	UpdatePaymentStatus: "api/forex/UpdatePaymentStatus",
	deleteReviseNonPath: "api/forex/delete_revise_non_path",
	updateNonLcCreditPaymentDate: "api/forex/updateNonLcCreditPaymentDate",
};



export const forexReports = {

	getIssuanceReport: "api/forex/issuance_report",
	getMonthlyAnnexure: "api/forex/monthly_annexure",
	getPaymentReport: "api/forex/payment_report",
	getChargesReport: "api/forex/charges_report",
	getForexSummary: "api/forex/forex_summary",
	getUnsoldSummary: "api/forex/unsold_summary",
	getAllGradeWithCompanyId: "api/forex/main_grades_list",
	getUnsoldSummaryImportLocal: "api/forex/unsold_summary_import_local",
	getUnsoldSummaryImportLocalNewFiltered: "api/forex/unsold_summary_import_local_new",
	getDetailUnsoldSummary: "api/forex/detail_unsold_summary",
	getDetailUnsoldGradeWise: "api/forex/detail_unsold_grade_wise",
	getHoldQty: "api/forex/get_hold_qty",
	updateHoldQty: "api/forex/update_hold_qty",
	updateHoldQtyLocalImport: "api/forex/update_hold_qty_local_import",
	getForexAvgReport: "api/forex/forex_avg_report",
	sales_contract_booking_pending_import_surisha: "api/forex/sales_contract_booking_pending_import_surisha",
	sales_contract_booking_pending_spipl: "api/forex/sales_contract_booking_pending_spipl",

};


export const bank_gaurantee = {

	add: "api/forex/bg_add",
	update: "api/forex/bg_update",
	delete: "api/forex/bg_delete",
	get_all: "api/forex/bg_get_all",
	get_one: "api/forex/bg_get_one",

};



export const actualBudgtedTDS = {
	addUpdate: "api/hr/actualBudgtedTds/addupdate",
	updateStatus: "api/hr/actualBudgtedTds/updateStatus",
	budgeted_list: "api/hr/actualBudgtedTds/budgeted_list",
	actual_list: "api/hr/actualBudgtedTds/actual_list",
};


export const taxComplianceMaster = {
	add: "api/hr/tax_compliance_master/add",
	update: "api/hr/tax_compliance_master/update",
	delete: "api/hr/tax_compliance_master/delete",
	get_all: "api/hr/tax_compliance_master/get_all",
	get_one: "api/hr/tax_compliance_master/get_one",
};


export const taxReturnType = {
	taxTypeAll: "api/hr/tax_type/get_all",
	ReturnTypeAll: "api/hr/retutn_type/get_all",
	get_return_from_tax_type: "api/hr/retutn_type/get_return_from_tax_type",

};


export const taxComplianceDetails = {
	add: "api/hr/tax_compliance_details/add",
	update: "api/hr/tax_compliance_details/update",
	delete: "api/hr/tax_compliance_details/delete",
	get_all: "api/hr/tax_compliance_details/get_all",
	get_one: "api/hr/tax_compliance_details/get_one",
	get_all_details_one_master: "api/hr/tax_compliance_details/get_all_details_one_master",
	get_all_state: "api/hr/tax_compliance_details/get_all_state",
	get_all_emp: "api/hr/tax_compliance_details/get_all_emp",
	get_all_our_company: "api/hr/tax_compliance_details/get_all_our_company",
};


export const chacharges = {
	add: "api/logistics/cha-charges/add",
	getchaRateType: "api/logistics/cha-charges/getchaRateType",
	getShipmentStatus: "api/logistics/cha-charges/getShipmentStatus",
	getData: "api/logistics/cha-charges/getData",
	updateData: "api/logistics/cha-charges/updateData",
	deleteData: "api/logistics/cha-charges/deleteData",
	getCharges: "api/logistics/cha-charges/getCharges",
	getChargeMaster: "api/logistics/cha-charges/getChargeMaster",
	updateCharges: "api/logistics/cha-charges/updateCharges",
};

export const insuranceClaim = {
	getData: "api/logistics/insurance-claim/getData",
	updateDataInsurance: "api/logistics/insurance-claim/updateDataInsurance",
	sendMailInsurance: "api/logistics/insurance-claim/sendMailInsurance",
};



export const logistics_charges = {
	addbond: "api/logistics/logistics_charges/addbond",
	getBondData: "api/logistics/logistics_charges/getBondData",
	getTransporter: "api/logistics/logistics_charges/getTransporter",
	getTransporterCharges: "api/logistics/logistics_charges/getTransporterCharges",
	getStorageCharges: "api/logistics/logistics_charges/getStorageCharges",
	addTransporterData: "api/logistics/logistics_charges/addTransporterData",
	addStorageData: "api/logistics/logistics_charges/addStorageData",
	getChargesList: "api/logistics/logistics_charges/getChargesList",
	getMyChargesList: "api/logistics/logistics_charges/getMyChargesList",
	getChaCharges: "api/logistics/logistics_charges/getChaCharges",
	addChaData: "api/logistics/logistics_charges/addChaData",
	getLoadingCrossingCharges: "api/logistics/logistics_charges/getLoadingCrossingCharges",
	getTypeWiseCharges: "api/logistics/logistics_charges/getTypeWiseCharges",

};

export const tdsChargesForm = {
	add: "api/tdsForm/tds_add",
	update: "api/tdsForm/tds_update",
	update_email: "api/tdsForm/tds_update_email",
	spiplList: "api/tdsForm/tds_tcs_list_spipl",
	sendMail: "api/tdsForm/send_mail_to_customers",
	getEmailCustomers: "api/tdsForm/get_email_customers",
	getContactCustomers: "api/tdsForm/get_contact_customers",
	sendWhatsapp: "api/whatsapp/send",
	send_bulk_mail: "api/tdsForm/send_bulk_mail",
	send_bulk_mail_ssurisha: "api/tdsForm/send_bulk_mail_ssurisha",
	send_bulk_mail_pepp: "api/tdsForm/send_bulk_mail_pepp",
};


export const nonLcPaymentList = {
	nonlcpaymentlist: "api/forex/nonLcPaymentList",
};

export const ssurishaTDSChargesForm = {
	add: "api/ssurisha/tds_add",
	update: "api/ssurisha/tds_update",
	ssurishaList: "api/ssurisha/tds_tcs_list_ssurisha"
};

export const EwayDeclaration = {
	addData: "api/ewayDeclaration/addData",
	updateData: "api/ewayDeclaration/updateData",
	getData: "api/ewayDeclaration/getData"
};

export const fdLinkPaymentDet = {
	getFdDetails: "api/forex/getFdDetails",
};

export const NonPayments = {
	ilcPaymentList: "api/forex/ilc_payment_list",
};


// Sales LC APIs


export const Notifications = {
	add: "api/notification/addNotification",
	getAll: "api/notification/getAllNotification",
	getOne: "api/notification/getOneNotification",
	update: "api/notification/updateNotification",
	delete: "api/notification/deleteNotification",
	getNotificationDetailsByName: "api/notification/getNotificationDetailsByName",
	getNotificationWithFCM: "api/notification/getNotificationWithFCM"

};

export const NotificationsUserRel = {
	add: "api/notification/addNotificationUserRel",
	getAll: "api/notification/getAllNotificationUserRel",
	getOne: "api/notification/getOneNotificationUserRel",
	update: "api/notification/updateNotificationUserRel",
	delete: "api/notification/deleteNotificationUserRel",
	getUserwiseNotificationAccess: "api/notification/getUserwiseNotificationAccess",
	usersNotificationsExists: "api/notification/usersNotificationsExists"
};
export const UsersNotification = {
	add: "api/notification/addUsersNotifications",
	getOne: "api/notification/getOneUsersNotifications",
	update: "api/notification/updateUsersNotifications",
}


export const NotificationsNameMaster = {
	add: "api/notification/addNotificationNameMaster",
	getAll: "api/notification/getAllNotificationNameMaster",
	getOne: "api/notification/getOneNotificationNameMaster",
	update: "api/notification/updateNotificationNameMaster",
	delete: "api/notification/deleteNotificationNameMaster",

};


export const MouMaster = {
	add: "api/mou/add",
	update: "api/mou/update",
	delete: "api/mou/delete",
	get_one: "api/mou/get_one",
	get_all: "api/mou/get_all",
	dupliate_record: "api/mou/dupliate_record"
};


export const DiscountMaster = {
	add: "api/mou/discount/add",
	update: "api/mou/discount/update",
	delete: "api/mou/discount/delete",
	get_one: "api/mou/discount/get_one",
	get_all: "api/mou/discount/get_all",
	dupliate_record: "api/mou/discount/dupliate_record",
	get_discount_type: "api/mou/discount/get_discount_type",
	get_discount_report: "api/mou/discount/discount_report",
	get_fiscal_year_lifting: "api/mou/discount/get_fiscal_year_lifting",
};


export const PriceList = {
	addFrieght: "api/pricelist/dest_frieght/add_frieght",
	addPriceList: "api/pricelist/dest_frieght/add_price_list",
	getFreightList: "api/pricelist/get_freight_list",
	getPriceListAgainstFreight: "api/pricelist/price_list_against_freight",
	updateFreightRate: "api/pricelist/update_freight_rate",
	duplicateFreightRecords: "api/pricelist/duplicate_freight_record",
	deleteFreightRecord: "api/pricelist/delete_freight_record",
	copy_freight_price_list: "api/pricelist/copy_freight_price_list",
	edit_price_list: "api/pricelist/edit_price_list",
	updateCommanPriceListValue: "api/pricelist/update_comman_price_list_value",
	getOneFreight: "api/pricelist/get_one_freight",
	priceListSearch: "api/pricelist/price_list_search",
	getGradeFromPrice: "api/pricelist/get_grade_from_price",
	getCityFromPrice: "api/pricelist/get_city_from_price",
	getManufactureFromPrice: "api/pricelist/get_manufacture_from_price",
};


export const GradeCategory = {
	getAll: "api/masters/gradeCat/getAll",
	getOne: "api/masters/gradeCat/getOne",
	add: "api/masters/gradeCat/add",
	update: "api/masters/gradeCat/update",
	delete: "api/masters/gradeCat/delete"
};
export const InterestRateMaster = {
	addData: "api/masters/InterestRateMaster/addData",
	updateData: "api/masters/InterestRateMaster/updateData",
	getAllData: "api/masters/InterestRateMaster/getAllData",
	deleteData: "api/masters/InterestRateMaster/deleteData",
	getAllDataByCurrentDate: "api/masters/InterestRateMaster/getAllDataByCurrentDate"

};


export const manufactureSupplyStation = {
	getAll: "api/masters/manu_supply_station/get_all",
	getOne: "api/masters/manu_supply_station/get_one",
	addData: "api/masters/manu_supply_station/add",
	updateData: "api/masters/manu_supply_station/update",
	delete: "api/masters/manu_supply_station/delete"

};


export const ConsumeCapacity = {
	addData: "api/masters/consume_capacity/add",
	updateData: "api/masters/consume_capacity/update",
	delete: "api/masters/consume_capacity/delete",
	getOne: "api/masters/consume_capacity/get_one",
	getAll: "api/masters/consume_capacity/get_all",
	getGrdaeAgainstSubOrg: "api/masters/consume_capacity/getGradeAgainstSubOrg"

};


export const TaxType = {
	getAll: "api/masters/tax_type/getAll",
	getOne: "api/masters/tax_type/getOne",
	add: "api/masters/tax_type/add",
	update: "api/masters/tax_type/update",
	delete: "api/masters/tax_type/delete"
};


export const ReturnType = {
	getAll: "api/masters/return_type/getAll",
	getOne: "api/masters/return_type/getOne",
	add: "api/masters/return_type/add",
	update: "api/masters/return_type/update",
	delete: "api/masters/return_type/delete",

};


export const BanksFedaiRate = {
	getAll: "api/masters/fedai_rate/getAll",
	getOne: "api/masters/fedai_rate/getOne",
	add: "api/masters/fedai_rate/add",
	update: "api/masters/fedai_rate/update",
	delete: "api/masters/fedai_rate/delete",

};

// Courrier Master APIs
export const CourrierMaster = {
	getAll: "api/masters/courrier/getAll",
	add: "api/masters/courrier/add",
	update: "api/masters/courrier/update",
	delete: "api/masters/courrier/delete",

};

// Qualification Master APIs
export const ZoneStateMaster = {
	add: "api/masters/zone-state/addData",
	update: "api/masters/zone-state/updateData",
	getAll: "api/masters/zone-state/getAllData",
	delete: "api/masters/zone-state/deleteData",

};

// Qualification Master APIs
export const stateGodownMaster = {
	add: "api/masters/state-godown/addData",
	update: "api/masters/state-godown/updateData",
	getAll: "api/masters/state-godown/getAllData",
	delete: "api/masters/state-godown/deleteData",

};
export const salesIftPayment = {
	getVirtualAccountData: 'api/middleware/payments/getVirtualAccounts',
	addData: 'api/middleware/payments/reconcile',
	getVirtualAccountDetails: 'api/middleware/payments/getVirtualAccountsDetails',
	getVirtualAccountDetailsNew: 'api/middleware/payments/getVirtualAccountsDetailsNew',
	vaErrorList: 'api/middleware/payments/va/errors',
	vaErrorAdjust: 'api/middleware/payments/va/adjust'
}
export const InsiderSales = {
	getInsiderListData: 'api/sales/insiderSales/getInsiderListData'
}

export const account_audit_reports = {
	// addbond: "api/logistics/logistics_charges/addbond",
	// getBondData: "api/logistics/logistics_charges/getBondData",
	// getTransporter: "api/logistics/logistics_charges/getTransporter",
	// getTransporterCharges: "api/logistics/logistics_charges/getTransporterCharges",
	// addTransporterData: "api/logistics/logistics_charges/addTransporterData",
	// getChargesList: "api/logistics/logistics_charges/getChargesList",
	// // 
	// getMyChargesList: "api/logistics/logistics_charges/getMyChargesList",
	// // 
	// getChaCharges: "api/logistics/logistics_charges/getChaCharges",
	// addChaData: "api/logistics/logistics_charges/addChaData",
	// getLoadingCrossingCharges: "api/logistics/logistics_charges/getLoadingCrossingCharges",
	getTypeWiseCharges: "api/logistics/logistics_charges_report/getTypeWiseCharges",

};

// Analytics APIs
export const Analytics = {
	getSalesHistory: "api/analytics/getSalesHistory",
	getSalesPurchaseAverage: "api/analytics/getSalesPurchaseAverage",
	getInactiveSalesAccounts: "api/analytics/getInactiveSalesAccounts",
	getBuyingGrade: 'api/analytics/getBuyingGrade',
	getOrgSummaryview: 'api/analytics/getOrgSummaryview'
}

// RENT TYPE MASTER
export const RentTypeMasters = {
	addData: "api/masters/rentTypeMaster/add",
	updateData: "api/masters/rentTypeMaster/update",
	getOne: "api/masters/rentTypeMaster/getOne",
	deleteData: "api/masters/rentTypeMaster/delete",
	getAllRentTypeList: "api/masters/rentTypeMaster/getRentTypeMasterList",
}

// Rent Type Master

export const rentType = {
	getAll: "api/masters/rentTypeMaster/getRentTypeMasterList",
	getOne: "api/masters/rentTypeMaster/getOne",
	add: "api/masters/rentTypeMaster/add",
	update: "api/masters/rentTypeMaster/update",
	delete: "api/masters/rentTypeMaster/delete"
};


export const godownStock = {
	getAll: "api/inventory/inventoryStock/getAllData",
	update: "api/inventory/inventoryStock/updateData",
	updateGodown: "api/inventory/inventoryStock/updateGodown",
	updateGrade: "api/inventory/inventoryStock/updateGrade",
	splitQuantity: "api/inventory/inventoryStock/splitQuantity",
	deleteOne: "api/inventory/inventoryStock/deleteOne"
};

// Payment CAtegory Master

export const paymentCategory = {
	getAll: "api/masters/payment-category/getAllData",
	getOne: "api/masters/payment-category/getOne",
	add: "api/masters/payment-category/addData",
	update: "api/masters/payment-category/updateData",
	delete: "api/masters/payment-category/deleteData",
};



export const inventoryRedis = {
	getUnsoldSummaryRedis: "api/forex/getUnsoldSummaryRedis",
	getholdImportLocal: "api/forex/getholdImportLocal",
	addUpdateHoldImport: "api/forex/addUpdateHoldImport",
	addUpdateHoldLocal: "api/forex/addUpdateHoldLocal",
	getAllHoldImportLocal: "api/forex/getAllHoldImportLocal",
	updateAllocationCheckImportLocal: "api/forex/updateAllocationCheckImportLocal",
	calculateUnsold: "api/forex/calculateUnsold",
	unsoldWhatsApp: "api/forex/unsoldWhatsApp",
	setDefaultAllocateHold: "api/forex/setDefaultAllocateHold",
};

export const dumpYardReports = {
	getLcOpenSummaryData: "api/forex/total_lc_open_summary",
	getForwardBokkingAvgPrice: "api/forex/forward_booking_avg_price",
	getHedgedUnhedgedSummary: "api/forex/get_hedged_unhedged_summary",

};

export const CentralizeCommunication = {
	getWhatsappReport: "api/whatsapp/centralizeCommunication/getWhatsappReport",
	getEmailReport: "api/whatsapp/centralizeCommunication/getEmailReport",
};

export const WhatsappBroadcastCategorywize = {
	getCategoryWise: "api/whatsapp/centralizeCommunication/getCategoryWise",
	updateTransferStatus: "api/whatsapp/centralizeCommunication/updateTransferStatus",
	sendWhatsappVideo: "api/whatsapp/sendVideo"
};

export const WhatsappBroadcastZonewize = {
	getZoneWize: "api/whatsapp/centralizeCommunication/getZoneWize",
	sendWhatsappVideo: "api/whatsapp/sendVideo"
	// getcontactData: "api/whatsapp/centralizeCommunication/getcontactData",
};

export const emailBroadcast = {
	sendMailBroadcast: "api/whatsapp/centralizeCommunication/sendMailBroadcast",

};
export const SurishaBroadcast = {
	surishaSaleOfferWhastappImg: "api/whatsapp/sendImage",
	surishaSaleOfferWhastappAttachment: "api/whatsapp/send",

};


// Middleware Payments Utilization Revamp
export const MiddlewarePaymentsUtilizationRevamp = {
	add: "api/middlewareRevamp/middlewarePaymentsUtilization/addData",
	update: "api/middlewareRevamp/middlewarePaymentsUtilization/updateData",
	delete: "api/middlewareRevamp/middlewarePaymentsUtilization/deleteData",
	getOne: "api/middlewareRevamp/middlewarePaymentsUtilization/getOneData",
	getMiddlewareUtilizedPayments: "api/middlewareRevamp/middlewarePaymentsUtilization/getMiddlewareUtilizedPayments",
	getOldMiddlewareUtilizedPayments: "api/middlewareRevamp/middlewarePaymentsUtilization/getOldMiddlewareUtilizedPayments",
	transferData: "api/middlewareRevamp/middlewarePaymentsUtilization/transferData",
	deleteMiddlewareInvoice: "api/middlewareRevamp/middlewarePaymentsUtilization/deleteMiddlewareInvoice",
	getSubOrgInvoiceList: "api/middlewareRevamp/middlewarePaymentsUtilization/getSubOrgInvoiceList",
	getSubOrgSalesOrdersList: "api/middlewareRevamp/middlewarePaymentsUtilization/getSubOrgSalesOrdersList",
	removePayment: "api/middlewareRevamp/middlewarePaymentsUtilization/removePayment",
	adjustPayment: "api/middlewareRevamp/middlewarePaymentsUtilization/adjustPayment",
	swapImportLocal: "api/middlewareRevamp/middlewarePaymentsUtilization/swapImportLocal",
	getChanges: "api/middlewareRevamp/middlewarePaymentsUtilization/getChanges",
};


// Admin Control
export const AdminControl = {
	getAttendanceEmployees: "api/admin/getAttendanceEmployees",
	updateEmployeeAttendance: "api/admin/updateEmployeeAttendance",
	updateEmployeeLeaves: "api/admin/updateEmployeeLeaves"
};

// Plast India
export const PlastIndia = {
	getAllData: "api/plastIndia/scanner/getAllData"
};

// Sub-Organization TDS
export const SubOrgTDS = {
	add: "api/masters/subOrgTDS/addData",
	update: "api/masters/subOrgTDS/updateData",
	delete: "api/masters/subOrgTDS/deleteData",
	getSubOrgList: "api/masters/subOrgTDS/getSubOrgList"
};

// supplier Quantity
export const supplierQuantity = {
	getSupplierWiseQuantity: "api/forex/supplierQuantity",
};


// supplier Quantity
export const FreightRate = {
	freightRateResult: "api/sales/freightRateResult/getAll",
};

//surisha Sale Purchase
export const SurishaSalePurchase = {
	surishaSalePurchaseTrack: "api/sales/surishaSalesPurchase/surishaSalePurchaseTrack",
	surishaSaleEtaplanning: "api/sales/surishaSalesPurchase/surishaSaleEtaplanning",
	sendMailETA: "api/sales/surishaSalesPurchase/sendMailETA",
	getETAEmail: "api/sales/surishaSalesPurchase/getETAEmail",
	addETAEmail: "api/sales/surishaSalesPurchase/addETAEmail",
	surishaSalesPendingLink: "api/sales/surishaSalesPurchase/surishaSalesPendingLink",
	surishaCustomerSales: "api/sales/surishaSalesPurchase/surishaCustomerSales",
	surishaCustomerSalesOrder: "api/sales/surishaSalesPurchase/surishaCustomerSalesOrder",
	sendAllOrderMail: "api/sales/surishaSalesPurchase/sendAllOrderMail",
}

//cron function

export const crons = {
	arrivalReport: "api/arrivalReport",
	localPurchaseMonthly: "api/purchaseMonthly",
	localPurchaseDaily: "api/purchaseDaily",
	cspReport: "api/cspReport",
	cspReportMonthly: "api/cspReportMonthly",
	unsoldSpipl: "api/unsold_wa_spipl",
	unsoldPEPP: "api/unsold_wa_pepp",
	unsoldSurisha: "api/unsold_wa_surisha",
	unsoldPVCRelease: "api/unsold_wa_pvc_release",
	unsoldPEPPRelease: "api/unsold_wa_pepp_release",
	unsoldPVCReleaseGodownWise: "api/unsold_godown_wise_spipl",
	usoldPvcReleaseWhatsapp: "api/usoldPvcReleaseWhatsapp",
	salesDispatchReportDaily: 'api/salesDispatchReportDaily',
	salesDispatchReportMonthly: 'api/salesDispatchReportMonthly'
}

//Local Purchase Charges

export const localPurchaseDashboard = {
	localPurchaseSummary: "api/local_purchase/dashboard/localPurchaseSummary",
	getSupplierWiseAverage: "api/local_purchase/dashboard/getSupplierWiseAverage",
	getManufacturerAvg: "api/local_purchase/dashboard/getManufacturerAvg",


}

//Marketing

export const Marketing = {
	addData: "api/marketing/import-data/addData",
	getData: "api/marketing/import-data/getData",
	getProducts: "api/marketing/import-data/getProducts",



}

//master Template 

export const salesTemplate = {
	getTemplate: "api/masters/template/getTemplateType",
	getTemplateContent: "api/masters/template/getTemplateContent",
	getTemplateForm: "api/masters/template/getTemplateForm"
}

//surishaOps

export const materialArrivalChart = {
	getmaterialArrivalDet: "api/sales/surishaSalesPurchase/materialArrivalChart",
}
