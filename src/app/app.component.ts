import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LineChartComponent } from './line-chart/line-chart.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LineChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
