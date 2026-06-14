import Image from "next/image";

const galleryImages = [
	{
		src: "/gallery/podcaster.jpg",
		alt: "Podcaster speaking into a microphone while wearing headphones",
	},
	{
		src: "/gallery/studio.jpg",
		alt: "Two people recording a podcast in a studio with microphones",
	},
	{
		src: "/gallery/auditorium.jpg",
		alt: "Speaker presenting on stage to a large auditorium audience",
	},
	{
		src: "/gallery/interview.jpg",
		alt: "Professional being interviewed with a handheld microphone",
	},
	{
		src: "/gallery/mixing-board.jpg",
		alt: "Close-up of an audio mixing board with headphones and a microphone",
	},
	{
		src: "/gallery/conference.jpg",
		alt: "Audience seated in a conference room facing a presentation stage",
	},
];

export function GallerySection() {
	return (
		<section className="bg-white px-6 pb-0 pt-4 sm:pt-6">
			<div className="mx-auto grid w-full max-w-3xl grid-cols-6 gap-2 sm:max-w-4xl sm:gap-3">
				{galleryImages.map((image) => (
					<div
						key={image.src}
						className="relative aspect-4/5 overflow-hidden rounded-xl sm:rounded-2xl"
					>
						<Image
							src={image.src}
							alt={image.alt}
							fill
							sizes="(max-width: 640px) 14vw, 120px"
							className="object-cover"
						/>
						<div
							className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-white via-white/80 to-transparent"
							aria-hidden
						/>
					</div>
				))}
			</div>
		</section>
	);
}
