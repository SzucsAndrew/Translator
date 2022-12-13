import { Injectable } from '@angular/core';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly userKey = 'userKey';
  private readonly loggedInUserKey = 'loggedInUser';
  private readonly trialCount = 'trialCount';
  private readonly trialStart = 0;
  constructor() {
    this.init();
  }

  private init(): void {
    this.getTrialCount();
  }

  public saveUser(username: string, email: string, phoneNumber: string, termsAccepted: boolean): void {
    const user = new User(username, email, phoneNumber, termsAccepted);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  public getUser(username: string): User | undefined {
    const rawUser = localStorage.getItem(this.userKey);
    if (rawUser) {
      const user: User = JSON.parse(rawUser);
      if (user.name === username) {
        return user;
      }
    }

    return undefined;
  }

  public getTrialCount(): number {
    const rawCount = localStorage.getItem(this.trialCount);
    if (rawCount) {
      return JSON.parse(rawCount);
    }

    return this.createTrialCount();
  }

  public increaseTrialCount(): void {
    let count = this.getTrialCount();
    this.saveTrialCount(++count);
  }

  private saveTrialCount(count: number): void {
    localStorage.setItem(this.trialCount, JSON.stringify(count));
  }

  private createTrialCount(): number {
    this.saveTrialCount(this.trialStart);

    return this.trialStart;
  }

  public cleareLoggedInUser(): void {
    localStorage.removeItem(this.loggedInUserKey);
  }

  public saveLoggedInUser(user: User): void {
    localStorage.setItem(this.loggedInUserKey, JSON.stringify(user));
  }

  public getLoggedInUser(): User | undefined {
    const rawUser = localStorage.getItem(this.loggedInUserKey);
    if (rawUser) {
      return JSON.parse(rawUser);
    }

    return undefined;
  }
}
