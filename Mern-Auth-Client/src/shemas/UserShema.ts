import * as yup from "yup";
import type { ForgotPasswordFormData } from "../types/UserTypes";

export const RegisterSchema = yup.object().shape({
    firstName: yup.string().required().min(3).max(50),
    lastName: yup.string().required().min(3).max(50),
    email: yup.string().required().email(),
    password: yup.string()
        .min(8)
        .matches(/[A-Z]/, "*One uppercase required.")
        .matches(/[a-z]/, "*One lowercase required.")
        .matches(/[0-9]/, "*One number required.")
        .matches(/[@$!%*?&#]/, "*One special character required.")
        .required(),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password"), undefined], "*Passwords must match.")
        .required(),
    phone: yup.string().required().min(7).max(20),
    location: yup.string().required().min(2).max(100),
});

export const LoginSchema = yup.object().shape({
    email: yup.string().required("Email is required").email("Invalid Email"),
    password: yup.string().required("Password is required")
});


export const Forgotschema: yup.ObjectSchema<ForgotPasswordFormData> = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    otp: yup.string().when("step", {
        is: 2,
        then: (schema) =>
            schema
                .required("OTP is required")
                .matches(/^\d{4}$/, "Invalid OTP. Please enter 4 digits"),
        otherwise: (schema) => schema.notRequired(),
    }),
    password: yup.string().when("step", {
        is: 3,
        then: (schema) => schema.required("Password is required").min(8, "Password must be at least 8 characters"),
        otherwise: (schema) => schema.notRequired(),
    }),
    confirmPassword: yup.string().when("step", {
        is: 3,
        then: (schema) => schema
            .required("Confirm password is required")
            .oneOf([yup.ref("password")], "Passwords must match"),
        otherwise: (schema) => schema.notRequired(),
    }),
    step: yup.number().required(),
});



export const addSchema = yup.object({
    firstName: yup.string().required().min(3).max(50),
    lastName: yup.string().required().min(3).max(50),
    email: yup.string().required().email(),
    role: yup.string().oneOf(["admin", "user"]).required(),
    status: yup.string().oneOf(["active", "inActive", "delete"]).required(),
    location: yup.string().required().min(3).max(50),
    phoneNo: yup.string().required().min(3).max(50),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "*One uppercase required.")
        .matches(/[a-z]/, "*One lowercase required.")
        .matches(/[0-9]/, "*One number required.")
        .matches(/[@$!%*?&#]/, "*One special character required."),
    confirmPassword: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password")], "Passwords must match"),
});

export const editSchema = yup.object({
    firstName: yup.string().required().min(3).max(50),
    lastName: yup.string().required().min(3).max(50),
    email: yup.string().required().email(),
    role: yup.string().oneOf(["admin", "user"]).required(),
    status: yup.string().oneOf(["active", "inActive", "delete"]).required(),
    location: yup.string().required().min(3).max(50),
    phoneNo: yup.string().required().min(3).max(50),
});



export const ResetPasswordschema = yup.object().shape({
    oldPassword: yup.string().required("Old password is required"),
    newPassword: yup
        .string()
        .required("New password is required")
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
});

export const EditProfileSchema = yup.object().shape({
    firstName: yup.string().required().min(3).max(50),
    lastName: yup.string().required().min(3).max(50),
    email: yup.string().required().email(),
    phoneNo: yup.string().required().min(7).max(20),
    location: yup.string().required().min(2).max(100),
});