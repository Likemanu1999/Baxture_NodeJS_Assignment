import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRateMasterComponent } from './interest-rate-master.component';

describe('InterestRateMasterComponent', () => {
  let component: InterestRateMasterComponent;
  let fixture: ComponentFixture<InterestRateMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterestRateMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestRateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
