import { Component, NgZone, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CommonModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Mitron-Portal';
  isLoading: boolean = false;
  isAuthPage = false;
  isAppReady = false;
  isLoading$: Observable<boolean>;


  constructor(private router: Router, private loadingService: LoadingService, private zone: NgZone,) {
    this.isLoading$ = this.loadingService.loading$;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.isAuthPage = url.startsWith('/login') || url.startsWith('/signup');
        if (this.isAuthPage) sessionStorage.clear();

        setTimeout(() => (this.isAppReady = true));
        // this.zone.run(() => this.isAppReady = true);
      });
  }
}
