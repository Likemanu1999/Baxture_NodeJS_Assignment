import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualCtcComponent } from './annual-ctc.component';

describe('AnnualCtcComponent', () => {
  let component: AnnualCtcComponent;
  let fixture: ComponentFixture<AnnualCtcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualCtcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualCtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
