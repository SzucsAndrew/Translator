import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;

  constructor(private authService: AuthService) {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required,
      Validators.pattern('([+]?[0-9]{2}[-| ]?[0-9]{2}[-| ]?[0-9]{3}[-| ]?[0-9]{4})')]),
      termsAccept: new FormControl('', [Validators.required, Validators.requiredTrue])
    });
  }

  ngOnInit(): void { }

  submitted(): void {
    const data = this.form.value;
    this.authService.registration(data.username, data.email, data.phoneNumber, data.termsAccept);
    this.authService.login(data.username);
  }
}
