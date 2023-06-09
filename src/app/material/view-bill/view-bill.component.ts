import { DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { GlobalConstants } from 'src/app/constants/global.constants';
import { PdfDataModel } from 'src/app/pdf/dataModel';
import { PdfComponent } from 'src/app/pdf/pdf.component';
import { BillService } from 'src/app/services/bill.service';
import { LoadingService } from 'src/app/services/shared/loading.service';
import { SnackbarService } from 'src/app/services/shared/snackbar.service';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { ViewBillProductComponent } from '../view-bill-product/view-bill-product.component';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.css']
})
export class ViewBillComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
 
  displayedColumns: string[] = ['name', 'email', 'contactNumber', 'paymentMethod', 'total', 'view']
  dataSource: any;
  responseMessage: any
  pdfData: any;
  childToggle = false;


  constructor(
    private snackBar: SnackbarService,
    private bill: BillService,
    public loadingSer: LoadingService,
    private dialogRef: MatDialog,
    private router: Router
  ) {
    this.tableData()
  }

  tableData() {
    this.bill.getBills().subscribe({
      next: (resp: any) => {
        console.log(resp)
        this.dataSource = new MatTableDataSource(resp);
        this.dataSource.paginator = this.paginator;
      },
      error: (err: HttpErrorResponse) => {
        this.responseMessage = (err.error.message) ? (err.error.message) : GlobalConstants.genericError;
        this.snackBar.openSnackBar(this.responseMessage, GlobalConstants.ERROR)
      }
    })
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();

  }

  handleViewAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      data: values
    }
    dialogConfig.width = "100%";
    const dialogRef = this.dialogRef.open(ViewBillProductComponent, dialogConfig)
    this.router.events.subscribe(() => dialogRef.close())
  }

  dowloadreportAtion(values: any) {
    try {
      let data = {
        name: values.name,
        email: values.email,
        uuid: values.uuid,
        contactNumber: values.contactNumber,
        paymentMethod: values.paymentMethod,
        totalAmount: values.total,
        productDetails: values.productDetails
      }
      this.pdfData = data;
      this.loadPdfComponent();
    } catch (err) {
      console.error(err)
    }

  }


  handleDeleteAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete ' + values.name + 'bill '
    }

    const dialogRef = this.dialogRef.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(
      (resp: any) => {
        this.deleteProduct(values.id)
        dialogRef.close();
      }
    )
  }

  deleteProduct(id: any) {
    this.bill.delete(id).subscribe({
      next: (resp: any) => {
        this.tableData();
        this.responseMessage = resp.message;
        this.snackBar.openSnackBar(this.responseMessage, GlobalConstants.SUCCESS)
      },
      error: (err: HttpErrorResponse) => {
        this.responseMessage = (err.error.message) ? (err.error.message) : GlobalConstants.genericError;
        this.snackBar.openSnackBar(this.responseMessage, GlobalConstants.ERROR)
      }
    })
  }

  /***************** PDF SEcTIOn**************** */

  handleChildOutput(data: any) {
    if (data && data.message) {
      console.log('Received data from child:', data);
    } else if (data && data.error) {
      console.log('Error occued in PDF genration')
      this.snackBar.openSnackBar(GlobalConstants.genericError, GlobalConstants.ERROR)
    }
    else {
      console.log(data);
      this.snackBar.openSnackBar(GlobalConstants.genericError, GlobalConstants.ERROR)
    }

    this.unloadPdfComponet();
  }

  loadPdfComponent = () => {
    this.childToggle = true;
  }

  unloadPdfComponet = () => {
    setTimeout(() => {
      this.childToggle = false;
    }, 0);

  }


  /***************** PDF SEcTIOn close**************** */

}
