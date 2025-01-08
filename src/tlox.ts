import { Scanner } from "./scanner";
import {Parser} from "./parser";
import { Interpreter } from "./interpreter";


const sourceText = document.getElementById('sourceCode') as HTMLTextAreaElement;
const runButton = document.getElementById('runButton')
runButton.addEventListener('click', () => {
  run(sourceText.value)
})


function run(source: string) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens)
  // console.log('zzz',tokens);
  const statements = parser.parse()
  const interpreter = new Interpreter()
  interpreter.interpret(statements)
 /* tokens.forEach((item) => {
    console.log(item);
  });*/

}