import mongoose, { Schema } from "mongoose";

const PushTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
});

export const PushToken = mongoose.model("PushToken", PushTokenSchema);
