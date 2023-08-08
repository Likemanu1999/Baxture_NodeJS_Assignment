import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFormSpiplSsurishaComponent } from './add-form-spipl-ssurisha.component';

describe('AddFormSpiplSsurishaComponent', () => {
  let component: AddFormSpiplSsurishaComponent;
  let fixture: ComponentFixture<AddFormSpiplSsurishaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFormSpiplSsurishaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFormSpiplSsurishaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
