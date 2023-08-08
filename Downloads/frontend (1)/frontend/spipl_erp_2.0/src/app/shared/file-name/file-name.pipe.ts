import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {

  transform(filePath: any): any {
    const name = filePath.split('/');
    let length = name.length;
    let fileName = name[length-1];
    fileName =   fileName.replace(/%20/g, " ");
    fileName =   fileName.replace(/%26/g, "&");
    fileName =   fileName.replace(/%24/g, "$");
    fileName =   fileName.replace(/%25/g, "%");
    fileName =   fileName.replace(/%40/g, "@");
    fileName =   fileName.replace("\"]","");
      fileName =   fileName.replace("-","");
  
     
    return fileName;
  }

}
