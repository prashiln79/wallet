import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export type ThemeType = 'light-theme' | 'dark-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitchingService {

  private renderer: Renderer2;
  public currentTheme: BehaviorSubject<ThemeType> = new BehaviorSubject<ThemeType>('dark-theme');
  private previousClass: ThemeType ='dark-theme';
  public body = this.document.body;

  constructor(rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document) {
      this.renderer = rendererFactory.createRenderer(null, null);
    this._switchTheme();
  }

  private _switchTheme() {
    this.currentTheme.subscribe((theme: ThemeType) => {
      this.renderer.removeClass(this.body,  this.previousClass)
      this.renderer.addClass(this.body, theme);
      this.previousClass = theme;
    })
  }
}
