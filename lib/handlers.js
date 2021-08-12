var _data = require("./data")
var handler = {};
var helpers = require("./helpers")
const maxChecks = 5;

handler.test = (data,callback)=>{
    callback(200,{"test":"successful!"})
};
handler.error = (data,callback)=>{
    callback(404,{"test":"not found"})
};


//container for the users
handler._users={};

//users post
//required data : firstName ,lastName ,phone, password, tosAgreement
//optional data: none
handler._users.post = (data,callback)=>{
//check all required field are filled out
var firstName = typeof(data.payload.firstName)=="string" ? data.payload.firstName.trim() : false;
var lastName = typeof(data.payload.lastName)=="string" ? data.payload.lastName.trim() : false;
var phone = typeof(data.payload.phone)=="string" ? data.payload.phone : false;
var password = typeof(data.payload.password)=="string" ? data.payload.password.trim() : false;
var tosAgreement = typeof(data.payload.tosAgreement)=="boolean" ? data.payload.tosAgreement : false;

if(firstName && lastName && phone && password && tosAgreement){
_data.read('users',phone,(err,data)=>{
    if(err){
  //file doesn't exist create it!
  //hash the data
  const hashedPass = helpers.hash(password);
  var userObject ={
    "firstName" : firstName,
    "lastName" : lastName,
    "phone" : phone,
    "password" : hashedPass,
    "tosAgreement" : true
  };
  _data.create("users",phone,userObject,(err,fileDescriptor)=>{
   if(!err){
       callback(200);
   }
   else{
       console.error(err)
       callback(500,{"Error":"Couldn't create the new user"})
   }
  })
}
    else{
        //user already exists
   callback(400,{"Error":"USER ALREADY EXISTS"})
    }
}) 
}else{
    callback(400,{"Error":"Invalid data"})
}



}
//users get
//required data : phone
//optional data : none
// @TODO Only let authenticated users access their objects

handler._users.get = (data,callback)=>{
    //check the phone number
var phone = typeof(data.queries.phone)=="string" ? data.queries.phone : false;
if(phone){
var token = typeof(data.queries.token)=="string" ? data.queries.token : false;
handler._tokens.verifyToken(token,phone,(isVerified)=>{
    if(isVerified){
        _data.read("users",phone,(err,data)=>{

            if(!err && data){
           //remove the password
           delete data.password;
           callback(200,data);
            }
            else{
                callback(404,{"Error":"User was not found"})
            }
        })
    }else{
        callback(403,{"Error":"Missing required token or invalid token"})
    }
})    

    
}
else{
    callback(400,{"error":"Missing required field"})
}





}
//users put
handler._users.put = (data,callback)=>{
    
    var phone = typeof(data.payload.phone)=="string" ? data.payload.phone : false;
    var firstName = typeof(data.payload.firstName)=="string" ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName)=="string" ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password)=="string" ? data.payload.password.trim() : false;
    var token = typeof(data.payload.token)=="string" ? data.payload.token : false;
    handler._tokens.verifyToken(token,phone,(isVerified)=>{
        if(isVerified){
            if(phone){
                if(firstName || lastName || password){
                    _data.read("users",phone,(err,userData)=>{
                        if(!err && data){
                            //continue
                            if(firstName){
                                userData.firstName = firstName
                            }
                            if(lastName){
                                userData.lastName = lastName
                            }
                            if(password){
                                userData.password = helpers.hash(password)
                            }
                            //store the new update
                            _data.update("users",phone,userData,(err)=>{
                                if(!err){
                                    callback(200)
        
                                }
                                else{
                                    console.error(err)
                                    callback(500,{"ERROR":"couldn't update the file"})
                                }
                            })
                        }
                        else{
                            callback(404,{"ERROR":"USER NOT FOUND"})
                        }
                    })
        
        
        
                }
                else{
                    callback(400,{"ERROR":"Missing fileds to update"})
                }
            }
            else{
                callback(400,{"ERROR":"Missing required field"})
        
            }
            
        }else{
        callback(403,{"Error":"Missing required token or invalid token"})

        }
    })

    
}
//users delete
handler._users.delete = (data,callback)=>{
    var phone = typeof(data.payload.phone)=="string" ? data.payload.phone : false;
    _data.read("users",phone,(err,data)=>{
        if(!err && data){
        _data.delete("users",phone,(err)=>{
            if(!err){
                callback(200,{"Success":"operation successful"})

            }
            else{
                callback(500,{"ERROR":"COULDN'T DELETE THE USER"})
            }
        })

        }else{
            callback(404,{"ERROR":"USER NOT FOUND"})
        }
    })
}



