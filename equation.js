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
    
    negate()
    {
        this.subExpression.negate();
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
    constructor(){}
    
    toExpression()
    {
        return new RationalExpression(this);
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
        super();
        
        // [RationalExpression]
        this.numerator = numerator;
        this.denominator = denominator;
        
        this.monomial = monomial;
    }
    
    copy()
    {
        return new RationalProduct(copyExpressionsArray(this.numerator), copyExpressionsArray(this.denominator), this.monomial.copy());
    }
    
    getMultiplied(subExpression, reverse = false)
    {
        if(subExpression.getType() === "product")
        {
            this.monomial.multiplyByMonomial(subExpression.monomial, reverse);
            if(reverse)
            {
                this.numerator.push(...copyExpressionsArray(subExpression.denominator));
                this.denominator.push(...copyExpressionsArray(subExpression.numerator));
            }
            else
            {
                this.numerator.push(...copyExpressionsArray(subExpression.numerator));
                this.denominator.push(...copyExpressionsArray(subExpression.denominator));
            }
        }
        else
        {
            if(reverse)
            {
                this.denominator.push(subExpression.copy().toExpression());
            }
            else
            {
                this.numerator.push(subExpression.copy().toExpression());
            }
        }
        
        return this;
    }
    
    getAdded(subExpression, reverse = false)
    {
        if(reverse)
        {
            return new RationalSum([this.toExpression(), subExpression.copy().negate().toExpression()]);
        }
        return new RationalSum([this.toExpression(), subExpression.copy().toExpression()]);
    }
    
    normalize()
    {
        // TODO
    }
    
    negate()
    {
        this.monomial.multiplyByMonomial(RationalMonomial.create(-1));
        return this;
    }
    
    isMonomial()
    {
        return this.numerator.length === 0 && this.denominator.length === 0;
    }
    
    hasNumerator()
    {
        return this.numerator.length > 0;
    }
    
    hasDenominator()
    {
        return this.denominator.length > 0;
    }
    
    getType()
    {
        return "product";
    }
}


class RationalSum extends RationalSubExpression
{
    constructor(summants = [])
    {
        super();
        
        // [RationalExpression]
        this.summants = summants;
    }
    
    copy()
    {
        return new RationalSum(copyExpressionsArray(this.summants));
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
            if(reverse)
            {
                this.summants.push(...subExpression.copy().negate().summants);
            }
            else
            {
                this.summants.push(...subExpression.copy().summants);
            }
        }
        else
        {
            if(reverse)
            {
                this.summants.push(subExpression.copy().negate().toExpression());
            }
            else
            {
                this.summants.push(subExpression.copy().toExpression());
            }
        }
        
        return this;
    }
    
    normalize()
    {
        // TODO
    }
    
    negate()
    {
        for(let summant of this.summants)
        {
            summant.negate();
        }
        return this;
    }
    
    isEmpty()
    {
        return this.summants.length === 0;
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
        return this.isNumeric() && this.numericValue.isOne();
    }
    
    isNegativeOne()
    {
        return this.isNumeric() && this.numericValue.isNegativeOne();
    }
    
    isNumeric()
    {
        return this.namedValueProduct.isEmpty();
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
    
    isNegativeOne()
    {
        return this.value === -1;
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
    
    isEmpty()
    {
        return Object.keys(this.data).length === 0;
    }
}