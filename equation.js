
class EquationsSystem
{
    constructor(variablesNames, constantsNames)
    {
        // Copy for safety
        this.variables = [...variablesNames];
        this.constants = [...constantsNames];
        
        this.equations = [];
    }
}

class Equation
{
    constructor(operandsLeft, operandsRight)
    {
        this.left = [...operandsLeft];
        this.right = [...operandsRight];
        
        this.hasEmbeded = false;
        for(let operand of [...operandsLeft, ...operandsRight])
        {
            if(operand.hasEmbeded())
            {
                this.hasEmbeded = true;
                break;
            }
        }
    }
    
    deEmbed()
    {
        // TODO
    }
    
    isolateVariable(id)
    {
        // TODO
    }
}


class Scalar
{
    constructor(value)
    {
        this.value = value;
    }
    
    isZero()
    {
        return this.value === 0;
    }
    
    isOne()
    {
        return this.valie === 1;
    }
    
    add(scalar)
    {
        this.value += scalar.value;
    }
    
    multiply(scalar)
    {
        this.value *= scalar.value;
    }
}

class ConstantsList
{
    constructor(...constants)
    {
        this.data = {};
        this.addConstants(...constants);
    }
    
    addConstants(...constants)
    {
        for(let constant of constants)
        {
            if(constant instanceof Number)
            {
                this.data[constant]++;
            }
            else if(constant instanceof Array)
            {
                this.data[constant[0]] += constant[1];
            }
        }
        this.normalize();
    }
    
    subtractConstants(...constants)
    {
        for(let constant of constants)
        {
            if(constant instanceof Number)
            {
                this.data[constant]--;
            }
            else if(constant instanceof Array)
            {
                this.data[constant[0]] -= constant[1];
            }
        }
        this.normalize();
    }
    
    multiply(constantsList)
    {
        for(let constant in constantsList)
        {
            this.addConstants([constant, constantsList[constant]]);
        }
    }
    
    normalize()
    {
        let newData = {};
        for(let constant in this.data)
        {
            if(this.data[constant])
            {
                newData[constant] = this.data[constant];
            }
        }
        this.data = newData;
    }
    
    isEmpty()
    {
        return Object.keys(this.data).length === 0;
    }
}

class Summant
{
    constructor(scalar = new Scalar(0), constantsList = new ConstantsList())
    {
        this.scalar = scalar;
        this.constantsList = constantsList;
    }
    
    multiplyByConstant(constantId, power = 1)
    {
        if(power === 0)
        {
            return;
        }
        
        this.constantsList.addConstants([constantId, power]);
    }
    
    multiplyByConstanstList(constantsList)
    {
        this.constantsList.multiply(constantsList);
    }
    
    multiplyByScalar(scalar)
    {
        this.scalar.multiply(scalar);
    }
    
    multiply(summant)
    {
        this.multiplyByScalar(summant.scalar);
        this.multiplyByConstanstList(summant.constantsList);
    }
    
    addSimilar(scalar)
    {
        this.scalar.add(scalar);
    }
    
    isZero()
    {
        return this.scalar.isZero();
    }
    
    isScalar()
    {
        return this.constantsList.isEmpty();
    }
}

class Operand
{
    constructor(summants = [], variableId = -1, diffLevel = 0, embededEquation = null)
    {
        this.summants = summants;
        this.variableId = variableId;
        this.diffLevel = diffLevel;
        
        this.embededEquation = embededEquation;
    }
    
    normalize()
    {
        if(this.hasEmbeded())
        {
            this.deEmbed();
        }
        
        this.summants = this.summants.filter(x => !x.scalar.isZero());
        
        // TODO collapse similars
    }
    
    // TODO arithmetic
    
    hasEmbeded()
    {
        return this.embededEquation !== null;
    }
    
    deEmbed()
    {
        // TODO
    }
    
}