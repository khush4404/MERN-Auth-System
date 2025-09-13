import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { ImageCropModal } from "../utils/ImageCropModal";
import Navbar from "../component/layout/Navbar";
import { toast } from "../utils/toast";
import { Button } from "../utils/Button";
import type { RegisterType } from "../types/UserTypes";
import { RegisterSchema } from "../shemas/UserShema";

const Register = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [targetProgress, setTargetProgress] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
    const [emailExistsError, setEmailExistsError] = useState<string | null>(null);


    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm<RegisterType>({ resolver: yupResolver(RegisterSchema), mode: "onBlur", });

    // ✅ Smooth animation useEffect
    useEffect(() => {
        if (!isUploading) {
            setDisplayedProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setDisplayedProgress((prev) => {
                if (prev < targetProgress) {
                    return Math.min(prev + 1, targetProgress);
                }
                clearInterval(interval);
                return prev;
            });
        }, 20); // Smooth every 20ms

        return () => clearInterval(interval);
    }, [targetProgress, isUploading]);

    const onsubmit = async (data: RegisterType) => {
        const { firstName, lastName, email, password, phone, location } = data;

        try {
            setEmailExistsError(null); // Reset error first

            const emailRes = await axios.post(`${import.meta.env.VITE_BASE_URL}check-email`, { email });
            if (emailRes.data.exists) {
                setEmailExistsError("Email already exists."); // ✅ Set inline error
                return;
            }

            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("phone", phone);
            formData.append("location", location);
            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }

            setIsUploading(true);
            setTargetProgress(1);

            await axios.post(`${import.meta.env.VITE_BASE_URL}register`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setTargetProgress(percent);
                    }
                },
            });

            setTargetProgress(100);
            toast.success("Signup successful!");
            navigate("/login");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error("Signup failed. Try again.");
            } else {
                toast.error("Something went wrong.");
            }
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setTargetProgress(0);
                setDisplayedProgress(0);
            }, 1000);
        }
    };


    return (
        <div
            className="min-h-dvh flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]"
        >
            <Navbar />
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-primaryBg shadow-md border border-darkBorder">
                        <ClipLoader size={40} color="#3b82f6" />
                        {displayedProgress === 100 ? (
                            <p className="text-green-400 text-lg font-semibold">Finalizing...</p>
                        ) : (
                            <p className="text-blue-400 text-lg font-semibold">Uploading... {displayedProgress}%</p>
                        )}
                        <div className="w-64 h-2 bg-darkBorder rounded">
                            <div
                                className="h-full bg-blue-500 rounded"
                                style={{ width: `${displayedProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
            {/* Image Crop Modal */}
            {cropImageUrl && (
                <ImageCropModal
                    image={cropImageUrl}
                    onClose={() => {
                        setCropImageUrl(null);
                        setImageLoading(false); // Stop loading if modal is closed without cropping
                    }}
                    onCropComplete={(croppedFile: File) => {
                        setSelectedImage(croppedFile);
                        setPreviewUrl(URL.createObjectURL(croppedFile));
                        setImageLoading(false); // Stop loading after cropping is done
                    }}
                />
            )}
            <div className="w-full flex items-center justify-center my-auto h-full p-4 sm:p-10">
                <div className="w-full max-w-md mx-auto rounded-2xl shadow-md bg-white dark:bg-primaryBg p-5 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="mb-2">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                        <p className="text-gray-500 dark:text-textGrayMedium text-sm">Create your account</p>
                        <p className="text-xs text-textGrayMedium dark:text-gray-500">Join us today!</p>
                    </div>
                    <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-4 sm:gap-6" noValidate>
                        <div className="flex flex-col gap-3 sm:gap-4 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <label htmlFor="profileImage" className="cursor-pointer bg-btnGrFromLight dark:bg-blue-100 w-fit rounded-full shadow-md">
                                    {imageLoading ? (
                                        <div className="w-20 h-20 flex items-center justify-center">
                                            <ClipLoader size={32} color="#3b82f6" />
                                        </div>
                                    ) : previewUrl ? (
                                        <div className="w-20 h-20">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="sm:w-20 w-15 h-15 sm:h-20 p-3 sm:p-4">
                                            <User className="w-full h-full dark:text-blue-600" />
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
                                            setImageLoading(true); // Start loading when image is selected
                                            const imageUrl = URL.createObjectURL(file);
                                            setCropImageUrl(imageUrl);
                                        }
                                    }}
                                />
                            </div>
                            <Input
                                name="firstName"
                                type="text"
                                placeholder="Enter your First Name"
                                label={<span>First Name <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.firstName?.message}
                            />
                            <Input
                                name="lastName"
                                type="text"
                                placeholder="Enter your Last Name"
                                label={<span>Last Name <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.lastName?.message}
                            />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                label={<span>Email Address <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.email?.message || emailExistsError || undefined}
                                onBlur={() => {
                                    trigger("email");
                                    setEmailExistsError(null);
                                }}
                                onChange={(e) => {
                                    setEmailExistsError(null);
                                    register("email").onChange(e);
                                }}
                            />
                            <Input
                                name="phone"
                                type="text"
                                placeholder="Enter your Phone Number"
                                label={<span>Phone <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.phone?.message}
                            />
                            <Input
                                name="location"
                                type="text"
                                placeholder="Enter your Location"
                                label={<span>Location <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.location?.message}
                            />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Enter your Password"
                                label={<span>Password <span className="text-red-500">*</span></span>}
                                error={errors.password?.message}
                                register={register}
                            />
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Enter your confirm Password"
                                label={<span>Confirm Password <span className="text-red-500">*</span></span>}
                                error={errors.confirmPassword?.message}
                                register={register}
                            />
                        </div>

                        <Button
                            type="submit"
                            text={isUploading ? "Signing up..." : "Sign Up"} />
                        <p className="text-center text-textGrayMedium text-xs">
                            Already have an account?{' '}
                            <span className="text-sm text-black dark:text-blue-400 cursor-pointer hover:underline" onClick={() => navigate("/login")}>Sign in</span>
                        </p>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default Register;
