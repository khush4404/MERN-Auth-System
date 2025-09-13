import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";
import { v4 as uuidv4 } from "uuid";

interface ImageCropModalProps {
	image: string;
	onClose: () => void;
	onCropComplete: (croppedFile: File) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
	image,
	onClose,
	onCropComplete,
}) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
		width: number;
		height: number;
		x: number;
		y: number;
	} | null>(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	const [loading, setLoading] = useState(false);

	const onCropCompleteInternal = useCallback(
		(
			_: unknown,
			croppedPixels: {
				width: number;
				height: number;
				x: number;
				y: number;
			},
		) => {
			setCroppedAreaPixels(croppedPixels);
		},
		[],
	);

	const handleDone = async () => {
		if (!croppedAreaPixels) {
			console.error("No cropped area selected");
			return;
		}
		setLoading(true);
		try {
			const blob = await getCroppedImg(image, croppedAreaPixels);
			const file = new File([blob], `${uuidv4()}.jpg`, {
				type: "image/jpeg",
			});
			onCropComplete(file);
			onClose();
		} catch (err) {
			console.error("Cropping failed", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-70"
			onClick={onClose}
		>
			<div
				className="relative w-[90vw] max-w-md bg-white rounded-lg p-4 flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ...existing modal content... */}

				{/* Overlay Spinner */}
				{loading && (
					<div className="absolute inset-0 z-50 bg-white bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
						<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
						<p className="text-blue-600 font-medium">
							Uploading...
						</p>
					</div>
				)}

				{/* Cropper */}
				<div className="relative w-full" style={{ paddingTop: "100%" }}>
					<div className="absolute top-0 left-0 right-0 bottom-0">
						<Cropper
							image={image}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropCompleteInternal}
							onMediaLoaded={() => setIsImageLoaded(true)}
							style={{
								containerStyle: {
									backgroundColor: "transparent",
								},
								mediaStyle: {
									backgroundColor: "transparent",
								},
								cropAreaStyle: {
									backgroundColor: "transparent",
								},
							}}
						/>


					</div>
				</div>

				{/* Buttons */}
				<div className="flex justify-between mt-4">
					<button
						onClick={onClose}
						disabled={loading}
						className="px-4 py-2 bg-btnGrToLight rounded hover:bg-textGrayMedium">
						Cancel
					</button>
					<button
						onClick={handleDone}
						disabled={!isImageLoaded || loading}
						className={`px-4 py-2 rounded ${!isImageLoaded || loading
							? "bg-textGrayMedium text-white cursor-not-allowed"
							: "bg-blue-600 text-white hover:bg-blue-700"
							}`}>
						Crop & Upload
					</button>
				</div>
			</div>
		</div>
	);
};
