import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesHeadMasterComponent } from './charges-head-master.component';

describe('ChargesHeadMasterComponent', () => {
  let component: ChargesHeadMasterComponent;
  let fixture: ComponentFixture<ChargesHeadMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargesHeadMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesHeadMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
