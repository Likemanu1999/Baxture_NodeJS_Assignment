import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MouMasterComponent } from './mou-master.component';

describe('MouMasterComponent', () => {
  let component: MouMasterComponent;
  let fixture: ComponentFixture<MouMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MouMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MouMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
