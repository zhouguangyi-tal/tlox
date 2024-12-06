import {Token, TokenType} from "./scanner";
import {Binary, Expr, Grouping, Literal, Unary} from "./ats";

//解析器
export class Parser {
    current = 0

    constructor(readonly tokens: Token[]) {
        console.log(this.tokens)
    }

    parse(){
        const statements: Stmt[] = [];
    }

    expression(): Expr {
        return this.equality()
    }

     equality() {// ==   !=
        let expr: Expr = this.comparison()
        while (this.match(TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
            let operator = this.previous()
            let right = this.comparison()
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    comparison(): Expr { // >  >=  <  <=
        let expr: Expr = this.term()
        while (this.match(TokenType.GREATER,TokenType.GREATER_EQUAL,TokenType.LESS,TokenType.LESS_EQUAL)){
            let operator = this.previous()
            let right = this.term()
            expr = new Binary(expr,operator, right);
        }
        return  expr
    }
    term(): Expr {// - +
       let expr = this.factor()
        while (this.match(TokenType.MINUS,TokenType.PLUS)){
            let operator = this.previous()
            let right = this.factor()
            expr = new Binary(expr,operator, right);
        }
        return  expr
    }

    factor(): Expr {// / *
        let expr = this.unary()
        while (this.match(TokenType.SLASH,TokenType.STAR)){
            let operator = this.previous()
            let right = this.unary()
            expr = new Binary(expr,operator, right);
        }
        return  expr
    }

    unary(): Expr {// ! -
        if (this.match(TokenType.BANG,TokenType.MINUS)){
            let operator = this.previous()
            let right = this.unary()
            return new Unary(operator,right)
        }
        return  this.primary()
    }

    primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);
        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
        }
        if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new Grouping(expr);
        }
        throw this.error(this.peek(), "Expect expression.");
    }

    binary(parser: () => Expr, ...operatorTypes: TokenType[]): Expr {
        let expr: Expr = parser.bind(this)();
        while (this.match(...operatorTypes)) {
            const operator = this.previous();
            const right = parser.bind(this)();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    consume(type:TokenType,message:string): Token {
        if(this.check(type)) return  this.advance()
        throw this.error(this.peek(), message);
    }
    error(token: Token, message: string) {
        // this.logger.parseError(token, message);
        return new ParseError();
    }
    check(type: TokenType): boolean {
        if (this.isAtEnd()) return false
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous()
    }
    isAtEnd() {
        return this.peek().type == TokenType.EOF
    }

    peek() {
        return this.tokens[this.current]
    }

    previous() {
        return this.tokens[this.current - 1]
    }


}

export class ParseError extends Error {}
