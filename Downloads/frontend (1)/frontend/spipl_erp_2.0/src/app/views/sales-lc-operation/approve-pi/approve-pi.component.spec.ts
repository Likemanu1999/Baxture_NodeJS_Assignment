import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovePiComponent } from './approve-pi.component';

describe('ApprovePiComponent', () => {
  let component: ApprovePiComponent;
  let fixture: ComponentFixture<ApprovePiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovePiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovePiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
