import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndEditEventModal } from './create-and-edit-event-modal';

describe('CreateAndEditEventModal', () => {
  let component: CreateAndEditEventModal;
  let fixture: ComponentFixture<CreateAndEditEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndEditEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAndEditEventModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
