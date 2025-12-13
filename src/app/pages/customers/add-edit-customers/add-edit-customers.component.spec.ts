import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCustomersComponent } from './add-edit-customers.component';

describe('AddEditCustomersComponent', () => {
  let component: AddEditCustomersComponent;
  let fixture: ComponentFixture<AddEditCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
