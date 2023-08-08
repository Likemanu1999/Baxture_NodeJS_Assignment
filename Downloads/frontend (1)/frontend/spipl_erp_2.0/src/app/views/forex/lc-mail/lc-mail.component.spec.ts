import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LcMailComponent } from './lc-mail.component';

describe('LcMailComponent', () => {
  let component: LcMailComponent;
  let fixture: ComponentFixture<LcMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LcMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LcMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
