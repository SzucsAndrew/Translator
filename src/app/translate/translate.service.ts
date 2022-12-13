import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Detection } from './models/detection.model';
import { Language } from './models/language.model';
import { Translate } from './models/translate.model';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  constructor(private http: HttpClient) { }

  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${environment.baseUrl}/languages`);
  }

  detect(text: string): Observable<Detection[]> {
    const formData = new FormData();
    formData.append('q', text);
    return this.http.post<Detection[]>(`${environment.baseUrl}/detect`, formData);
  }

  translate(text: string, source: string, targer: string): Observable<Translate> {
    const formData = new FormData();
    formData.append('q', text);
    formData.append('source', source);
    formData.append('target', targer);
    formData.append('format', 'text');

    return this.http.post<Translate>(`${environment.baseUrl}/translate`, formData);
  }
}
