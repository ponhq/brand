#!/usr/bin/env ts-node
import * as fs from "fs";
import * as sharp from "sharp";
import * as SVGO from "svgo";
import * as toIco from "to-ico";

const sourceSize = 500;
const sourceImages = ["logomark", "logotype"];
const targetSizes = [500, 100, 50, 20];
const faviconSource = "logomark";
const faviconSizes = [16, 32, 192];

function generateFilename(base: string, type: "brand" | "black", size: number) {
  return `${base}-${type}-${size}x${size}.png`;
}

async function main() {
  // Regular and Black PNGs
  process.stdout.write("🌈 Resizing PNG logo images: ");
  for (const image of sourceImages) {
    const brandSource = `src/${generateFilename(image, "brand", sourceSize)}`;
    const blackSource = `src/${generateFilename(image, "black", sourceSize)}`;

    for (const size of targetSizes) {
      // Regular brand color
      const brandTarget = generateFilename(image, "brand", size);
      await sharp(brandSource)
        .resize(size, size)
        .toFile(brandTarget);
      process.stdout.write(".");

      // Black
      const blackTarget = generateFilename(image, "black", size);
      await sharp(blackSource)
        .resize(size, size)
        .toFile(blackTarget);
      process.stdout.write(".");
    }
  }
  process.stdout.write(" Done\n");

  // Favicon PNGs
  process.stdout.write("🌈 Generating favicon PNGs and fallback ICO: ");
  const source = `src/${generateFilename(faviconSource, "brand", sourceSize)}`;
  for (const size of faviconSizes) {
    const target = `favicon-${size}.png`;
    await sharp(source)
      .resize(size, size)
      .toFile(target);
    process.stdout.write(".");
  }

  // Favicon ICO fallback
  const files = [16, 32].map(size => fs.readFileSync(`favicon-${size}.png`));
  const output = await toIco(files);
  fs.writeFileSync('favicon.ico', output);
  process.stdout.write(".");
  process.stdout.write(" Done\n");

  // SVGs
  process.stdout.write("🌈 Optimizing SVG images: ");
  const svgo = new SVGO();
  for (const image of sourceImages) {
    const source = `src/${image}-brand-${sourceSize}x${sourceSize}.svg`;
    const target = `${image}.svg`;

    const contents = fs.readFileSync(source, "utf-8");
    const output = await svgo.optimize(contents);
    fs.writeFileSync(target, output.data, "utf-8");

    process.stdout.write(".");
  }
  process.stdout.write(" Done\n");

  return "Complete"
}

main()
  .then(console.log)
  .catch(console.error);
