import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalLcOpenSummaryComponent } from './total-lc-open-summary.component';

describe('TotalLcOpenSummaryComponent', () => {
  let component: TotalLcOpenSummaryComponent;
  let fixture: ComponentFixture<TotalLcOpenSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalLcOpenSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalLcOpenSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
