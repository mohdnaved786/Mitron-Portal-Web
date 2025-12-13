import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
  id: number;         // ✅ Added this
  name: string;
  phonecode: string;
}

@Component({
  selector: 'app-country-selector',
  standalone: true, // ✅ if you’re importing it directly in AddEditCustomersComponent
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.css'],
})
export class CountrySelectorComponent implements OnInit {
  @Input() selectedCountry: Country | null = null;
  @Output() countryChange = new EventEmitter<Country>();

  countries: Country[] = [];
  filteredCountries: Country[] = [];
  showDropdown = false;
  searchControl = new FormControl('');

  private apiUrl =
    'https://kalam-demo-chat-01-ewhkenandagaeqcd.centralindia-01.azurewebsites.net/api/get-countries';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCountries().subscribe((res) => {
      // ✅ Include "id" from backend if it exists
      this.countries = res.map((c: any) => ({
        id: c.id, // important!
        name: c.name,
        phonecode: c.phonecode,
      }));
      this.filteredCountries = [...this.countries];

      if (this.selectedCountry) {
        this.searchControl.setValue(this.selectedCountry.name);
      }
    });

    this.searchControl.valueChanges.subscribe((value) => {
      this.filteredCountries = this.countries.filter(
        (c) =>
          c.name.toLowerCase().includes(value?.toLowerCase() || '') ||
          c.phonecode.includes(value || '')
      );
    });
  }

  fetchCountries(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  selectCountry(country: Country) {
    this.selectedCountry = country;
    this.searchControl.setValue(country.name);
    this.showDropdown = false;
    this.countryChange.emit(country); // ✅ Emits object with id, name, phonecode
  }
}
