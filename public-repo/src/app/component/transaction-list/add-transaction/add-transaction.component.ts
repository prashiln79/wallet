import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionComponent } from './transaction/transaction.component';

@Component({
  selector: 'add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.scss'
})
export class AddTransactionComponent {

    constructor(private _dialog:MatDialog){
      
    }

    openDialog() {
      const dialogRef = this._dialog.open(TransactionComponent);
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
}
