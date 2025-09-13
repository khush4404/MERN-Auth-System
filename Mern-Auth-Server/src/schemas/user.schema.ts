import Joi from "joi";

export const createUserSchema = Joi.object({
    _id: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    location: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("user", "admin").optional(),
    status: Joi.string().valid("active", "inActive", "delete").optional(),
});

export const updateUserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    location: Joi.string().required(),
    phoneNo: Joi.string().required()
});

export const resetPasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.ref("newPassword"),
});

export const updateUserByAdminSchema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("admin", "user").required(),
    status: Joi.string().valid("active", "inActive", "delete").required(),
    location: Joi.string().required(),
    phoneNo: Joi.string().required()
});