import {
  Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JupitarService } from '../../core/services/jupiter.service';

@Component({
  selector: 'app-media-card',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.css'
})
export class MediaCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('videoCardScrolls') videoCardScrolls!: QueryList<ElementRef>;

  filteredRows: any[] = [];
  arrowsVisibility: { left: boolean; right: boolean }[] = [];
  cardsPerSlide = 7;
  cardGap = 8;
  scrollAmount = 0;
  private screenSizeHandler = this.setLayout.bind(this);

  constructor(private jupitarService: JupitarService) {}

  ngOnInit(): void {
    this.setLayout();
    window.addEventListener('resize', this.screenSizeHandler);
    this.jupitarService.getMediaCategory().subscribe(mediaValue => {
      const content = mediaValue.data.category.frontPage || [];
      this.filteredRows = content.filter((row: any) => row.highTimeline && row.data?.length);
      this.arrowsVisibility = this.filteredRows.map(() => ({ left: false, right: true }));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateAllArrowVisibility();
      this.attachScrollListeners();
    });
    this.videoCardScrolls.changes.subscribe(() => {
      setTimeout(() => {
        this.updateAllArrowVisibility();
        this.attachScrollListeners();
      });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.screenSizeHandler);
  }

  private setLayout(): void {
    const screenWidth = window.innerWidth;
    this.cardsPerSlide = screenWidth > 1400 ? 7 : screenWidth > 1000 ? 5 : screenWidth > 600 ? 3 : 2;
    const arrowsWidth = 96, margin = 32;
    const available = screenWidth - arrowsWidth - margin;
    const cardWidth = (available - this.cardGap * (this.cardsPerSlide - 1)) / this.cardsPerSlide;
    this.scrollAmount = this.cardsPerSlide * (cardWidth + this.cardGap);
    const root = document.documentElement;
    root.style.setProperty('--nr-of-items', this.cardsPerSlide.toString());
    root.style.setProperty('--timeline-card-gap', `${this.cardGap}px`);
    root.style.setProperty('--timeline-button-width', `${arrowsWidth}px`);
    root.style.setProperty('--timeline-margin-left', '16px');
    setTimeout(() => this.updateAllArrowVisibility(), 100);
  }

  scrollRight(categoryIndex: number): void {
    const mediaRowContainer = this.videoCardScrolls.get(categoryIndex)?.nativeElement;
    mediaRowContainer?.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateArrowVisibility(categoryIndex), 400);
  }

  scrollLeft(categoryIndex: number): void {
    const mediaRowContainer = this.videoCardScrolls.get(categoryIndex)?.nativeElement;
    mediaRowContainer?.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateArrowVisibility(categoryIndex), 400);
  }

  private updateAllArrowVisibility(): void {
    this.filteredRows.forEach((_, categoryIndex) => this.updateArrowVisibility(categoryIndex));
  }

  private updateArrowVisibility(categoryIndex: number): void {
    const mediaRowContainer = this.videoCardScrolls.get(categoryIndex)?.nativeElement;
    if (!mediaRowContainer) return;
    const style = getComputedStyle(mediaRowContainer);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const scrollLeft = mediaRowContainer.scrollLeft;
    const visible = mediaRowContainer.offsetWidth;
    const scrollW = mediaRowContainer.scrollWidth - padLeft - padRight;
    const atStart = scrollLeft <= 2;
    const atEnd = scrollLeft + visible >= scrollW - 2;
    const fitsAll = scrollW <= visible + 2;
    this.arrowsVisibility[categoryIndex] = fitsAll ? { left: false, right: false } : { left: !atStart, right: !atEnd };
  }

  private attachScrollListeners(): void {
    this.videoCardScrolls.forEach((el, i) => {
      el.nativeElement.onscroll = () => this.updateArrowVisibility(i);
    });
  }

  getPhotoUrl(item: any): string {
    return item?.verticalPhotos?.[0]?.photoUrlBase;
  }

  isArrowVisible(categoryIndex: number, dirction: 'left' | 'right'): boolean {
    return this.arrowsVisibility[categoryIndex]?.[dirction] ?? false;
  }
}