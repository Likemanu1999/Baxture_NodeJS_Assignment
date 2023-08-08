import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwayDeclarationFormComponent } from './eway-declaration-form.component';

describe('EwayDeclarationFormComponent', () => {
  let component: EwayDeclarationFormComponent;
  let fixture: ComponentFixture<EwayDeclarationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwayDeclarationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwayDeclarationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
