import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MediaCardComponent } from './components/media-card/media-card.component';

@Component({
  selector: 'app-root',
  imports: [ MediaCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'jupiter-media';
}
