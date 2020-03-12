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
        // { ("free" | variableId) : RationalExpression }
        this.variables = variables;
    }
}

class RationalExpression
{
    constructor(subExpression = new RationalProduct())
    {
        // RationalSubExpression
        this.subExpression = subExpression;
    }
    
    add(expression, reverse = false)
    {
        this.subExpression = this.subExpression.getAdded(expression.subExpression, reverse);
        return this;
    }
    
    multiply(expression, reverse = false)
    {
        this.subExpression = this.subExpression.getMultiplied(expression.subExpression, reverse);
        return this;
    }
    
    addMonomial(monomial, reverse = false)
    {
        return this.add(monomial.convertToExpression(), reverse);
    }
    multiplyMonomial(monomial, reverse = false)
    {
        return this.multiply(monomial.convertToExpression(), reverse);
    }
    
    copy()
    {
        return this.subExpression.copy().toExpression();
    }
    
    getType()
    {
        return this.subExpression.getType();
    }
}

function copyExpressionsArray(arr)
{
    return arr.map(x => x.copy());
}

class RationalSubExpression
{
    constructor(forewardOperands = [], reversedOperands = [])
    {
        this.forewardOperands = forewardOperands;
        this.reversedOperands = reversedOperands;
    }
    
    toExpression()
    {
        return new RationalExpression(this);
    }
    
    combine(subExpression, reverse = false)
    {
        if(reverse)
        {
            this.forewardOperands.push(...copyExpressionsArray(subExpression.reversedOperands));
            this.reversedOperands.push(...copyExpressionsArray(subExpression.forewardOperands));
        }
        else
        {
            this.forewardOperands.push(...copyExpressionsArray(subExpression.forewardOperands));
            this.reversedOperands.push(...copyExpressionsArray(subExpression.reversedOperands));
        }
    }
    
    insert(subExpression, reverse = false)
    {
        if(reverse)
        {
            this.reversedOperands.push(subExpression.copy().toExpression());
        }
        else
        {
            this.forewardOperands.push(subExpression.copy().toExpression());
        }
    }
    
    getType()
    {
        return "none";
    }
}

class RationalProduct extends RationalSubExpression
{
    constructor(numerator = [], denominator = [], monomial = new RationalMonomial())
    {
        super(numerator, denominator);
        this.monomial = monomial;
    }
    
    copy()
    {
        return new RationalProduct(copyExpressionsArray(this.forewardOperands), copyExpressionsArray(this.reversedOperands), this.monomial.copy());
    }
    
    getMultiplied(subExpression, reverse = false)
    {
        if(subExpression.getType() === "product")
        {
            this.monomial.multiplyByMonomial(subExpression.monomial, reverse);
            this.combine(subExpression, reverse);
        }
        else
        {
            this.insert(subExpression, reverse);
        }
        
        return this;
    }
    
    getAdded(subExpression, reverse = false)
    {
        if(reverse)
        {
            return new RationalSum([this.toExpression()], [subExpression.copy().toExpression()]);
        }
        
        return new RationalSum([this.toExpression(), subExpression.copy().toExpression()]);
    }
    
    getType()
    {
        return "product"
    }
}


class RationalSum extends RationalSubExpression
{
    constructor(positive = [], negative = [])
    {
        super(positive, negative);
    }
    
    copy()
    {
        return new RationalSum(copyExpressionsArray(this.forewardOperands), copyExpressionsArray(this.reversedOperands));
    }
    
    getMultiplied(subExpression, reverse = false)
    {
        if(reverse)
        {
            return new RationalProduct([this.toExpression()], [subExpression.copy().toExpression()]);
        }
        
        return new RationalProduct([this.toExpression(), subExpression.copy().toExpression()]);
    }
    
    getAdded(subExpression, reverse = false)
    {
        if(subExpression.getType() === "sum")
        {
            this.combine(subExpression, reverse);
        }
        else
        {
            this.insert(subExpression, reverse);
        }
        
        return this;
    }
    
    getType()
    {
        return "sum";
    }
}




class RationalMonomial
{
    constructor(numericValue = new NumericValue(1), namedValueProduct = new NamedValueProduct())
    {
        this.numericValue = numericValue;
        this.namedValueProduct = namedValueProduct;
    }
    
    multiplyByMonomial(other, reverse = false)
    {
        this.numericValue.multiplyByNumericValue(other.numericValue, reverse);
        this.namedValueProduct.multiplyByNamedValueProduct(other.namedValueProduct, reverse);
        
        return this;
    }
    
    copy()
    {
        return new RationalMonomial(this.numericValue.copy(), this.namedValueProduct.copy());
    }
    
    isZero()
    {
        return this.numericValue.isZero();
    }
    
    isOne()
    {
        return this.numericValue.isOne();
    }
    
    convertToProduct()
    {
        return new RationalProduct([], [], this);
    }
    
    convertToExpression()
    {
        return new RationalExpression(this.convertToProduct());
    }
}

RationalMonomial.create = function(value = 1, data = {})
{
    return new RationalMonomial(new NumericValue(value), new NamedValueProduct(data));
}

class NumericValue
{
    constructor(value = 0)
    {
        this.value = value;
    }
    
    negate()
    {
        this.value *= -1;
    }
    
    multiplyByNumericValue(other, reverse = false)
    {
        if(reverse)
        {
            this.value /= other.value;
        }
        else
        {
            this.value *= other.value;
        }
    }
    
    addNumericValue(other, reverse = false)
    {
        if(reverse)
        {
            this.value -= other.value;
        }
        else
        {
            this.value += other.value;
        }
    }
    
    copy()
    {
        return new NumericValue(this.value);
    }
    
    isZero()
    {
        return this.value === 0;
    }
    
    isOne()
    {
        return this.value === 1;
    }
}

class NamedValueProduct
{
    constructor(data = {})
    {
        // {id: exponent}
        this.data = data;
        for(let id in this.data)
        {
            if(!this.data[id])
            {
                delete this.data[id];
            }
        }
    }
    
    multiplyByNamedValueProduct(other, reverse = false)
    {
        for(let id in other.data)
        {
            if(reverse)
            {
                if(!this.data[id])
                {
                    this.data[id] = -other.data[id];
                }
                else
                {
                    this.data[id] -= other.data[id];
                }
            }
            else
            {
                if(!this.data[id])
                {
                    this.data[id] = other.data[id];
                }
                else
                {
                    this.data[id] += other.data[id];
                }
            }
            if(!this.data[id])
            {
                delete this.data[id];
            }
        }
    }
    
    copy()
    {
        let res = new NamedValueProduct();
        res.data = {...this.data};
        return res;
    }
}