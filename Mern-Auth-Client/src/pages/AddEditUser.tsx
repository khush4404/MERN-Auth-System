import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import { ImageCropModal } from "../utils/ImageCropModal";
import Select from "../utils/Select";
import { toast } from "../utils/toast";
import { BackButton, Button } from "../utils/Button";
import type { AddEditUserType } from "../types/UserTypes";
import { addSchema, editSchema } from "../shemas/UserShema";

export const AddEditUser = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
    const [initialEmail, setInitialEmail] = useState("");
    const [imageLoading, setImageLoading] = useState(false);

    const isEditMode = Boolean(userId);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<AddEditUserType>({
        resolver: yupResolver(isEditMode ? editSchema : addSchema),
        defaultValues: {
            role: "user",
            status: "active",
        },
    });


    const role = watch("role");
    const status = watch("status");

    useEffect(() => {
        if (role === "admin" && status === "delete") {
            setValue("status", "active");
            toast.info("Admin users cannot be set to Deleted. Status reset to Active.");
        }
    }, [role, status, setValue]);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_ADMIN_URL}user/${userId}`, {
                    withCredentials: true,
                });

                const { firstName, lastName, email, imgUrl, role, status, location, phoneNo } = res.data.user;

                setValue("firstName", firstName);
                setValue("lastName", lastName);
                setValue("email", email);
                setValue("role", role);
                setValue("status", status);
                setValue("location", location);
                setValue("phoneNo", phoneNo);
                setInitialEmail(email);

                if (imgUrl) {
                    setPreviewUrl(`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${imgUrl}`);
                }
            } catch {
                toast.error("Failed to load user data");
            }
        };

        fetchUser();
    }, [userId, setValue]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
        };
    }, [previewUrl, cropImageUrl]);

    const checkEmailExists = async (email: string) => {
        if (!email || email.trim() === "" || (isEditMode && email === initialEmail)) {
            setEmailExistsError(null);
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}check-email`, { email });
            setEmailExistsError(res.data.exists ? "Email already exists." : null);
        } catch {
            setEmailExistsError("Failed to check email.");
        }
    };



    const onSubmit = async (data: AddEditUserType) => {
        // Ensure defaults if not set
        const role = data.role || "user";
        const status = data.status || "active";
        try {
            const formData = new FormData();
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("email", data.email);
            formData.append("role", role);
            formData.append("status", status);
            formData.append("location", data.location);
            formData.append("phoneNo", data.phoneNo);

            if (!isEditMode) {
                formData.append("password", data.password || "");
            }

            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }

            setLoading(true);

            if (isEditMode) {
                await axios.put(`${import.meta.env.VITE_BASE_ADMIN_URL}user/edit/${userId}`, formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("User updated successfully!");
            } else {
                await axios.post(`${import.meta.env.VITE_BASE_ADMIN_URL}user/create`, formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("User created successfully!");
            }

            setSelectedImage(null);
            setPreviewUrl(null);
            navigate("/admin/user-list");
        } catch (err: unknown) {
            type AxiosErrorResponse = {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };
            if (typeof err === "object" && err !== null && "response" in err && typeof (err as AxiosErrorResponse).response === "object") {
                toast.error((err as AxiosErrorResponse).response?.data?.message || "Request failed");
            } else {
                toast.error("Request failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh-73px] my-auto flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
            <div className="w-full flex items-center justify-center my-auto h-full p-5 sm:p-10">
                <div className="w-full max-w-md mx-auto rounded-2xl shadow-2xl bg-white dark:bg-primaryBg p-4 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="mb-2">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                        <p className="text-gray-500 dark:text-textGrayMedium text-sm">{isEditMode ? "Edit User" : "Create User"}</p>
                        <p className="text-xs text-textGrayMedium dark:text-gray-500">Fill in the user details below</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="profileImage" className="cursor-pointer bg-bgLight dark:bg-darkBorder w-fit rounded-full shadow-md">
                            {imageLoading ? (
                                <div className="sm:w-20 w-15 h-15 sm:h-20 p-3 sm:p-4 flex items-center justify-center">
                                    <ClipLoader size={32} color="#3b82f6" />
                                </div>
                            ) : previewUrl ? (
                                <div className="sm:w-20 w-15 h-15 sm:h-20">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="sm:w-20 w-15 h-15 sm:h-20 p-3 sm:p-4">
                                    <User className="w-full h-full text-gray-500 dark:text-blue-600" />
                                </div>
                            )}
                        </label>
                        <input
                            id="profileImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 1 * 1024 * 1024) {
                                        toast.error("Image must be smaller than 1MB");
                                        return;
                                    }
                                    setImageLoading(true);
                                    const imageUrl = URL.createObjectURL(file);
                                    setCropImageUrl(imageUrl);
                                }
                            }}
                        />
                    </div>
                    {cropImageUrl && (
                        <ImageCropModal
                            image={cropImageUrl}
                            onClose={() => {
                                setCropImageUrl(null);
                                setImageLoading(false);
                            }}
                            onCropComplete={(croppedFile: File) => {
                                setSelectedImage(croppedFile);
                                setPreviewUrl(URL.createObjectURL(croppedFile));
                                setImageLoading(false);
                            }}
                        />
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-6" noValidate>
                        <div className="flex flex-col gap-3 sm:gap-4 w-full">
                            <Input
                                name="firstName"
                                type="text"
                                label="FIRST NAME"
                                placeholder="Enter first name"
                                register={register}
                                error={errors.firstName?.message}
                            />
                            <Input
                                name="lastName"
                                type="text"
                                label="LAST NAME"
                                placeholder="Enter last name"
                                register={register}
                                error={errors.lastName?.message}
                            />
                            <Input
                                name="email"
                                type="email"
                                label="EMAIL"
                                placeholder="Enter email"
                                register={register}
                                error={errors.email?.message || emailExistsError || undefined}
                                onBlur={async (e) => {
                                    const isValid = await trigger("email");
                                    if (isValid) {
                                        await checkEmailExists(e.target.value);
                                    }
                                }}
                                onChange={(e) => {
                                    setEmailExistsError(null);
                                    register("email").onChange(e);
                                }}
                            />
                            <Input
                                name="location"
                                type="text"
                                label="Location"
                                placeholder="Enter Location"
                                register={register}
                                error={errors.location?.message}
                            />
                            <Input
                                name="phoneNo"
                                type="text"
                                label="Phone No"
                                placeholder="Enter Phone No"
                                register={register}
                                error={errors.phoneNo?.message}
                            />
                            <div className="flex gap-4">
                                <div className="flex flex-col flex-1">
                                    <label className="font-medium mb-1 text-gray-700 dark:text-btnGrToLight text-xs">ROLE <span className="text-red-500">*</span></label>
                                    <Select
                                        name="role"
                                        items={[
                                            { value: "user", text: "User" },
                                            { value: "admin", text: "Admin" },
                                        ]}
                                        value={[role]}
                                        onChange={(val) => setValue("role", val[0] as "admin" | "user")}
                                        className="w-full px-4 py-2 rounded-md border border-btnGrFromLight dark:border-darkBorder cursor-pointer bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-white"
                                        error={errors.role?.message}
                                    />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <label className="font-medium mb-1 text-gray-700 dark:text-btnGrToLight text-xs">STATUS <span className="text-red-500">*</span></label>
                                    <Select
                                        name="status"
                                        items={[
                                            { value: "active", text: "Active" },
                                            { value: "inActive", text: "Inactive" },
                                            { value: "delete", text: "Deleted", disabled: role === "admin" || !isEditMode },
                                        ]}
                                        value={[status]}
                                        onChange={(val) => setValue("status", val[0] as "active" | "inActive" | "delete")}
                                        className="w-full px-4 py-2 rounded-md border border-btnGrFromLight dark:border-darkBorder cursor-pointer bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-white"
                                        error={errors.status?.message}
                                    />
                                </div>
                            </div>
                            {!userId && (
                                <>
                                    <Input
                                        name="password"
                                        type="password"
                                        label="PASSWORD"
                                        placeholder="Enter password"
                                        register={register}
                                        error={errors.password?.message}
                                    />
                                    <Input
                                        name="confirmPassword"
                                        type="password"
                                        label="CONFIRM PASSWORD"
                                        placeholder="Confirm password"
                                        register={register}
                                        error={errors.confirmPassword?.message}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 justify-between">
                            <Button
                                type="submit"
                                text={isEditMode ? "Save Changes" : "Create User"}
                                disabled={loading || !!Object.keys(errors).length || !!emailExistsError}
                            />
                            <BackButton text="Back" onClick={() => navigate(-1)} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
