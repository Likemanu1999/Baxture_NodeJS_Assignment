import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsMasterComponent } from './terms-master.component';

describe('TermsMasterComponent', () => {
  let component: TermsMasterComponent;
  let fixture: ComponentFixture<TermsMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
