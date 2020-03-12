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
        
        this.checkIfIsFlat();
        
        // TODO normalization
    }
    
    checkIfIsFlat()
    {
        return this.isFlat = this.numerator.isFlat && this.denominator.isFlat;
    }
    
    isStrictlyFlat()
    {
        return this.isFlat && this.denominator.isEmpty();
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
        
        this.checkIfIsFlat();
    }
    
    // TODO reduce the fractions
    
    multiplyBySumProduct(other, reverse = false)
    {
        if(reverse)
        {
            this.numerator.multiplyBySumProduct(other);
            this.isFlat = this.isFlat && this.numerator.isFlat();
        }
        else
        {
            this.denominator.multiplyBySumProduct(other);
            this.isFlat = this.isFlat && this.denominator.isFlat();
        }
    }
    
    addExpression(other, reverse = false)
    {
        if(!this.isSum())
        {
            this.shiftIntoRationalSum();
        }
        
        this.numerator.addExpression(other, reverse);
        this.isFlat = this.numerator.isFlat;  // if it is a sum of flat expresisons, the expression would not be flat, even tho it possibly could be, so this can be possibly fixed
    }
    
    negate()
    {
        this.monomial.negate();
    }
    
    shiftIntoRationalSum()
    {
        let expressionCopy = this.copy();
        
        this.numerator = new RationalSumProduct([new RationalSum([expressionCopy])]);
        
        this.monomial = new RationalMonomial();
        this.denominator = new RationalSumProduct();
        
        this.isFlat = this.isFlat && expressionCopy.denominator.isEmpty();
    }
    
    copy()
    {
        return new RationalExpression(this.monomial.copy(), this.numerator.copy(), this.denominator.copy());
    }
    
    isZero()
    {
        return this.monomial.isZero();
    }
    
    isMonomial()
    {
        return this.numerator.isEmpty() && this.denominator.isEmpty();
    }
    
    isSum()
    {
        return this.monomial.isOne() && this.denominator.isEmpty() && this.numerator.isSum();
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
    constructor(numericValue = new NumericValue(1), namedValueProduct = new NamedValueProduct())
    {
        this.numericValue = numericValue;
        this.namedValueProduct = namedValueProduct;
    }
    
    multiplyByMonomial(other, reverse = false)
    {
        this.numericValue.multiplyByNumericValue(other.numericValue, reverse);
        this.namedValueProduct.multiplyByNamedValueProduct(other.namedValueProduct, reverse);
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
}

class RationalSumProduct
{
    constructor(factors = [])
    {
        // [RationalSum]
        this.factors = factors;
        
        // (no nasted expression has a sum in the denominator)
        this.checkIfIsFlat();
    }
    
    checkIfIsFlat()
    {
        for(let factor of this.factors)
        {
            if(!factor.isFlat)
            {
                return this.isFlat = false;
            }
        }
        return this.isFlat = true;
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
        
        this.isFlat = true;
        
        return den;
    }
    
    multiplyBySumProduct(other)
    {
        this.factors = this.factors.concat(other.copy().factors);
        
        this.isFlat = this.isFlat && other.isFlat;
    }
    
    addSumProduct(other, reverse = false)
    {
        if(this.isSum() && other.isSum())
        {
            this.factors[0].addSum(other.factors[0], reverse);
            this.isFlat = this.isFlat && other.isFlat;
        }
        
        let thisExpression = this.convertToExpression();
        let otherExpression = other.convertToExpression();
        if(reverse)
        {
            other.negate();
        }
        this.factors = [new RationalSum([thisExpression, otherExpression])];
        this.isFlat = this.factors[0].isFlat;
    }
    
    addExpression(other, reverse = false)
    {
        addSumProduct(new RationalSumProduct([new RationalSum([other])]), reverse); // can be optimized
    }
    
    convertToExpression()
    {
        return new RationalExpression(new RationalMonomial(), this.copy(), new RationalSumProduct());
    }
    
    copy()
    {
        return new RationalSumProduct(this.factors.map(x => x.copy()));
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
        this.isFlat = false;
    }
    
    flattenAndReturnCommonDenominator()
    {
        let den = new RationalSumProduct();
        
        for(let summant of this.summants)
        {
            summant.flatten();
            den.multiplyBySumProduct(summant.denominator);
        }
        
        for(let summant of this.summants)
        {
            summant.multiplyBySumProduct(den);
        }
        
        this.isFlat = true;
    }
    
    addSum(other, reverse = false)
    {
        let otherCopy = other.copy();
        if(reverse)
        {
            other.negate();
        }
        this.summants = this.summants.concat(otherCopy);
        this.isFlat = this.isFlat && other.isFlat;
    }
    
    addExpression(other, reverse = false)
    {
        let otherCopy = other.copy();
        if(reverse)
        {
            other.negate();
        }
        this.summants.push(otherCopy);
        this.isFlat = this.isFlat && other.isStrictlyFlat;
    }
    
    multiplyAllByExpression(other, reverse = false)
    {
        for(let summant of this.summants)
        {
            summant.multiplyAllByExpression(other, reverse);
        }
        this.checkIfIsFlat();
    }
    
    negate()
    {
        for(let expression of this.summants)
        {
            expression.negate();
        }
    }
    
    copy()
    {
        return new RationalSum(this.summants.map(x => x.copy()));
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