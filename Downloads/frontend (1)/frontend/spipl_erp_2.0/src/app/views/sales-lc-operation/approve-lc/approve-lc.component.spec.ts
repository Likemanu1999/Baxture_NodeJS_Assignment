import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveLcComponent } from './approve-lc.component';

describe('ApproveLcComponent', () => {
  let component: ApproveLcComponent;
  let fixture: ComponentFixture<ApproveLcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveLcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveLcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
