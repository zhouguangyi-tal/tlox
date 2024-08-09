import readline from "readline";
import fs from "fs";
import path from "path";

function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("line", (input) => {
    console.log(input);
    if (input == "exit") {
      //命令退出
      process.exit(0);
    }
  });
}

function runFile(fileName: string) {
  const filePath = path.join(__dirname, "../code/", fileName);
  console.log("", filePath);
  // 读取文件内容
  let sourceCode: string = fs.readFileSync(filePath, "utf8");
  run(sourceCode);
}

function main() {
  runFile("index.txt");
}

function run(source: string) {}

main();
