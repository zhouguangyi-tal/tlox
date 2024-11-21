import {Token} from "./scanner";

export interface ExprVisitor<R> {
    visitAssign(
        name: Token,
        value: Expr,
    ): R;
    visitBinary(
        left: Expr,
        operator: Token,
        right: Expr,
    ): R;
    visitCall(
        operator: Expr,
        paren: Token,
        operands: Expr[],
    ): R;
    visitGet(
        object: Expr,
        name: Token,
    ): R;
    visitGrouping(
        expression: Expr,
    ): R;
    visitLiteral(
        value: null | string | number | boolean,
    ): R;
    visitLogical(
        left: Expr,
        operator: Token,
        right: Expr,
    ): R;
    visitSet(
        object: Expr,
        name: Token,
        value: Expr,
    ): R;
    visitSuper(
        keyword: Token,
        method: Token,
    ): R;
    visitThis(
        keyword: Token,
    ): R;
    visitUnary(
        operator: Token,
        expression: Expr,
    ): R;
    visitVariable(
        name: Token,
    ): R;
}

export interface Expr {
    accept<R>(visitor: ExprVisitor<R>): R;
}

export class Assign implements Expr {
    constructor(
        readonly name: Token,
        readonly value: Expr,
    ) {}
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitAssign(
            this.name,
            this.value,
        );
    }
    toString() {
        const body = [
            "Assign",
            this.name?.toString(),
            this.value?.toString(),
        ].filter((it) => it).join(" ");
        return "(" + body + ")";
    }
}

//二元表达式，有左值、右值和操作符
export class Binary implements Expr {
    constructor(
        readonly left: Expr,
        readonly operator: Token,
        readonly right: Expr,
    ) {}
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitBinary(
            this.left,
            this.operator,
            this.right,
        );
    }
    toString() {
        const body = [
            "Binary",
            this.left?.toString(),
            this.operator?.toString(),
            this.right?.toString(),
        ].filter((it) => it).join(" ");
        return "(" + body + ")";
    }
}

//一元表达式
export class Unary implements Expr {
    constructor(
        readonly operator: Token,
        readonly expression: Expr,
    ) {}
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitUnary(
            this.operator,
            this.expression,
        );
    }
    toString() {
        const body = [
            "Unary",
            this.operator?.toString(),
            this.expression?.toString(),
        ].filter((it) => it).join(" ");
        return "(" + body + ")";
    }
}


export class Literal implements Expr {
    constructor(
        readonly value: null | string | number | boolean,
    ) {}
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLiteral(
            this.value,
        );
    }
    toString() {
        const body = [
            "Literal",
            this.value?.toString(),
        ].filter((it) => it).join(" ");
        return "(" + body + ")";
    }
}


export class Grouping implements Expr {
    constructor(
        readonly expression: Expr,
    ) {}
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitGrouping(
            this.expression,
        );
    }
    toString() {
        const body = [
            "Grouping",
            this.expression?.toString(),
        ].filter((it) => it).join(" ");
        return "(" + body + ")";
    }
}