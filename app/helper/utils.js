
/**
 * For
 * prototype
 * Promise  promise.all promise.resolve/ promise.reject
 */
const itemsSchema = require(__path_app_schema+'items')
let createStatusFillter = async(currentStatus) =>{
    let statusFillter = [
        {name: 'All', value: 'all', count: 0,   class: 'default'},
        {name: 'Active',value: 'active',  count: 0,   class: 'default'},
        {name: 'Inactive', value :'inactive',  count: 0, class: 'default'}
      ];
    for (let index = 0; index < statusFillter.length; index++) {
        let condition = {}
        let item =  statusFillter[index];
        if (item.value !== 'all') { condition = {status:item.value }}
        if (item.value === currentStatus ) {  statusFillter[index].class = 'success'}
    await  itemsSchema.count(condition).then((data)=>{
          statusFillter[index].count = data
          })
        }
        return statusFillter;
}

module.exports = {
    createStatusFillter :createStatusFillter
}