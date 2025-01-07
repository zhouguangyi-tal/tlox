import {RuntimeError, Value} from "./interpreter";
import {Token} from "./scanner";

export class Environment {
    readonly values = new Map<string, Value>();
    constructor(readonly enclosing: Environment | null = null) {}
    define(key: string, value: Value) {
        this.values.set(key, value);
    }
    get(name:Token){
        if(this.values.has(name.lexeme)){
            return this.values.get(name.lexeme) as Value;
        }
        throw new RuntimeError(name,"Undefined variable '" + name.lexeme + "'.")
    }
    assign(name: Token, value: Value) {
        if (this.values.has(name.lexeme)) {
            return this.values.set(name.lexeme, value);
        }
        if (this.enclosing === null) {
            throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
        }
        this.enclosing.assign(name, value);
    }
}