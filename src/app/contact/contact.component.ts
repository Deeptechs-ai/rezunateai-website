import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

declare var data : any;
declare var particlesJS : any;

@Component({
	selector: 'app-contact',
	templateUrl: './contact.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./contact.component.css']
})

export class ContactComponent implements OnInit {
	public contactData = data['Contact'];
	public contactForm: FormGroup;
	public isSubmitting = false;
	public submitSuccess = false;
	public submitError = false;
	public errorMessage = '';

	// Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
	private formspreeEndpoint = 'https://formspree.io/f/xblpaojb';

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private formBuilder: FormBuilder,
		private http: HttpClient
	) {
		changeDetectorRef.detach();

		// Initialize contact form
		this.contactForm = this.formBuilder.group({
			name: ['', [Validators.required, Validators.minLength(2)]],
			email: ['', [Validators.required, Validators.email]],
			company: [''], // Optional field
			message: ['', [Validators.required, Validators.minLength(10)]]
		});

		// Subscribe to form value changes to trigger change detection
		this.contactForm.valueChanges.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}

	ngOnInit(): void {
		particlesJS.load('particles-js2');
		this.changeDetectorRef.detectChanges();
	}

	onSubmit(): void {
		if (this.contactForm.valid && !this.isSubmitting) {
			this.isSubmitting = true;
			this.submitSuccess = false;
			this.submitError = false;
			this.errorMessage = '';

			const formData = this.contactForm.value;

			this.http.post(this.formspreeEndpoint, formData).subscribe({
				next: () => {
					this.isSubmitting = false;
					this.submitSuccess = true;
					this.contactForm.reset();
					this.changeDetectorRef.detectChanges();

					// Hide success message after 5 seconds
					setTimeout(() => {
						this.submitSuccess = false;
						this.changeDetectorRef.detectChanges();
					}, 5000);
				},
				error: (error) => {
					this.isSubmitting = false;
					this.submitError = true;
					this.errorMessage = error.error?.error || 'Failed to send message. Please try again.';
					this.changeDetectorRef.detectChanges();
				}
			});
		}
	}

	// Helper method to check if a field has an error
	hasError(fieldName: string, errorType: string): boolean {
		const field = this.contactForm.get(fieldName);
		return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
	}
}
