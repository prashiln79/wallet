import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';



@NgModule()
export class IconModule {

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    // <----- Register custom icon sets  ----->
    this.matIconRegistry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system-uicons.svg')
    );

     // <----- Register individual icon <mat-icon svgIcon="test"></mat-icon>----->
    this.matIconRegistry.addSvgIcon(
      'test',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/test.svg')
    );
  }
 }
