import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsChargesFormComponent } from './tds-charges-form.component';

describe('TdsChargesFormComponent', () => {
  let component: TdsChargesFormComponent;
  let fixture: ComponentFixture<TdsChargesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TdsChargesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TdsChargesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
