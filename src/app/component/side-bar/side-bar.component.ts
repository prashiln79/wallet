import { Component } from '@angular/core';
import { ThemeSwitchingService, ThemeType } from '../../util/service/theme-switching.service';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {

  constructor(private _themeSwitchingService:ThemeSwitchingService){

  }

  public changeTheme(theme:ThemeType,drawer:any){
    this._themeSwitchingService.currentTheme.next(theme);
    drawer.toggle()
  }
}
