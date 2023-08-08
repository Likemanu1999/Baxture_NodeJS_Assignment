import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcPurchareReportsComponent } from './ilc-purchare-reports.component';

describe('IlcPurchareReportsComponent', () => {
  let component: IlcPurchareReportsComponent;
  let fixture: ComponentFixture<IlcPurchareReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcPurchareReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcPurchareReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
