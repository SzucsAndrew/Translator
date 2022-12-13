import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Detection } from '../models/detection.model';
import { Language } from '../models/language.model';
import { TranslateService } from '../translate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit, OnDestroy {
  isLoading = false;

  languages: Language[] = [];
  subject = new ReplaySubject<unknown>();
  sourceText: AbstractControl;
  targetText: AbstractControl;
  selectedLanguageSource: AbstractControl;
  selectedLanguageTarget: AbstractControl;

  selectedLanguageSourceSubscription!: Subscription;
  selectedLanguageTargetSubscription!: Subscription;

  form: FormGroup;
  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router) {
    this.form = new FormGroup({});

    this.sourceText = new FormControl('', Validators.required);
    this.targetText = new FormControl('');
    this.selectedLanguageSource = new FormControl(null, Validators.required);
    this.selectedLanguageTarget = new FormControl(null, Validators.required);

    this.form.addControl('sourceText', this.sourceText);
    this.form.addControl('targetText', this.targetText);
    this.form.addControl('selectedLanguageSource', this.selectedLanguageSource);
    this.form.addControl('selectedLanguageTarget', this.selectedLanguageTarget);
  }

  ngOnInit(): void {
    this.sourceText.valueChanges.subscribe(this.subject);
    this.subject.pipe(debounceTime(500)).subscribe(
      () => this.translateSource(),
      error => this.showError(error));

    this.translateService.getLanguages().subscribe(res => {
      this.languages = res;

      this.selectedLanguageSource.setValue(this.languages[0]);
      this.selectedLanguageTarget.setValue(this.languages[1]);

      this.selectedLanguageSourceSubscription =
        this.selectedLanguageSource.valueChanges.subscribe(() => this.translateSource());

      this.selectedLanguageTargetSubscription =
        this.selectedLanguageTarget.valueChanges.subscribe(() => this.translateSource());
    },
      error => this.showError(error));
  }

  translateSource(): void {
    if (!this.form.valid) { return; }

    if (!this.authService.hasPrivilege()) {
      this.router.navigateByUrl('/registration');
      return;
    }

    this.showLoading();
    this.translateService.translate(this.sourceText.value, this.selectedLanguageSource.value.code, this.selectedLanguageTarget.value.code)
      .subscribe(res => {
        this.targetText.setValue(res?.translatedText);
        if (!this.authService.isLoggedIn()) {
          this.authService.increaseTrialCount();
        }
        this.hideLoading();
      },
        error => this.showError(error));
  }

  detect(): void {
    const sourceTextValue = this.sourceText.value;
    if (sourceTextValue) {
      if (!this.authService.hasPrivilege()) {
        this.router.navigateByUrl('/registration');
        return;
      }

      this.showLoading();
      this.translateService.detect(sourceTextValue).subscribe(
        detections => { this.setHightestConfidence(detections); this.hideLoading(); },
        error => this.showError(error));
    }
  }

  setHightestConfidence(detections: Detection[]): void {
    const hightestConfidence = detections.find(x => x.confidence);
    if (!hightestConfidence) { return; }

    const possibleLanguage = this.languages.find(x => x.code === hightestConfidence.language);
    if (possibleLanguage) {
      this.selectedLanguageSource.setValue(possibleLanguage);
    }
  }

  swap(): void {
    if (!this.form.valid) { return; }

    this.swapControlsValues(this.selectedLanguageSource, this.selectedLanguageTarget, false);
    this.swapControlsValues(this.sourceText, this.targetText);
  }

  swapControlsValues(first: AbstractControl, sencond: AbstractControl, emitEvent: boolean = true): void {
    const tempValue = first.value;
    first.setValue(sencond.value, { emitEvent });
    sencond.setValue(tempValue, { emitEvent });
  }

  showLoading(): void {
    this.isLoading = true;
    this.disableSelectInputs();
  }

  hideLoading(): void {
    this.isLoading = false;
    this.enableSelectInputs();
  }

  disableSelectInputs(): void {
    this.selectedLanguageSource.disable({ emitEvent: false });
    this.selectedLanguageTarget.disable({ emitEvent: false });
  }

  enableSelectInputs(): void {
    this.selectedLanguageSource.enable({ emitEvent: false });
    this.selectedLanguageTarget.enable({ emitEvent: false });
  }

  showError(error: any): void {
    this.hideLoading();
    if (error instanceof HttpErrorResponse) {
      let message: string;

      if (error.error && error.error.hasOwnProperty('error')) {
        message = `Status: ${error.statusText} Error: ${error.error.error}`;
      }
      else {
        message = error.message;
      }

      this.snackBar.open(message, 'X');
    }
  }

  ngOnDestroy(): void {
    this.subject.unsubscribe();
    this.selectedLanguageSourceSubscription.unsubscribe();
    this.selectedLanguageTargetSubscription.unsubscribe();
  }
}
