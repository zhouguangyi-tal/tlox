import {RuntimeError, Value} from "./interpreter";
import {Token} from "./scanner";

export class Environment {
    readonly values = new Map<string, Value>();
    enclosing?: Environment;
    constructor(enclosing?: Environment) {
        this.enclosing = enclosing;
    }

    define(key: string, value: Value) {
        this.values.set(key, value);
    }
    get(name:Token){
        if(this.values.has(name.lexeme)){
            return this.values.get(name.lexeme) as Value;
        }
        if (this.enclosing) {
            return this.enclosing.get(name);
        }

        throw new RuntimeError(name,"Undefined variable '" + name.lexeme + "'.")
    }
    assign(name: Token, value: Value) {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }

        if (this.enclosing) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
    }
}