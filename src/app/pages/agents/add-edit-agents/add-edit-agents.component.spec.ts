import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAgentsComponent } from './add-edit-agents.component';

describe('AddEditAgentsComponent', () => {
  let component: AddEditAgentsComponent;
  let fixture: ComponentFixture<AddEditAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditAgentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
