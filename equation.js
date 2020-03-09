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
        
        this.isCollapsedFraction = false; //TODO calculate
        
        // TODO normalization
    }
    
    collapseFractions()
    {
        if(this.isCollapsedFraction)
        {
            return;
        }
        
        collapsedNumerator = this.numerator.getCollapsedFraction();
        collapsedDenominator = this.numerator.getCollapsedFraction();
        
        this.numerator = collapsedNumerator[0];
        this.denominator = collapsedDenominator[0];
        
        this.numerator.multiplyBySumProduct(collapsedDenominator[1]);
        this.denominator.multiplyBySumProduct(collapsedNumerator[1]);
        
        this.isCollapsedFraction = true;
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
        
        // TODO improve normality update
        this.isCollapsedFraction = false;
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
        
        // TODO add isCollapsedFraction test
        this.isCollapsedFraction = false;
    }
    
    getCollapsedFraction()
    {
        if(this.isCollapsedFraction)
        {
            return [this, new RationalSumProduct()];
        }
        
        // TODO
    }
    
    multiplyBySumProduct(other)
    {
        this.factors = this.factors.concat(other.factors);
        
        this.isCollapsedFraction = this.isCollapsedFraction && other.isCollapsedFraction;
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