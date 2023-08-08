import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierMasterComponent } from './courier-master.component';

describe('CourierMasterComponent', () => {
  let component: CourierMasterComponent;
  let fixture: ComponentFixture<CourierMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourierMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
