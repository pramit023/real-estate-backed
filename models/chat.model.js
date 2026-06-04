import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {

      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true, 
    },
    text : {
      type: String,
      required: true,

    },  
    image : {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,

  }
});

// chat schema
const chatSchema = new mongoose.Schema(
  { 
    property:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },  
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",  


      required: true,

    },

    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
