const itemsSchema = require(__path_app_schema+'items');
const ultilsHelper = require(__path_app_helper+'utils');;
const notify = require(__path_app_config+'notify');
const util = require('node:util'); 

module.exports ={
    listItems: async(params,formview,res,collection)=>{
        let statusFillter = await ultilsHelper.createStatusFillter(params.currentStatus);
        let sort={};
        sort[params.sortby]=params.sorttype;

        itemsSchema
        .find(params.objWhere)
        .sort(sort)
        .limit(params.pagination.totalItemsPage)
        .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
        .then((items)=>{
           res.render(`${formview}list`, { 
             pageTitle: 'List Items', 
             items,
             statusFillter,
             collection,
             params
           })
         }
         )
    },
    countItems:async(params)=>{
        return await  itemsSchema.count(params.objWhere);
    },
    changeStatus: async (currentStatus,currentId,options,req,linkItem)=>{
        let status='';
        if(currentStatus==='inactive') status='active';
        else status='inactive';
        if(options==='')
        {
        await itemsSchema.updateOne({_id:currentId},{status, modified:{
            user_name:'admin',
            user_id:0
        } }).then(()=>{
            req.flash('info',notify.change_status_success, linkItem);
        })
        }
        else if (options==='many') {
            const itemcount= await itemsSchema.updateMany({ _id: 
                { $in: req.body.cid } },{status:currentStatus, modified:{
                user_name:'admin',
                user_id:0
              } });
              const ItemCountStatus=itemcount.matchedCount;
              req.flash('info',util.format(notify.change_status_many_success,ItemCountStatus), linkItem);
        }      
    
    },
    changeOrdering: async (cid,orderingupdate,linkItem,req)=>{
        if (Array.isArray(cid)===true)
        {
            let i=0;
            for(i=0;i<cid.length;i++)
            {
                await itemsSchema.updateOne({_id:cid[i]},{ordering:parseInt(orderingupdate[i]), modified:{
                user_name:'admin',
                user_id:0
                } });
                
            }
            req.flash('success',util.format(notify.change_ordering_many_success,cid.length), linkItem);
        }
        else  
        {
            await  itemsSchema.updateOne({_id:cid},{ordering:parseInt(orderingupdate), modified:{
                user_name:'admin',
                user_id:0
            } });
            req.flash('success', 'Da Thay doi Ordering', linkItem);
        }
        },
    deleteItem:async(currentId,req,linkItem)=>{
        if(currentId!=='')
        {
        await   itemsSchema.deleteOne({_id:currentId}).then(()=>{
        })
        req.flash('info', notify.delete_success, linkItem);
        }
        else
        {
            const countitem= (await itemsSchema.deleteMany({_id:{$in:req.body.cid}}));
            req.flash('info', `Da Xoa ${countitem.deletedCount} phan tu thanh cong`, linkItem);
        }
    },
    editItem: async(id,formview,res,collection,pageTitleNew,pageTitleEdit)=>{
        if(id!=='')
        {
            const item=await itemsSchema.findById(id);
            res.render(`${formview}form`, { pageTitle: pageTitleEdit , item: item,ShowError:'',collection})
        }
        else
        res.render(`${formview}form`, { pageTitle: pageTitleNew,item: {name:'',ordering:'',status:'',description:''},ShowError:'',collection});
    },
    saveItem: async (id,item,req,res,error,formview,pageTitleNew,pageTitleEdit,collection,linkItem)=>{
        if (id!=='')  //Update
        { 
          item.id=id;
          console.log('Update');
          if(!error.isEmpty()){   //Update with Error
            console.log(error);
              if (error.errors.length===1)    
              {
                if (error.errors[0].msg===notify.error_name_duplicate)  // Cho phép trùng tên khi cập nhật
                {
                  await itemsSchema.updateOne({_id:id},
                    {
                      name:item.name,
                      ordering:parseInt(item.ordering),
                      status:item.status,
                      description:item.description,  
                      modified:{
                        user_name:'admin',
                        user_id:0
                      } 
                    }
                    );
                    req.flash('success',notify.update_success, linkItem);
                }
                else    // Khong cho phep error những chỗ khác Nếu không phải trùng tên
                {
                  console.log(error);
                  res.render(`${formview}form`, { pageTitle: pageTitleEdit , item: item,ShowError: error.errors,collection});
                }
              }
              if (error.errors.length>1)  //Nếu nhiều lỗi thì loại lỗi trùng tên ra
              {
                const error_filter = error.errors.filter(item=>item.msg!==notify.error_name_duplicate);
                console.log(error_filter);
                res.render(`${formview}form`, { pageTitle: pageTitleEdit , item: item,ShowError: error_filter,collection});
              }
          }   
          else{     // Update No error
            await itemsSchema.updateOne({_id:id},
              {
                name:item.name,
                ordering:parseInt(item.ordering),
                status:item.status,  
                description:item.description,
                modified:{
                  user_name:'admin',
                  user_id:0
                } 
              }
              );
              req.flash('success',notify.update_success, linkItem);
          }   
        }
        else       // Add New
        {
           console.log('Add New');
          if(!error.isEmpty()) //Add new Error
          {
            console.log(error);
            res.render(`${formview}form`, { pageTitle: pageTitleNew , item: item,ShowError: error.errors,collection});
          }
          else  //Add new No Error
          {
            item.created = {
              user_name: 'admin',
              user_id: 0
            }
            console.log(item);
            await new itemsSchema(item).save();
           req.flash('success',notify.add_success, linkItem);
          }         
        }
    }
}