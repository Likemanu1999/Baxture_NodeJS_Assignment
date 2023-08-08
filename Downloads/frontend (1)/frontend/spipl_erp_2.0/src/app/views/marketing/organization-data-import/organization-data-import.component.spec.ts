import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDataImportComponent } from './organization-data-import.component';

describe('OrganizationDataImportComponent', () => {
  let component: OrganizationDataImportComponent;
  let fixture: ComponentFixture<OrganizationDataImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationDataImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationDataImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
