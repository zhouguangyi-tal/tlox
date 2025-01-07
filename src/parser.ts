import {Token, TokenType} from "./scanner";
import {Assign, Binary, Expr, Expression, Grouping, Literal, Print, Stmt, Unary, Var, Variable} from "./ats";

//解析器
export class Parser {
    current = 0

    constructor(readonly tokens: Token[]) {
        console.log(this.tokens)
    }

    parse(){
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration())
        }
        return statements;
    }
    declaration (){
        try {
            // if (this.match(TokenType.FUN)) return this.callable("function");
            if (this.match(TokenType.VAR)) return this.varDeclaration();
            return this.statement();
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
            this.synchronize();
            return null
        }
    }
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.peek().type === TokenType.SEMICOLON) return;
            if (
                [
                    TokenType.CLASS,
                    TokenType.FUN,
                    TokenType.VAR,
                    TokenType.FOR,
                    TokenType.IF,
                    TokenType.WHILE,
                    TokenType.PRINT,
                    TokenType.RETURN,
                ].includes(this.peek().type)
            ) {
                return;
            }
            this.advance();
        }
    }
    statement() {
        if(this.match(TokenType.PRINT))
            return this.printStatement();
        return this.expressionStatement();
    }
    printStatement() {
        const expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression");
        return new Print(expr);
    }
    varDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");
        let initializer: Expr | undefined = undefined;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        // console.log("zzz var", new Var(name, initializer),initializer)
        return new Var(name, initializer);
    }

    expressionStatement() {
        const expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression");
        return new Expression(expr);
    }

    assignment(): Expr {
        let expr = this.equality()

        if (this.match(TokenType.EQUAL)) {
            
            let equals = this.previous()
            let value = this.assignment()
            if (expr instanceof Variable) {
                let name = expr.name
                return new Assign(name, value)
            }
            throw this.error(equals, "Invalid assignment target.")
        }
        return expr;
    }
    expression(): Expr {
        return this.assignment();
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
        if(this.match(TokenType.IDENTIFIER)) return  new Variable(this.previous())
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
