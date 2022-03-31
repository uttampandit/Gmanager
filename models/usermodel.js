const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email : {
        type : String,
        unique : true,
        required : true,
    },
    googleId : {
        type : String,  
        unique : true,
        required : true,
    },
    access_token : String,
    display_name : String,
    input:[{
        searchEmail : {
            type : String,
        },
        name : {
            type: String,
        }
    }]
})
userSchema.statics.uniqueName = async (names,id) =>{
    const findUser = await mongoose.model('user').findById(id);
    let counter = 0;
    (names)
    findUser.input.forEach(obj => {
        names.forEach(name =>{
            ('name:',name,"obj.name",obj.name);
            if(name == obj.name){
                counter++;
            }
        })
    })
    if(counter){
        return false;
    }else{
        return true;
    }
}

userSchema.statics.uniqueEmail = async (emails,id) =>{
    const findUser = await mongoose.model('user').findById(id);
    ('findUser',findUser);
    let counter = 0;
    findUser.input.forEach(obj => {
        emails.forEach(searchEmail =>{
            if(searchEmail == obj.searchEmail){
                counter++;
            }
        })
    })
    if(counter){
        return false;
    }else{
        return true;
    }
}
// userSchema.path('input.searchEmail').index({ sparse: true });
const userModel = mongoose.model('user',userSchema);
// userModel.collection.dropIndexes(function (err, results) {
//     (results);
// });


module.exports = userModel;