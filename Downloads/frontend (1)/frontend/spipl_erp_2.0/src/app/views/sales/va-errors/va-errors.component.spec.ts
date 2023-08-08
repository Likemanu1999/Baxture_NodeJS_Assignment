import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VaErrorsComponent } from './va-errors.component';

describe('VaErrorsComponent', () => {
  let component: VaErrorsComponent;
  let fixture: ComponentFixture<VaErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VaErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VaErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
