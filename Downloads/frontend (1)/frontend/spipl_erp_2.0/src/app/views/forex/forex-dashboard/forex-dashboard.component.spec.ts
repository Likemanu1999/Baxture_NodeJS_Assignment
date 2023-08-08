import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexDashboardComponent } from './forex-dashboard.component';

describe('ForexDashboardComponent', () => {
  let component: ForexDashboardComponent;
  let fixture: ComponentFixture<ForexDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForexDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForexDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
