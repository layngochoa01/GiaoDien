const mongoose = require('mongoose');
const database = require('./../config/database');

const Schema = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number,
    created:{
      user_name:String,
      user_id: Number
    },
    modified:{
      user_name:String,
      user_id:Number
    },
    description:String,
  },
    {timestamps:true}
  );
module.exports = mongoose.model(`${database.collection_Item}`, Schema)
