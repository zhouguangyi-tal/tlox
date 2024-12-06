import {Expr, ExprVisitor} from "./ats";
import {Token, TokenType} from "./scanner";


export class Interpreter implements ExprVisitor<Value>{
    visitLiteral(value: string | number | boolean | null): Value {//访问字面量
        return value;
    }

    visitGrouping(expression: Expr): Value {//访问在表达式中显式使用括号时产生的语法树节点
        return expression.accept(this);
    }

    visitUnary(operator: Token, expression: Expr): Value {//访问一元表达式
        const right = expression.accept(this);
        switch (operator.type) {
            case  TokenType.BANG:
                return !right
            case TokenType.MINUS:
                return -(right as number)
        }
        return undefined;
    }

    visitBinary(left: Expr, operator: Token, right: Expr): Value {//访问二元表达式
        const x = left.accept(this);
        const y = right.accept(this);
        switch (operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) > (y as number);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) >= (y as number);
            case TokenType.LESS:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) < (y as number);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) <= (y as number);
            case TokenType.MINUS:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) - (y as number);
            case TokenType.PLUS:
                if (typeof x === "number" && typeof y === "number") {
                    return x + y;
                }
                if (typeof x === "string" && typeof y === "string") {
                    return x + y;
                }
                throw new RuntimeError(
                    operator,
                    "both operands must be strings or numbers",
                );
            case TokenType.SLASH:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) / (y as number);
            case TokenType.STAR:
                this.checkNumberOperand(operator, { left: x, right: y });
                return (x as number) * (y as number);
            case TokenType.BANG_EQUAL:
                return x !== y;
            case TokenType.EQUAL_EQUAL:
                return x === y;
            default:
                break;
        }
        return null;
    }

    visitAssign(name: Token, value: Expr): Value {
        return undefined;
    }



    visitCall(operator: Expr, paren: Token, operands: Expr[]): Value {
        return undefined;
    }

    visitGet(object: Expr, name: Token): Value {
        return undefined;
    }



    visitLogical(left: Expr, operator: Token, right: Expr): Value {
        return undefined;
    }

    visitSet(object: Expr, name: Token, value: Expr): Value {
        return undefined;
    }

    visitSuper(keyword: Token, method: Token): Value {
        return undefined;
    }

    visitThis(keyword: Token): Value {
        return undefined;
    }

    visitVariable(name: Token): Value {
        return undefined;
    }

    private checkNumberOperand(operator: Token, operands: Record<string, Value>){
        const keys: [string, Value][] = [];
        for (const [k, v] of Object.entries(operands)) {
            if (typeof v !== "number") keys.push([k, v]);
        }
        if (keys.length === 0) return;
        throw new RuntimeError(
            operator,
            keys.map(([k, v]) =>
                `${k} operand must be number, was ${v?.toString() || "nil"}`
            ).join(),
        );
        
    }
    interpret(expression: Expr): Value {
        try{
            const value=  this.evaluate(expression);
            console.log('value',value)
            return value;
        }catch (e){
            throw e
        }
    }
    stringify(value: Value) {
        if (value === null) return "nil";
        return "" + value;
    }
    evaluate(expression: Expr) {
        return expression.accept(this);
    }
}


export type Value =
    | null
    | string
    | number
    | boolean
    | LoxCallable

abstract class LoxCallable {
    abstract arity(): number;
    abstract call(interpreter: Interpreter, operands: Value[]): Value;
}

export class RuntimeError extends Error {
    constructor(readonly token: Token, message: string) {
        super(message);
    }
}