import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexSummaryComponent } from './forex-summary.component';

describe('ForexSummaryComponent', () => {
  let component: ForexSummaryComponent;
  let fixture: ComponentFixture<ForexSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForexSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForexSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
