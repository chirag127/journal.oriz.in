import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "public/favicon.svg");
const OUT_DIR = join(ROOT, "public/icons");
const SIZES = [
	{ name: "icon-192.png", size: 192, maskable: false },
	{ name: "icon-512.png", size: 512, maskable: false },
	{ name: "icon-maskable-512.png", size: 512, maskable: true },
	{ name: "icon-maskable-192.png", size: 192, maskable: true },
	{ name: "apple-touch-icon.png", size: 180, maskable: false },
];

const svg = await readFile(SRC);
await import("node:fs/promises").then((m) => m.mkdir(OUT_DIR, { recursive: true }));

for (const { name, size, maskable } of SIZES) {
	if (maskable) {
		const padded = await sharp(svg)
			.resize(Math.round(size * 0.8), Math.round(size * 0.8), {
				fit: "contain",
				background: { r: 26, g: 24, b: 20, alpha: 1 },
			})
			.flatten({ background: { r: 26, g: 24, b: 20 } })
			.png()
			.toBuffer();
		await sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: { r: 26, g: 24, b: 20, alpha: 1 },
			},
		})
			.composite([{ input: padded, gravity: "center" }])
			.png()
			.toFile(join(OUT_DIR, name));
	} else {
		await sharp(svg).resize(size, size).png().toFile(join(OUT_DIR, name));
	}
	console.log("Wrote", name);
}
console.log("Done.");
