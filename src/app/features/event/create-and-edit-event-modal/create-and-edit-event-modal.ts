import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { BackendService } from '../../../services/backend.service';
import { MessageService } from '../../../services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../../models/event';

@Component({
  selector: 'app-create-and-edit-event-modal',
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './create-and-edit-event-modal.html',
  styleUrl: './create-and-edit-event-modal.scss',
})
export class CreateAndEditEventModal {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() eventId: string = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() eventSaved = new EventEmitter<Event>();
  @Output() eventDeleted = new EventEmitter<string>();

  event: Event | null = null;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  isConfirmModalOpen: boolean = false;
  previewImageUrl: string | null = null;
  selectedImageFile: File | null = null;

  get isCreateMode(): boolean {
    return !this.eventId;
  }

  formData = {
    title: '',
    location: '',
    date: '',
    maxSpots: 10,
    description: ''
  };

  ngOnInit(): void {
    if (this.eventId) {
      this.loadEvent(this.eventId);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('eventId');
      if (id) {
        this.eventId = id;
        this.loadEvent(this.eventId);
      }
    });
  }

  get imageUrl(): string {
    return this.backendService.getEventPictureUrl(this.eventId);
  }

  handleImageError(event: globalThis.Event): void {
    (event.target as HTMLImageElement).src = '/event-placeholder.svg';
  }

  onImageSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  triggerImageUpload(input: HTMLInputElement): void {
    input.click();
  }

  close(): void {
    this.closeModal.emit();

    if (!this.closeModal.observed) {
      this.router.navigate(['/events']);
    }
  }

  save(): void {
    if (this.isSaving) return;
    if (this.isCreateMode) {
      this.createEvent();
    } else {
      this.updateEvent();
    }
  }

  private createEvent(): void {
    this.isSaving = true;
    this.backendService.createEvent({
        title: this.formData.title,
        location: this.formData.location,
        date: new Date(this.formData.date),
        maxSpots: this.formData.maxSpots,
        description: this.formData.description
      })
      .then(created => {
        this.messageService.showSuccessMessage('Event created successfully.', 3);
        this.eventSaved.emit(created);
        this.close();
      })
      .catch((err: any) => {
        this.messageService.showErrorMessage(this.getErrorMessage(err, 'Failed to create event.'), 5);
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  private updateEvent(): void {
    this.isSaving = true;
    this.backendService.updateEvent(this.eventId, {
        title: this.formData.title,
        location: this.formData.location,
        date: new Date(this.formData.date),
        maxSpots: this.formData.maxSpots,
        description: this.formData.description
      })
      .then(updated => {
        this.messageService.showSuccessMessage('Event updated successfully.', 3);
        this.eventSaved.emit(updated);
        this.close();
      })
      .catch((err: any) => {
        this.messageService.showErrorMessage(this.getErrorMessage(err, 'Failed to update event.'), 5);
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  requestDeleteEvent(): void {
    if (!this.eventId || this.isDeleting) return;
    this.isConfirmModalOpen = true;
  }

  handleDeleteModalResponse(confirmed: boolean): void {
    this.isConfirmModalOpen = false;
    if (!confirmed) return;

    this.deleteEvent();
  }

  private deleteEvent(): void {
    if (!this.eventId || this.isDeleting) return;

    this.isDeleting = true;

    this.backendService.deleteEvent(this.eventId)
      .then(() => {
        this.messageService.showSuccessMessage('Event deleted successfully.', 3);
        this.eventDeleted.emit(this.eventId);
        this.close();
      })
      .catch((err: any) => {
        this.messageService.showErrorMessage(this.getErrorMessage(err, 'Failed to delete event.'), 5);
      })
      .finally(() => {
        this.isDeleting = false;
      });
  }

  private loadEvent(id: string): void {
    if (!id) return;

    this.backendService.getEventById(id)
      .then(event => {
        this.event = event;
        this.formData = {
          title: event.title,
          location: event.location,
          date: this.toDateInputValue(event.date),
          maxSpots: event.maxSpots,
          description: event.description
        };
      })
      .catch((err: any) => {
        this.messageService.showErrorMessage(this.getErrorMessage(err, 'Failed to load event.'), 5);
        this.close();
      });
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (typeof err?.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }

    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message;
    }

    return fallback;
  }

  private toDateInputValue(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
