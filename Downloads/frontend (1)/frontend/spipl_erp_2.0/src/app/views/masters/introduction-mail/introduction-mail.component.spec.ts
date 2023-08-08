import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionMailComponent } from './introduction-mail.component';

describe('IntroductionMailComponent', () => {
  let component: IntroductionMailComponent;
  let fixture: ComponentFixture<IntroductionMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntroductionMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroductionMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