//new service "/users"
handler.users = (data,callback)=>{
    //the request we accept
    const acceptableMethods = ["GET","POST","PUT","DELETE"]
    if(acceptableMethods.includes(data.method)){
        handler._users[data.method.toLowerCase()](data,callback) 
    }
    else{
        callback(405,{"Error":"Unacceptable method."});
    }
}

//submethods container
handler._tokens = {};

//new service "/tokens"
handler.tokens = (data,callback)=>{
    //the request we accept
    const acceptableMethods = ["GET","POST","PUT","DELETE"]
    if(acceptableMethods.includes(data.method)){
        handler._tokens[data.method.toLowerCase()](data,callback) 
    }
    else{
        callback(405,{"Error":"Unacceptable method."});
    }
}

//post
handler._tokens.post = (data,callback) =>{
//required phone and password 
var password = data.payload.password.length > 0 ? data.payload.password : false;
var phone = data.payload.phone.length > 0 ? data.payload.phone : false;
if(password && phone){
//look up the user who matches the phone number
_data.read("users",phone,(err,userData)=>{
    if(!err && userData){
  var hashedPass = helpers.hash(password);
  if(hashedPass==userData.password){
      var tokenId = helpers.createRandomString(20);
 
      var expires = Date.now()  + 1000 * 60 * 60;
      var tokenObject = {
          "phone" : phone,
          "id": tokenId,
          "expires": expires
      }

      //store the token 

      _data.create("tokens",tokenId,tokenObject,(err)=>{
          if(!err){
        callback(200,tokenObject)
          }
          else{
              callback(500,{"Error":"Couldn't create user's token."})
          }
      })

  }else{
      callback(400,{"Error":"Password is incorrect"})
  }
     
    }
    else{
        callback(404,{"Error":"User not found"})
    }
})
}
else{
    callback(400,{"Error": "Missing required fields"})
}

}

//get
handler._tokens.get = (data,callback) =>{
//required data : id 
var id = typeof(data.queries.id)=="string" ? data.queries.id : false;
if(id){
    

    _data.read("tokens",id,(err,tokenData)=>{

        if(!err && tokenData){
          callback(200,tokenData);
        }
        else{
            callback(404,{"Error":"User was not found"})
        }
    })
}
else{
    callback(400,{"error":"Missing required field"})
}

}

//put
handler._tokens.put = (data,callback) =>{
var id = typeof(data.payload.id)=="string" ? data.payload.id : false;
var extend = data.payload.extend==true ? data.payload.extend : false;
if(id && extend){
  _data.read("tokens",id,(err,tokenData)=>{
      if(!err && data){
       //check if the token isn't expired 
       if(tokenData.expires > Date.now()){
           newData = tokenData
           newData.expires = newData.expires + 1000*60*60;
      _data.update("tokens",id,newData,(err)=>{
          if(!err){
         callback(200,newData)
          }else{
              callback(500,{"Error":"Couldn't update the token's file"})
          }
      })
       }else{
           callback(400,{"Error":"Token expired"})
       }
      }else{
          callback(404,{"Error":"Couldn't find the token"})
      }
  })
}else{
    callback(400,{"Error":"Missing required fields or extend == false"})
    
}


}

