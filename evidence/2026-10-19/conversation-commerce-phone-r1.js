async page=>{
 const fs=process.getBuiltinModule('fs'),path=process.getBuiltinModule('path');
 const source=fs.readFileSync(path.join(path.dirname(process.argv[1]),'release-commerce-phone-r9.js'),'utf8');
 const r=await Function('return ('+source+')')()(page,'resident');
 return{...r,trace:r.stages,networkFailures:[],scope:r.scope+' Existing resident quote/payment/delivery/practice/leave/Continue recipe reused unchanged.'};
}
