export type RegisterType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    location: string;
};

export type LoginType = {
    email: string;
    password: string;
    role?: "admin" | "user";
};

export type ForgotPasswordFormData = {
    email: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
    step: number;
};

export type AddEditUserType = {
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "user";
    status: "active" | "inActive" | "delete";
    password?: string;
    confirmPassword?: string;
    location: string;
    phoneNo: string;
};



export type ResetPasswordType = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type EditProfileType = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    location: string;
};


export type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    imgUrl?: string;
}

export type CurUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    location: string;
    role: string;
    status: string;
    imgUrl: string;
    createdAt: string;
    updatedAt: string;
}

export type ActivityLog = {
    _id: string;
    timestamp: string;
    actionType: string;
    actionDescription: string;
    ipAddress: string;
    deviceInfo: string;
    activityBy: string;
}