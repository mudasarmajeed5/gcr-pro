// models/UserSettings.ts
import { Schema, model, models } from "mongoose";

const UserSettingsSchema = new Schema(
   {
       userId: {
           type: Schema.Types.ObjectId,
           ref: 'Users',
           required: true,
           unique: true
       },
       showGradeCard: {
           type: Boolean,
           default: true,
       },
       authUserId: {
        type: Number, 
        required: true, 
        default: 0,
       },
       smtpPassword: {
           type: String,
           default: "",
       }
   },
   { timestamps: true }
);

const UserSettings = models.UserSettings || model("UserSettings", UserSettingsSchema);
export default UserSettings;