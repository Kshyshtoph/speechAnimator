import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
import * as dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const configuration = new Configuration({
  apiKey: process.env.OPENAI_TOKEN,
});

class Client {
  openai = new OpenAIApi(configuration);
  async generateVariation(prompt) {
    const response = await this.openai.createImageEdit(
      fs.createReadStream("image.png"),
      fs.createReadStream("morda.png"),
      prompt,
      4,
      "512x512"
    );

    return response.data.data.map(({ url }) => url);
  }

  async generateImage(desc) {
    return await this.openai
      .createImage({
        prompt: desc,
        n: 1,
        size: "1024x1024",
      })
      .then((res) => {
        // console.log(res.data);
        return res.data;
      });
  }

  async processInput(input) {
    return await this.openai
      .createEdit({
        input,
        model: "text-davinci-edit-001",
        instruction: "propose a painting title",
      })
      .then((res) => {
        fs.writeFileSync("debug.txt", JSON.stringify(res.data), {
          encoding: "utf-8",
        });
        return res.data;
      });
  }
}

export default Client;

const arr = [];
const client = new Client();
for (let i = 65; i <= 90; i++) arr.push(String.fromCharCode(i));

const asyncLoop = async (arr) => {
  for (let i = 0; i < arr.length; i++) {
    await delay(5000);
    const e = arr[i];
    console.log(e);
    await client
      .generateVariation("make THIS man look like he's saying '" + e + "'")
      .then((img) =>
        img.forEach((url, i) => {
          getImage({ url, name: e + i });
        })
      );
  }
};

asyncLoop(arr);

const getImage = ({ url, name }) => {
  fetch(url).then((res) =>
    res.body.pipe(
      fs.createWriteStream(
        path.join(process.cwd(), "static", "alphabet", name + ".png")
      )
    )
  );
};
