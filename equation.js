class LinearEquationSystem
{
    constructor()
    {
        this.constantLookup = {};
        this.variableLookup = {};
        
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

class LinearSummant
{
    constructor(coefficient = new RationalExpression(), diffLevel = 0)
    {
        this.coefficient = coefficient;
        this.diffLevel = diffLevel;
    }
    
    isVariable()
    {
        return false;
    }
    
    isExpression()
    {
        return false;
    }
}

class LinearVariable extends LinearSummant
{
    constructor(variableId, coefficient = new RationalExpression(), diffLevel = 0)
    {
        super(coefficient, diffLevel);
        
        this.variableId = variableId;
    }
    
    copy()
    {
        return new LinearVariable(this.variableId, this.coefficient.copy(), this.diffLevel)
    }
    
    isSimmilarTo(other)
    {
        return this.variableId === other.variableId && this.diffLevel === other.diffLevel;
    }
    
    isVariable()
    {
        return true;
    }
}

class LinearExpression extends LinearSummant
{
    constructor(variableSummants = [], freeSummants = [], coefficient = new RationalExpression(), diffLevel = 0)
    {
        super(coefficient, diffLevel)
        
        // [LinearSummant]
        this.variableSummants = variableSummants;
        
        // [RationalExpression]
        this.freeSummants = freeSummants;
        
        this.isGrouped = false;
        this.isNasted = variableSummants.some(x => x.isExpression());
    }
    
    isExpression()
    {
        return true;
    }
    
    copy()
    {
        let res = new LinearExpression(copyArray(this.variableSummants), copyArray(this.freeSummants), this.coefficient.copy(), this.diffLevel);
        res.isGrouped = this.isGrouped;
        return res;
    }
    
    deNaste(deep = true)
    {
        if(!this.isNasted)
        {
            return this;
        }
        
        this.isGrouped = false;
        this.isNasted = false;
        
        let newVariableSummants = [];
        let newFreeSummants = [];
        for(let i=0; i<this.variableSummants.length; i++)
        {
            let temp = this.variableSummants[i];
            if(temp.isExpression())
            {
                temp.collapse();
                
                if(deep)
                {
                    temp.deNaste();
                }
                else if(temp.isNasted)
                {
                    this.isNasted = true;
                }
                
                
                newVariableSummants.push(...temp.variableSummants);
                newFreeSummants.push(...temp.freeSummants);
                this.variableSummants.splice(i, 1);
                i--;
            }
        }
        this.variableSummants.push(...newVariableSummants);
        this.freeSummants.push(...newFreeSummants);
        
        return this;
    }
    
    group()
    {
        if(this.isGrouped)
        {
            return this;
        }
        
        this.deNaste();
        
        let sortFunction = function(a, b)
        {
            if(a.variableId < b.variableId)
                return -1;
            if(a.variableId > b.variableId)
                return 1;
            return b.diffLevel - a.diffLevel;
        }
        
        this.variableSummants.sort(sortFunction);
        
        for(let i=1; i<this.variableSummants.length; i++)
        {
            let next = this.variableSummants[i];
            let temp = this.variableSummants[i-1];
            
            if(temp.isSimmilarTo(next))
            {
                temp.coefficient.add(next.coefficient);
                this.variableSummants.splice(i, 1);
                i--;
            }
        }
        
        if(this.freeSummants.length > 1)
        {
            let free = new RationalExpression();
            for(let summant of this.freeSummants)
            {
                free.add(summant);
            }
            this.freeSummants = [free];
        }
        
        this.isGrouped = true;
        
        return this;
    }
    
    collapse()
    {
        this.differenciate(this.diffLevel);
        this.multiplyByRationalExpression(this.coefficient);
        this.diffLevel = 0;
        this.coefficient = new RationalExpression();
        
        return this;
    }
    
    differenciate(n = 0)
    {
        if(n !== 0)
        {
            for(let summant of this.variableSummants)
            {
                summant.diffLevel += n;
            }
            this.freeSummants = [];
        }
        
        return this;
    }
    
    multiplyByRationalExpression(expression, reverse = false) // can be improved by checking if we multiply by one
    {
        for(let summant of this.variableSummants)
        {
            summant.coefficient.multiply(expression, reverse);
        }
        for(let summant of this.freeSummants)
        {
            summant.multiply(expression, reverse);
        }
        
        return this;
    }
    
    addLinearSummant(summant, reverse = false)
    {
        let summantCopy = summant.copy();
        if(reverse)
        {
            summantCopy.multiplyByRationalExpression(RationalExpression.NegativeOne);
        }
        this.variableSummants.push(...summantCopy.variableSummants);
        this.freeSummants.push(...summantCopy.freeSummants);
        
        this.isGrouped = false;
        this.isNasted = this.isNasted || summant.isNasted;
        
        return this;
    }
    
    isEmpty()
    {
        return this.variableSummants.length === 0 && this.freeSummants.length === 0;
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
    
    substituteNamedValueWithMonomial(monomial)
    {
        // TODO
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

function copyArray(arr)
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
        return new RationalProduct(copyArray(this.numerator), copyArray(this.denominator), this.monomial.copy());
    }
    
    getMultiplied(subExpression, reverse = false)
    {
        if(subExpression.getType() === "product")
        {
            this.monomial.multiplyByMonomial(subExpression.monomial, reverse);
            if(reverse)
            {
                this.numerator.push(...copyArray(subExpression.denominator));
                this.denominator.push(...copyArray(subExpression.numerator));
            }
            else
            {
                this.numerator.push(...copyArray(subExpression.numerator));
                this.denominator.push(...copyArray(subExpression.denominator));
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
        return new RationalSum(copyArray(this.summants));
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
    
    toExpression() // alias
    {
        return this.convertToExpression();
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


RationalMonomial.create = function(value = 1, data = {})
{
    return new RationalMonomial(new NumericValue(value), new NamedValueProduct(data));
}
RationalMonomial.NegativeOne = RationalMonomial.create(-1);
RationalMonomial.One = RationalMonomial.create(1);
RationalMonomial.Zero = RationalMonomial.create(0);

RationalExpression.NegativeOne = RationalMonomial.create(-1).toExpression();
RationalExpression.One = RationalMonomial.create(1).toExpression();
RationalExpression.Zero = RationalMonomial.create(0).toExpression();