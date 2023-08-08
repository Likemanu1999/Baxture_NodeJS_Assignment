import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HedgedUnhedgedSummaryComponent } from './hedged-unhedged-summary.component';

describe('HedgedUnhedgedSummaryComponent', () => {
  let component: HedgedUnhedgedSummaryComponent;
  let fixture: ComponentFixture<HedgedUnhedgedSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HedgedUnhedgedSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HedgedUnhedgedSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
