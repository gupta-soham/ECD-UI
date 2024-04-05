/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/


import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { SetLanguageService } from 'src/app/app-modules/services/set-language/set-language.service';
import { SupervisorService } from 'src/app/app-modules/services/supervisor/supervisor.service';


@Component({
  selector: 'app-call-reallocation',
  templateUrl: './call-reallocation.component.html',
  styleUrls: ['./call-reallocation.component.css']
})
export class CallReallocationComponent implements OnInit, DoCheck {
  recordType: any;
  phoneNoType: any;
  agentName: any;
  allocateTo: any;
  agent: any;
  allocate: any;
  agentType: any;
  isAllocateEnabled = false;
  isFormValid = false;
  isSubmitDisabled = true;
  isAllocateDisabled = true;
  enableAllocate = false;
  totalCount: any;
  currentMaxAllocatedRecords:any;
  enableAgentAllocation = false;
  callReallocationData: any = [];
  enableAgentUnallocation = false;
  formEnabled = false;
  selectedRadioButtonChange = false;
  selectedRadioButton: any;
  reallocateEnabled = false;
  unallocateEnabled = false;
  userRoles: any;

  currentLanguageSet: any;
  languageData: any;
  agentList: any[] = [];
  agentNames: any[] = [];
  allocatesTo: any[] = [];
  agentRoles:any;
  maxDate = new Date();

  recordData = [
    {
      id: 1,
      name: "Mother",
    },
    {
      id: 2,
      name: "Child",
    },
  ];

  phoneNumber = [
    {
      id: 1,
      name: "Self",
    },
    {
      id: 2,
      name: "Others",
    }
  ];
  
  @Input() minValue = 1;
  @Input() maxValue = 10;
  range = new FormGroup({
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
  });
  rolesArr: any;
  selectedRoleName: any;
  agentArr: any = [];
  isDisableUnallocateButton = true;
  
  constructor(
    private supervisorService: SupervisorService,
    private confirmationService: ConfirmationService,
    private setLanguageService: SetLanguageService,
    private masterService: MasterService) { }

  ngOnInit(): void {
    console.log("Allocation", this.enableAllocate);
    this.getMasterData();
    this.range.valueChanges.subscribe(() => {
      this.checkSubmitDisabledButton();
    });
  }

