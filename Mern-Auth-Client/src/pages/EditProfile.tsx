import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import { ImageCropModal } from "../utils/ImageCropModal";
import { toast } from "../utils/toast";
import { BackButton, Button } from "../utils/Button";
import type { EditProfileType } from "../types/UserTypes";
import { EditProfileSchema } from "../shemas/UserShema";

export const EditProfile = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<EditProfileType>({
        resolver: yupResolver(EditProfileSchema),
    });

    // Load user data (could be from context or API)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}me`, {
                    withCredentials: true,
                });
                const { firstName, lastName, email, imgUrl, location, phoneNo } = res.data.user;
                setValue("firstName", firstName);
                setValue("lastName", lastName);
                setValue("email", email);
                setValue("phoneNo", phoneNo);
                setValue("location", location);
                if (imgUrl) {
                    setPreviewUrl(`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${imgUrl}`);
                }
            } catch {
                toast.error("Failed to load profile");
            }
        };

        fetchUser();
    }, [setValue]);

    const onSubmit = async (data: EditProfileType) => {
        try {
            const formData = new FormData();
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("email", data.email);
            formData.append("phoneNo", data.phoneNo);
            formData.append("location", data.location);
            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BASE_URL}update-profile`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Profile updated!");
            navigate(-1);
        } catch {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh-75px] flex flex-col text-gray-900 dark:text-white p-4 sm:p-10 my-auto">
            <div className="w-full max-w-md mx-auto rounded-2xl shadow-md bg-white dark:bg-primaryBg p-5 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div className="mb-2">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                    <p className="text-gray-500 dark:text-textGrayMedium text-sm">Edit Profile</p>
                    <p className="text-xs text-textGrayMedium dark:text-gray-500">Update your profile information</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-6" noValidate>
                    {/* Image Upload Section - moved below the card head */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <label htmlFor="profileImage" className="cursor-pointer bg-blue-100 w-fit rounded-full shadow-md">
                            {previewUrl ? (
                                <div className="sm:w-20 w-15 h-15 sm:h-20">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="sm:w-20 w-15 h-15 sm:h-20 p-3 sm:p-4">
                                    <User className="w-full h-full text-blue-600" />
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
                                if (file && file.size < 1 * 1024 * 1024) {
                                    const url = URL.createObjectURL(file);
                                    setCropImageUrl(url);
                                } else if (file) {
                                    toast.error("Image must be smaller than 1MB");
                                }
                            }}
                        />
                    </div>
                    {cropImageUrl && (
                        <ImageCropModal
                            image={cropImageUrl}
                            onClose={() => setCropImageUrl(null)}
                            onCropComplete={(croppedFile: File) => {
                                setSelectedImage(croppedFile);
                                setPreviewUrl(URL.createObjectURL(croppedFile));
                            }}
                        />
                    )}
                    <div className="flex flex-col gap-3 sm:gap-4 w-full">
                        <Input
                            name="firstName"
                            type="text"
                            label="First Name"
                            placeholder="Enter first name"
                            register={register}
                            error={errors.firstName?.message}
                        />
                        <Input
                            name="lastName"
                            type="text"
                            label="Last Name"
                            placeholder="Enter last name"
                            register={register}
                            error={errors.lastName?.message}
                        />
                        <Input
                            name="email"
                            type="email"
                            label="Email Address"
                            placeholder="Enter email"
                            register={register}
                            error={errors.email?.message}
                        />
                        <Input
                            name="phoneNo"
                            type="text"
                            placeholder="Enter your Phone Number"
                            label={<span>Phone <span className="text-red-500">*</span></span>}
                            register={register}
                            error={errors.phoneNo?.message}
                        />
                        <Input
                            name="location"
                            type="text"
                            placeholder="Enter your Location"
                            label={<span>Location <span className="text-red-500">*</span></span>}
                            register={register}
                            error={errors.location?.message}
                        />
                    </div>
                    <div className="flex flex-col gap-3 justify-between">
                        <Button
                            type="submit"
                            text="Save Changes" />
                        <BackButton text="Back" onClick={() => navigate(-1)} />

                    </div>
                </form>
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                        <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-primaryBg shadow-2xl border border-darkBorder">
                            <ClipLoader size={40} color="#3b82f6" />
                            <p className="text-blue-400 text-lg font-semibold">Updating...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
