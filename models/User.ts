// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: String,
        email: { type: String, unique: true },
        smtp_password: { type: String, unique: true }
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
