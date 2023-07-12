let getParam = (params,property, defaul ) =>{
    if(params.hasOwnProperty(property) && params[property] !== undefined){
        return params[property];
    }
    return defaul;
}



module.exports = {
    getParam: getParam
}