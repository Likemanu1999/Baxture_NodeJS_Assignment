import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsoldSummaryComponent } from './unsold-summary.component';

describe('UnsoldSummaryComponent', () => {
  let component: UnsoldSummaryComponent;
  let fixture: ComponentFixture<UnsoldSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsoldSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsoldSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