  ngDoCheck(){
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null)
      this.currentLanguageSet = this.setLanguageService.languageData;
    else {
      this.changeLanguage('English');
    }
  }

  changeLanguage(language: string) {
    this.setLanguageService.getLanguageData(language).subscribe(data => {
      this.languageData = data;
    });
  }

  callReallocationForm = new FormGroup({
    selectedRadioButton: new FormControl('', [Validators.required]),
    agentTypes: new FormControl('', [Validators.required]),
    agentName: new FormControl('', [Validators.required]),
    recordType: new FormControl('', [Validators.required]),
    phoneNoType: new FormControl('', [Validators.required]),
  });

  callReallocateForm = new FormGroup({
    allocateTo: new FormControl('', [Validators.required]),
    numericValue: new FormControl('', [Validators.required]),
  });

  getMasterData() {
    const psmId = sessionStorage.getItem('providerServiceMapID');
    // var psmId = sessionStorage.getItem('providerServiceMapID');
    this.masterService.getRoleMaster(psmId).subscribe((res:any)=>{
      if(res){
        this.agentList = res;
        this.rolesArr = [];
     
        this.agentList.filter((values:any) => {
          if (values.roleName.toLowerCase() === "associate" || values.roleName.toLowerCase() === "anm" || values.roleName.toLowerCase() === "mo") {
              this.rolesArr.push(values);
          }
        });
      }
    })
   
    
    
  }

  onClickOfRoles(event: any) {
    this.agentRoles= event.value;
    this.checkSubmitDisabledButton();

    this.agentNames = [];
    this.allocatesTo = [];
    this.callReallocationForm.controls.agentName.patchValue(null);
    this.masterService.getAgentMasterByRoleId(this.agentRoles).subscribe((response:any)=>{
      if(response){
        this.agentNames = response;
        this.allocatesTo = response;
      }
    })

  }

  onClickOfAgents(event: any) {
   
    this.agentName = event.value;
    this.checkSubmitDisabledButton();
  
    console.log(this.agentName);
  }

  onClickOfRecordType(event: any) {
    this.recordType = event.value;
    this.checkSubmitDisabledButton();
    console.log(this.recordType);
  }

  onClickOfPhoneNoType(event: any) {
    this.phoneNoType = event.value;
    this.checkSubmitDisabledButton();
    console.log(this.phoneNoType);
  }

  checkSubmitDisabledButton() {
    if (this.callReallocationForm.controls.agentTypes.value &&
      this.callReallocationForm.controls.agentName.value && 
      this.callReallocationForm.controls.recordType.value && 
      this.callReallocationForm.controls.phoneNoType.value &&
      this.range.controls.start.value && 
      this.range.controls.end.value) {
      this.isSubmitDisabled = false;
    } else {
      this.isSubmitDisabled = true;
    }
  }

  setAgentRoleName(roleName:any) {
this.selectedRoleName = roleName;
  }

  onSubmit() {
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

   
  
   

    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": [
        0
      ],
      "userId": this.callReallocationForm.controls.agentName.value,
      "roleId": this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": sessionStorage.getItem('providerServiceMapID'),
      "createdBy": sessionStorage.getItem("userName"),
      "tdate": toDate,
      "fdate": fromDate
    };
    this.supervisorService.getAllocatedCounts(reqObj).subscribe((res: any) =>
    {
        if(res) {
          this.isDisableUnallocateButton = true;
          this.totalCount = res.totalCount;
          this.currentMaxAllocatedRecords = this.totalCount;
          this.callReallocateForm.controls.allocateTo.patchValue(null);
          this.callReallocateForm.controls.numericValue.patchValue(this.totalCount);
       this.enableUnallocateReallocateButton();
          this.enableAllocate = true;

          this.agentArr = [];
          this.allocatesTo.filter((values:any) => {
            if (values.userId !==  this.callReallocationForm.controls.agentName.value) {
                this.agentArr.push(values);
            }
          });
          // this.selectedRoleName = null;
        }
        else {
          this.confirmationService.openDialog(this.currentLanguageSet.noDataFound, `info`);
          this.enableAllocate = false;
        }
    })
    this.enableAgentAllocation = true;
    if(this.callReallocationForm.controls['selectedRadioButton'].value === '1') {
      this.reallocateEnabled = true;
      this.unallocateEnabled = false;
    } else{
      this.unallocateEnabled = true;
      this.reallocateEnabled = false;
    }
  }

  onClickOfAllocateTo() {
 
  if(this.callReallocateForm.controls.allocateTo.value !== undefined && this.callReallocateForm.controls.allocateTo.value !== null && 
    this.callReallocateForm.controls.allocateTo.value.length > 0) {
  this.currentMaxAllocatedRecords   =  this.totalCount / this.callReallocateForm.controls.allocateTo.value.length; 
    }
    else {
      this.currentMaxAllocatedRecords = 0;
    }
    this.currentMaxAllocatedRecords = Math.trunc(this.currentMaxAllocatedRecords);
    this.callReallocateForm.controls.numericValue.patchValue(this.currentMaxAllocatedRecords);

    this.enableUnallocateReallocateButton();
  }

  onClickOfAllocate() {
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

    const userIdString = sessionStorage.getItem('userId');
    const roleIdString = sessionStorage.getItem('roleId');
    const psmIdString = sessionStorage.getItem('providerServiceMapID');

  

    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": this.callReallocateForm.controls.allocateTo.value,
      "userId":this.callReallocationForm.controls.agentName.value,
      "noOfCalls": this.callReallocateForm.controls.numericValue.value,
      "roleId":  this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": sessionStorage.getItem('providerServiceMapID'),
      "createdBy": sessionStorage.getItem("userName"),
      "tdate": toDate,
      "fdate": fromDate
    };
    this.supervisorService.updateReallocateCalls(reqObj).subscribe((res: any) =>
    {
        if(res && res.response !== null) {
          this.isSubmitDisabled = false;
          this.confirmationService.openDialog(res.response, `success`);
          // this.confirmationService.openDialog(this.currentLanguageSet.callsReallocatedSuccessfully, `success`);
          this.callReallocateForm.reset();
          this.enableAgentAllocation = false;
          // this.selectedRoleName = null;
        }
        else {
          this.confirmationService.openDialog(res.errorMessage, 'error');
          this.enableAllocate = false;
        }
    },
    (err: any) => {
    if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
    else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
    this.isSubmitDisabled = false;
  }

  onClickOfBin() {
  
    const fromDate =  moment(this.range.controls.start.value).format('YYYY-MM-DDThh:mm:ssZ');
    const toDate =  moment(this.range.controls.end.value).format('YYYY-MM-DDThh:mm:ssZ');

   
 
    


    const reqObj = {
      "fromUserIds": [
        0
      ],
      "toUserIds": [
        0
      ],
      "userId":this.callReallocationForm.controls.agentName.value,
      "noOfCalls": this.callReallocateForm.controls.numericValue.value,
      "roleId":  this.callReallocationForm.controls.agentTypes.value,
      "roleName": this.selectedRoleName,
      "recordType": this.callReallocationForm.controls.recordType.value,
      "phoneNoType": this.callReallocationForm.controls.phoneNoType.value,
      "psmId": sessionStorage.getItem('providerServiceMapID'),
      "createdBy": sessionStorage.getItem("userName"),
      "isIntroductory": this.selectedRoleName.toLowerCase() === 'associate' ? true : false,
      "tdate": toDate,
      "fdate": fromDate
    };
    this.supervisorService.deleteReallocatedCalls(reqObj).subscribe((res: any) =>
    {
        if(res && res.response !== null) {
          this.confirmationService.openDialog(res.response, `success`);
          // this.confirmationService.openDialog(this.currentLanguageSet.recordsDeletedSuccessfully, `success`);
          this.callReallocateForm.reset();
          this.enableAgentAllocation = false;
          this.isDisableUnallocateButton = true;
          // this.selectedRoleName = null;
        } 
        else {
          this.confirmationService.openDialog(res.errorMessage, 'error');
        }
    },
    (err: any) => {
    if(err && err.error)
      this.confirmationService.openDialog(err.error, 'error');
    else
      this.confirmationService.openDialog(err.title + err.detail, 'error')
    });
  }

  onRadioButtonChange() {
    this.selectedRadioButtonChange = true;
    this.reallocateEnabled = false;
    this.unallocateEnabled = false;
    this.enableAgentAllocation = false;
    this.callReallocationForm.reset();
    this.callReallocateForm.reset();
    this.range.reset();
  }
enableUnallocateReallocateButton() {
  if(this.callReallocateForm.controls.numericValue.value !== null && parseInt(this.callReallocateForm.controls.numericValue.value) > 0 && parseInt(this.callReallocateForm.controls.numericValue.value) <= this.currentMaxAllocatedRecords) {
      this.isDisableUnallocateButton = false
  }
  else
  {
    this.isDisableUnallocateButton = true
  }
}

}
