import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDashboardComponent } from './import-dashboard.component';

describe('ImportDashboardComponent', () => {
  let component: ImportDashboardComponent;
  let fixture: ComponentFixture<ImportDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
