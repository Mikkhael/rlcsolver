class EquationsSystem
{
    constructor(constants, variables)
    { 
        // copy for safety
        this.constants = [...constants];
        this.variables = [...variables];
        
        this.equations = [];
    }
}

class Equation
{
    constructor()
    {
        this.left = new Operand();
        this.right = new Operand();
    }
}

class Operand
{
    constructor(type)
    {
        this.type = type;
        
        this.isNormalized = false;
        this.isConstantExpression = false;
        
    }
    
    getNormalized()
    {
        if(this.isNormalized)
        {
            return [this];
        }
        
        let normalized = this.getNormalized_impl();
        this.isNormalized = true;
        return normalized;
    }
    
    getNormalized_impl()
    {
        return [this];
    }
}


class Number extends Operand
{
    constructor(value)
    {
        super("number");
        
        this.value = value;
        
        this.isNormalized = true;
        this.isConstantExpression = true;
    }
}

class Constant extends Operand
{
    constructor(name, power = 1)
    {
        super("constant");
        
        this.name = name;
        this.power = power;
        
        this.isNormalized = power !== 0;
        this.isConstantExpression = true;
    }
    
    getNormalized_impl()
    {
        if(this.power === 0)
        {
            return [new Number(1)];
        }
        return [this];
    }
}

class Variable extends Operand
{
    constructor(name, diffLevel = 0, power = 1)
    {
        super("variable");
        
        this.diffLevel = diffLevel;
        this.power = power;
        
        this.name = name;
    }
}

class Product extends Operand
{
    constructor(operands, diffLevel = 0)
    {
        super("product");
        
        this.diffLevel = diffLevel;
        
        this.operands = operands;
    }
    
    getNormalized_impl()
    {
        // TODO
        
        return [this];
    }
}

class Sum extends Operand
{
    constructor(operands, diffLevel = 0, power = 1)
    {
        super("sum");
        
        this.diffLevel = diffLevel;
        this.power = 1;
        
        this.operands = operands;
    }
    
    getNormalized_impl()
    {
        // TODO
        
        return [this];
    }
}