import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesEtaPlanningComponent } from './sales-eta-planning.component';

describe('SalesEtaPlanningComponent', () => {
  let component: SalesEtaPlanningComponent;
  let fixture: ComponentFixture<SalesEtaPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesEtaPlanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesEtaPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
