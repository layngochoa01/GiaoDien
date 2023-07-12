var express = require('express');
var router = express.Router();
const itemsSchema = require(__path_app_schema+'items');
const itemsModel = require(__path_app_models+'items');
const ultilsHelper = require(__path_app_helper+'utils')
const paramHelper = require(__path_app_helper+'param');
const { getParam } = require(__path_app_helper+'param');
const systemConfig = require(__path_app_config+'system');
const notify = require(__path_app_config+'notify');
const pageTitle= 'Item Manager';
const pageTitleNew = pageTitle+' Add';
const pageTitleEdit = pageTitle+ ' Edit';
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const util = require('node:util'); 
const { error } = require('node:console');
const collection='items';
const formview =`page/${collection}/`;
const linkItem = `/${systemConfig.prefixAdmin}/${collection}`;

// Item List
router.get('(/status/:status)?', async (req, res, next)=>{
  let params={};
   params.currentStatus = paramHelper.getParam(req.params, 'status', 'all');
   params.keywork = paramHelper.getParam(req.query, 'keywork', '');  
   params.sortby = paramHelper.getParam(req.session,'sort_by','ordering');
   params.sorttype= paramHelper.getParam(req.session,'sort_type','asc');
   params.objWhere = {};
   params.pagination = {
        totalItems: 1,
        totalItemsPage: 3,
        currentPage: 1,  
        pagerange:3
  }
  if(params.currentStatus !== 'all'){params.objWhere = {status:params.currentStatus}};
  if(params.keywork !== ''){params.objWhere.name =  new RegExp(params.keywork, 'i')};
  await  itemsModel.countItems(params).then((data)=>{
    params.pagination.currentPage = parseInt(paramHelper.getParam(req.query, 'page', 1)) ;
    params.pagination.totalItems = data;
    if (params.pagination.totalItems>(params.pagination.totalItemsPage * params.pagination.pagerange)) 
        params.pagination.pagerange=3;
    else 
        params.pagination.pagerange= Math.ceil(params.pagination.totalItems/params.pagination.totalItemsPage);
    })
  console.log(params.pagination);
  itemsModel.listItems(params,formview,res,collection);
}
);
// Update Status
router.get('/change-status/:id/:status',async (req,res,next)=>{
  const currentStatus= paramHelper.getParam(req.params,'status','all');
  const currentId = paramHelper.getParam(req.params,'id','');
  await itemsModel.changeStatus(currentStatus,currentId,'',req,linkItem);
  
})
// Delete Item
router.get('/delete/:id',async (req,res,next)=>{
  const currentId = paramHelper.getParam(req.params,'id','');
  await itemsModel.deleteItem(currentId,req,linkItem);
} );
//Delete Many Items
router.post('/delete',async (req,res,next)=>{
  await itemsModel.deleteItem('',req,linkItem);
})
// Update Many Status
router.post('/change-status/:status',async (req,res,next)=>{

  const currentStatus = paramHelper.getParam(req.params,'status','active');
  await itemsModel.changeStatus(currentStatus,'','many',req,linkItem);
})

//Change Ordering
router.post('/change-ordering',async (req,res,next)=>{
  const cid= req.body.cid;
  const orderingupdate=req.body.ordering; 
  itemsModel.changeOrdering(cid,orderingupdate,linkItem,req);
  
})
//Open Form edit/new
router.get('/form(/:id)?',async (req, res, next)=> {
    const id = paramHelper.getParam(req.params,'id','');
    await itemsModel.editItem(id,formview,res,collection,pageTitleNew,pageTitleEdit);
 });
 //Save form
router.post('/save(/:id)?',
  body('name')
    .isLength({ min: 5,max:100 })
    .withMessage(util.format(notify.error_name_length,5,100))
    .custom(async(value,{req})=>{
      const namecheck = await itemsSchema.findOne({name:value});
      if(namecheck)
      {
          return Promise.reject(notify.error_name_duplicate);
      }
    }),
  body('ordering')
    .isInt({ min: 0,max:100 })
    .withMessage(util.format(notify.error_ordering_range,0,100)),
  body('status')
    .isIn(['active','inactive'])
    .withMessage(notify.error_status_empty),

  async (req,res,next)=>{
      const error = validationResult(req);
      const id = paramHelper.getParam(req.params,'id','');
      const bodycontent= JSON.parse(JSON.stringify(req.body));
      const item = Object.assign(bodycontent);
    // const item ={
    //   name: paramHelper.getParam(bodycontent,'name',''),
    //   ordering: paramHelper.getParam(bodycontent,'ordering',0),
    //   status: paramHelper.getParam(bodycontent,'status','active')
    // };
    await itemsModel.saveItem(id,item,req,res,error,formview,pageTitleNew,pageTitleEdit,collection,linkItem);
})

router.get('/sort/:sortby/:sorttype',async (req,res,next)=>{
  req.session.sort_by= paramHelper.getParam(req.params,'sortby','ordering');
  req.session.sort_type= paramHelper.getParam(req.params,'sorttype','asc');
  res.redirect(linkItem);
})
module.exports =  router;
