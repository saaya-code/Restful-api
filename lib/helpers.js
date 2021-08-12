/*
*helpers for vairous tasks
* 
*/


const crypto = require("crypto");
//container 
var helpers = {};

helpers.hash = (str)=>{
  if(typeof(str)=='string'&&str.length>0){
const hash = crypto.createHmac('sha256',"thisIsASecret").update(str).digest("hex");
return hash;
  }
  else{
      return false;
}
};

helpers.parseJsonToObject = (buffer)=>{
   try{
       var obj = JSON.parse(buffer);
       return obj;
   }catch(e){
       return {};
   }
};

helpers.createRandomString = (strLength)=>{
  
  var string = "";
 
  var possibleChars = "azertyuiopqsdfghjklmwxcvbn0123456789";
  for(let i=0;i<strLength;i++){
 char = possibleChars.charAt(Math.floor(Math.random()*possibleChars.length));
string+=char;
  }
  return string;
}



module.exports = helpers;