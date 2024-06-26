import { Pipe, PipeTransform } from '@angular/core';
import { CurrentLangService } from '@shared/services/current-lang.service';
import { CorporatePolicyGridData } from 'app/admin/corporate-policy/corporate-policy.model';

@Pipe({
  name: 'policySearch'
})
export class PolicySearchPipe implements PipeTransform  {
  currentLang:string=''
  constructor(private currentLangService:CurrentLangService){
    this.currentLang = this.currentLangService.getCurrentLang();
  }


  transform(value: CorporatePolicyGridData[], searchTerm:string): unknown {
    if(value.length>0&&searchTerm.length>0){
      if(this.currentLang=='en'){
        
        return  value.filter((e)=>{
          return  e.enName.toLowerCase().includes(searchTerm)
        })
      }else{
        return  value.filter((e)=>{
          return  e.localeName.toLowerCase().includes(searchTerm)
        })
      }

    }
    else{
      return  value
    }
     
    
  }

}
