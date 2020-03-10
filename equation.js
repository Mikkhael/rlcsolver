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
    constructor(monomial = new RationalMonomial(), numerator = new RationalSumProduct(), denominator = new RationalSumProduct())
    {
        this.monomial = monomial;
        this.numerator = numerator;
        this.denominator = denominator;
        
        this.isFlat = false; //TODO calculate
        
        // TODO normalization
    }
    
    flatten()
    {
        if(this.isFlat)
        {
            return;
        }
        
        collapsedNumerator = this.numerator.flattenAndReturnCommonDenominator();
        collapsedDenominator = this.numerator.flattenAndReturnCommonDenominator();
        
        this.numerator = collapsedNumerator[0];
        this.denominator = collapsedDenominator[0];
        
        this.numerator.multiplyBySumProduct(collapsedDenominator[1]);
        this.denominator.multiplyBySumProduct(collapsedNumerator[1]);
        
        this.isFlat = true;
    }
    
    multiplyByExpression(other, reverse = false)
    {
        this.monomial.multiplyByMonomial(other.monomial, reverse);
        
        if(reverse)
        {
            this.numerator.multiplyBySumProduct(other.denominator);
            this.denominator.multiplyBySumProduct(other.numerator);
        }
        else
        {
            this.numerator.multiplyBySumProduct(other.numerator);
            this.denominator.multiplyBySumProduct(other.denominator);
        }
        
        this.isFlat = this.isFlat && other.isFlat;
    }
    
    addExpression(other, reverse = false)
    {
        // TODO
    }
    
    isZero()
    {
        return this.monomial.isZero();
    }
    
    isMonomial()
    {
        return this.numerator.isEmpty() && this.denominator.isEmpty();
    }
    
    isNUmericValue()
    {
        return this.isMonomial() && this.monomial.isNUmericValue();
    }
    
    isOne()
    {
        return this.isNUmericValue() && this.monomial.isOne();
    }
}

class RationalMonomial
{
    constructor(numericValue = new NumericValue(), namedValueProduct = new NamedValueProduct())
    {
        this.numericValue = numericValue;
        this.namedValueProduct = namedValueProduct;
    }
    
    multiplyByMonomial(other, reverse = false)
    {
        this.numericValue.multiplyByNumericValue(other.numericValue, reverse);
        this.namedValueProduct.multiplyByNamedValueProduct(other, this.namedValueProduct, reverse);
    }
    
    isZero()
    {
        return this.numericValue.isZero();
    }
    
    isOne()
    {
        return this.numericValue.isOne();
    }
}

class RationalSumProduct
{
    constructor(factors = [])
    {
        // [RationalSum]
        this.factors = factors;
        
        // TODO add test
        // (no nasted expression has a sum in the denominator)
        this.isFlat = false;
    }
    
    flattenAndReturnCommonDenominator()
    {
        if(this.isFlat)
        {
            return new RationalSumProduct();
        }
        
        let den = new RationalSumProduct();
        
        for(let sum of this.factors)
        {
            let tempDen = sum.flattenAndReturnCommonDenominator();
            den.multiplyBySumProduct(tempDen);
        }
        
        return den;
    }
    
    multiplyBySumProduct(other)
    {
        this.factors = this.factors.concat(other.factors);
        
        this.isFlat = this.isFlat && other.isFlat;
    }
    
    addSumProduct(other, reversed = false)
    {
        // TODO
    }
    
    isSum()
    {
        return this.factors.length === 1;
    }
    
    isEmpty()
    {
        return this.factors.length === 0;
    }
}

class RationalSum // TODO
{
    constructor(summants = [])
    {
        // [RationalExpression]
        this.summants = summants;
        
        // Sum of expressions with no denominator
        this.isFlatSum = false;
    }
    
    flattenAndReturnCommonDenominator()
    {
        // TODO
    }
    
    isEmpty()
    {
        return this.summants.length === 0;
    }
}

class NumericValue
{
    constructor(value = 0)
    {
        this.value = value;
    }
    
    multiplyByNumericValue(other, reverse = false)
    {
        if(reverse)
        {
            value /= other.value;
        }
        else
        {
            value *= other.value;
        }
    }
    
    addNumericValue(other, reverse = false)
    {
        if(reverse)
        {
            value -= other.value;
        }
        else
        {
            value += other.value;
        }
    }
    
    isZero()
    {
        return value === 0;
    }
    
    isOne()
    {
        return value === 1;
    }
}

class NamedValueProduct
{
    constructor(data = {})
    {
        // {id: exponent}
        this.data = [...data];
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
                this.data[id] += other.data[id];
            }
            else
            {
                this.data[id] -= other.data[id];
            }
            if(!this.data[id])
            {
                delete this.data[id];
            }
        }
    }
}