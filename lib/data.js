//library for storing and edditing data

//dependencies 
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

//container for the module 
var lib = {};
//base directory defining 
lib.baseDir = path.join(__dirname, '/../.data/');

//writing data in the files
lib.create = (dir,file,data,callback)=>{
//open the file for writting rewrite
 fs.open(lib.baseDir + dir + '/' + file + ".json","wx",(err,fileDescriptor)=>{
  if(!err && fileDescriptor){
  //convert to string
  stringData = JSON.stringify(data)
  // write to the file and then close it
  fs.writeFile(fileDescriptor,stringData,(err)=>{
      if(!err){
      fs.close(fileDescriptor,(err)=>{
          if(!err){
           callback(false)
          }else{
              callback("error closing new file")
          }
      });
      }else{
          callback('error writing to new file');
      }
  })
  }
  else{
      callback('Couldn not create new file, it may exist already');
  }
 });


};

lib.read = (dir,file,callback)=>{
    fs.readFile(lib.baseDir+dir+"/"+file+".json","utf8",(err,data)=>{
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data)
            callback(false,parsedData)
        }
        else{
            callback(err,data);

        }
    })

}
lib.update = (dir,file,data,callback)=>{

    //first thing is openning the file for reading
    fs.open(lib.baseDir + dir + '/' + file + ".json","r+",(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
        //convert to string
        stringData = JSON.stringify(data);

        //truncate the file (nzidou wala na9es fel size)
        fs.ftruncate(fileDescriptor,function(err){
            if(!err){
         //write and close
         fs.writeFile(fileDescriptor,stringData,(err)=>{
             if(!err){
             //no error then close the file
             fs.close(fileDescriptor,(err)=>{
                 if(!err){
                callback(false);
                 }else{
                     callback('There was an error closing the file.')
                 }
             })
             }else{
                 callback("error writing to existing file")
             }
         })
            }
            else{
                callback("Error truncating file")
            }
        })
}
else{
    callback("Couldn't open the file for updating.")
}
})
}


lib.delete = (dir,file,callback)=>{
    //unlinking remove it from fs
    fs.unlink(lib.baseDir+dir+"/"+file+".json",(err)=>{
        if(!err){
            callback(false);
        }
        else{
            callback("There was an error deleting the file");
        }
    })
}
//exporting
module.exports = lib;