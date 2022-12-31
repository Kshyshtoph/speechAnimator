import fs from "fs";
import path from "path";
import GIFEncoder from "gifencoder";
import { createCanvas, loadImage } from "canvas";
const vovels = ["aeiouyAEIOUY"];

const speed = 1.5;

const width = 512;
const height = 512;

const generateGif = (text) => {
  const safe = text + " ";
  const srcPath = path.join(process.cwd(), "static", "alphabet");
  const src = fs.readdirSync(srcPath);
  const imgList = safe.split("").map((letter) => {
    if (letter === " ") return "00.png";
    const list = src.filter(
      (imgName) => imgName[0] === letter || imgName[0] === letter.toUpperCase()
    );
    return list[Math.floor(list.length * Math.random())];
  });
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(width, height);
  console.log(safe);
  encoder.createReadStream().pipe(fs.createWriteStream(`./output/${safe}.gif`));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(200);
  encoder.setQuality(10);
  let wordLength = safe.indexOf(" ", 0);

  imgList.forEach(async (f, i) => {
    const image = await loadImage(path.join(srcPath, f));
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.font = "48px serif";
    if (f !== "00.png") ctx.fillText(f[0].toUpperCase(), 10, 50);
    else wordLength = safe.indexOf(" ", i + 1) - i;
    if (wordLength < 0) {
      ctx.drawImage(
        await loadImage(path.join(srcPath, "00.png")),
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      encoder.setDelay(1000 * speed);
      encoder.addFrame(ctx);
      encoder.finish();
      return "success";
    }

    console.log(wordLength, f[0], i);

    if (vovels.indexOf(f[0] !== -1) || f === "00.png")
      encoder.setDelay((1000 / wordLength) * speed);
    else encoder.setDelay((600 / wordLength) * speed);

    encoder.addFrame(ctx);
  });
};

generateGif("co tam formy bialka");
generateGif("a co mialbym powiedziec");
// generateGif("dobra ide mu wpierdolic");
