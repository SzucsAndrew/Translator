import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | undefined>(undefined);
  private readonly maxTrialCount = 3;

  constructor(private storageService: StorageService, private router: Router) {
    const user = storageService.getLoggedInUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  public increaseTrialCount(): void {
    if (this.storageService.getTrialCount() < this.maxTrialCount) {
      this.storageService.increaseTrialCount();
    }
  }

  public hasTrial(): boolean {
    return this.storageService.getTrialCount() < this.maxTrialCount;
  }

  public login(username: string): void {
    const user = this.storageService.getUser(username);
    if (user) {
      this.storeUserAfterLogin(user);
      this.currentUserSubject.next(user);
      this.router.navigateByUrl('/translate');
    }
  }

  public hasPrivilege(): boolean {
    return this.isLoggedIn() || this.hasTrial();
  }

  public logout(): void {
    this.clearLocalStorage();
    this.currentUserSubject.next(undefined);
    if (this.hasTrial()) {
      this.router.navigateByUrl('/translate');
    }
    else {
      this.router.navigateByUrl('/registration');
    }
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== undefined;
  }

  public registration(username: string, email: string, phoneNumber: string, termsAccepted: boolean): void {
    this.storageService.saveUser(username, email, phoneNumber, termsAccepted);
  }

  get currentUser(): Observable<User | undefined> {
    return this.currentUserSubject.asObservable();
  }

  private clearLocalStorage(): void {
    this.storageService.cleareLoggedInUser();
  }

  private storeUserAfterLogin(user: User): void {
    this.storageService.saveLoggedInUser(user);
  }
}
