export const getCroppedImg = async (
	imageSrc: string,
	crop: { x: number; y: number; width: number; height: number },
): Promise<Blob> => {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	canvas.width = crop.width;
	canvas.height = crop.height;
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("Failed to get canvas context");

	ctx.drawImage(
		image,
		crop.x,
		crop.y,
		crop.width,
		crop.height,
		0,
		0,
		crop.width,
		crop.height,
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			blob => {
				if (blob) resolve(blob);
				else reject(new Error("Canvas is empty"));
			},
			"image/jpeg",
			1,
		);
	});
};

function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = url;
		image.onload = () => resolve(image);
		image.onerror = error => reject(error);
	});
}