//delete
handler._tokens.delete = (data,callback) =>{
//required data : token
var id = typeof(data.payload.id)=="string" ? data.payload.id : false;
    _data.read("tokens",id,(err,data)=>{
        if(!err && data){
        _data.delete("tokens",id,(err)=>{
            if(!err){
                callback(200,{"Success":"operation successful"})

            }
            else{
                callback(500,{"ERROR":"COULDN'T DELETE THE token"})
            }
        })

        }else{
            callback(404,{"ERROR":"token NOT FOUND"})
        }
    })

}
handler._tokens.verifyToken = (id, phone, callback)=>{
    _data.read("tokens",id,(err,tokenData)=>{
        if(!err && tokenData){
        _data.read("users",phone,(err,userData)=>{
            if(!err && userData){
                if(userData.phone == tokenData.phone && tokenData.expires > Date.now()){
                    callback(true);
                }else{
                    callback(false);
                }


            }else{
                callback(false)
            }
        })

        }else{
            callback(false)
        }
    })

}


//submethods container
handler._checks = {};

//new service "/tokens"
handler.checks = (data,callback)=>{
    //the request we accept
    const acceptableMethods = ["GET","POST","PUT","DELETE"]
    if(acceptableMethods.includes(data.method)){
        handler._checks[data.method.toLowerCase()](data,callback) 
    }
    else{
        callback(405,{"Error":"Unacceptable method."});
    }
}
//checks post
//required data : protocol, url, method, successCodes, timeoutSecondes
//optional data : none
handler._checks.post = (data,callback) =>{
    var protocol = typeof(data.payload.protocol)=="string" && ['https','http'].indexOf(data.payload.protocol)> -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url)=="string" ? data.payload.url : false;
    var method = typeof(data.payload.method)=="string" && ['get','post','put','delete'].indexOf(data.payload.method)> -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes)=="object" && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds)=="number" && Number(data.payload.timeoutSeconds) % 1 == 0 && Number(data.payload.timeoutSeconds)<= 5 && Number(data.payload.timeoutSeconds) > 1 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
   //get headers
   var token = typeof(data.headers.token)=="string" ? data.headers.token : false;
   _data.read("tokens",token,(err,tokenData)=>{
       if(!err && tokenData){
      handler._tokens.verifyToken(token,tokenData.phone,(isVerified)=>{
          if(isVerified){
         _data.read("users",tokenData.phone,(err,userData)=>{
             if(!err && userData){
                 var userChecks = typeof(userData.checks) == 'object' && userData.check instanceof Array ? userData.checks : [];
                 if(userData.checks.length<=maxChecks){
                 //Create a random ID for the check
                 checkId = helpers.createRandomString(20);
                 //create the check object and include the phone
                 var checkObject = {
                     'id':checkId,
                     'userPhone' : userData.phone,
                     'protocol' : protocol,
                     'url': url,
                     'method' : method,
                     'successCodes':successCodes,
                     'timeoutSeconds':timeoutSeconds
                 }
                 _data.create("checks",checkId,checkObject,(err)=>{
                     if(!err){
                       userData.checks = userChecks;
                       userData.checks.push(checkId);

                       //save the new userData
                       _data.update("users",userData.phone,userData,(err)=>{
                           if(!err){
                            callback(200,checkObject);
                           }else{
                               callback(500,{"Error":"Couldn't Update the user"})
                           }
                       })
                     }else{
                         callback(500,{"Error":"Internal server error"})
                     }
                 })
                 }else{
                     callback(400,{"Error":"Max checks limit reached"})
                 }
                }
         })
          }else{
              callback(400,{"Error":"Invalid token or expired"})
          }
      })
       }else{
           callback(404,{"Error":"Token not found."})
       }
   })

    }else{
        callback(400,{'Error':"Missing required fields or inputs invalid"})
        console.log(timeoutSeconds)
    }



};




module.exports = handler;