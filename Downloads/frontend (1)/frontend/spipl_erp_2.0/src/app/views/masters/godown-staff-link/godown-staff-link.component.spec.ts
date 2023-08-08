import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GodownStaffLinkComponent } from './godown-staff-link.component';

describe('GodownStaffLinkComponent', () => {
  let component: GodownStaffLinkComponent;
  let fixture: ComponentFixture<GodownStaffLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GodownStaffLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GodownStaffLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
