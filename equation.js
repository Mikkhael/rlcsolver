class LinearEquationSystem
{
    constructor()
    {
        this.constantLookup = [];
        this.variableLookup = [""];
        
        this.equations = [];
    }
    
    addVariable(name)
    {
        // TODO
    }
    
    addConstant(name)
    {
        // TODO
    }
}

class LinearEquation
{
    constructor(left = new LinearExpression(), right = new LinearExpression())
    {
        this.left = left;
        this.right = right;
    }
}


class LinearExpression
{
    constructor(variables = {})
    {
        // { ("free" | variableId) : LinearCoefficient }
        this.variables = variables;
    }
}

