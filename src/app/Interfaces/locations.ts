
export interface Location {
id:number,
name:string,
type:string,
dimension:string,
residents:[],
url:string,
created:string,

}

export interface LocationEntries {
  info:{
    count:number,
    pages:string,
    next:string,
    prev:string
  },
  results:
    Location[]

}




