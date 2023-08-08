import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryViewComponent } from './salary-view.component';

describe('SalaryViewComponent', () => {
  let component: SalaryViewComponent;
  let fixture: ComponentFixture<SalaryViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalaryViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
