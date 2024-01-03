//joi validate function
const Joi = require("joi");
function joiValidate(req){
    const schema = Joi.object({
        searchEmail : Joi.string().email().required(),
        name: Joi.string().required()
    })
    for(input in req.body){
        const {err} = schema.validate({searchEmail : req.body[input].searchEmail, name : req.body[input].name});
        if(err){
            req.flash('error',err.details.message);
            return  res.redirect(`/${req.user.id}/fill`);
        }
    }
}

module.exports = joiValidate;
