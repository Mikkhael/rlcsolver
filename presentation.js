class CircutCanvas
{
	constructor(canvas)
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
	}
}




/// Equations


const LatexConverter = {};

LatexConverter.RationalExpression = function(expression, namedValueLookup = {})
{
	switch(expression.getType())
	{
		case "sum": return LatexConverter.RationalSum(expression.subExpression, namedValueLookup);
		case "product": return LatexConverter.RationalProduct(expression.subExpression, namedValueLookup);
	}
}

LatexConverter.RationalExpressionInProduct = function(expression, namedValueLookup = {})
{
	let res;
	switch(expression.getType())
	{
		case "sum": res = LatexConverter.RationalSum(expression.subExpression, namedValueLookup); break;
		case "product": res = LatexConverter.RationalProduct(expression.subExpression, namedValueLookup); break;
	}
	
	if(res === "1")
	{
		return  "";
	}
	if(res === "-1")
	{
		return "-";
	}
	if(expression.getType() === "sum")
	{
		return "(" + res + ")";
	}
	
	return res;
}

LatexConverter.RationalSum = function(sum, namedValueLookup = {})
{
	
	if(sum.isEmpty())
	{
		return "0";
	}
	
	let sumLatex = LatexConverter.RationalExpression(sum.summants[0], namedValueLookup);
	
	for(let i=1; i<sum.summants.length; i++)
	{
		let temp = LatexConverter.RationalExpression(sum.summants[i], namedValueLookup);
		if(temp[0] !== "-")
		{
			sumLatex += "+";
		}
		sumLatex += temp;
	}
	
	return sumLatex;
}

LatexConverter.RationalProduct = function(product, namedValueLookup = {})
{	
	if(product.monomial.isZero())
	{
		return "0";
	}
	
	if(product.isMonomial())
	{
		return LatexConverter.RationalMonomial(product.monomial, false, namedValueLookup);
	}
	
	let denominatorLatex = product.denominator.map(x => LatexConverter.RationalExpression(x, namedValueLookup));
	if(product.denominator.length > 1)
	{
		denominatorLatex = denominatorLatex.map(x => '('+x+')');
	}
	denominatorLatex = denominatorLatex.join("");
	
	let numeratorLatex = product.numerator.map(x => LatexConverter.RationalExpression(x, namedValueLookup));
	if(product.numerator.length > 1)
	{
		numeratorLatex = numeratorLatex.map(x => '('+x+')');
	}
	numeratorLatex = numeratorLatex.join("");
	
	let monomialLatex;
	if(product.hasNumerator())
	{
		monomialLatex = LatexConverter.RationalMonomial(product.monomial, true, namedValueLookup);
		if(product.hasDenominator())
		{
			if(product.monomial.isNumeric() && !product.monomial.isOne() && !product.monomial.isNegativeOne())
			{
				monomialLatex += " \\cdot ";
			}
			return ` ${monomialLatex}\\frac{${numeratorLatex}}{${denominatorLatex}} `;
		}
		return ` ${monomialLatex} (${numeratorLatex}) `
	}
	monomialLatex = LatexConverter.RationalMonomial(product.monomial, false, namedValueLookup);
	return ` \\frac{${monomialLatex}}{${denominatorLatex}} `;
	
}

LatexConverter.RationalMonomial = function(monomial, skipIdentity = false, namedValueLookup = {})
{
	
	if(monomial.isNumeric())
	{
		return LatexConverter.NumericValue(monomial.numericValue, skipIdentity);
	}
	
	let numericLatex = LatexConverter.NumericValue(monomial.numericValue, true);
	let namedValueProductLatex = LatexConverter.NamedValueProduct(monomial.namedValueProduct, namedValueLookup);
		
	return numericLatex + namedValueProductLatex;
}

LatexConverter.NumericValue = function(numericValue, skipIdentity = false)
{
	if(skipIdentity)
	{
		if(numericValue.isOne())
		{
			return "";
		}
		if(numericValue.isNegativeOne())
		{
			return "-";
		}
	}
	
	return "" + numericValue.value;
}

LatexConverter.NamedValueProduct = function(namedValueProduct, namedValueLookup = {})
{
	if(namedValueProduct.isEmpty())
	{
		return "";
	}
	
	function getNamedValueString(id){return namedValueLookup[id] || `[${id}]`};	
	let namedValueProductLatex = "";
	for(let id in namedValueProduct.data)
	{
		namedValueProductLatex += getNamedValueString(id);
		if(namedValueProduct.data[id] !== 1)
		{
			namedValueProductLatex += "^{" + namedValueProduct.data[id] + "}";
		}
	}
	
	return namedValueProductLatex;
}

LatexConverter.TimeDifferential = function(rank = 1, variable = "")
{
	return ` \\frac{\\mathrm{d}${rank !== 1 ? "^"+rank : ""} ${variable}}{\\mathrm{d} t${rank !== 1 ? "^"+rank : ""}} `;
}
LatexConverter.TimeIntegral = function(rank = 1, inside = "")
{
	return ` \\${"i".repeat(rank)}nt_{0}^{t} ${inside} ${"\\mathrm{d}\\tau".repeat(rank)} `;
}

LatexConverter.LinearSummant = function(summant, constantsNameLookup = {}, variablesNameLookup = {})
{
	if(summant.isVariable())
	{
		return LatexConverter.LinearVariable(summant, constantsNameLookup, variablesNameLookup);
	}
	else if(summant.isExpression())
	{
		return LatexConverter.LinearExpression(summant, constantsNameLookup, variablesNameLookup)
	}
	return "";
}

LatexConverter.LinearExpression = function(expression, constantsNameLookup = {}, variablesNameLookup = {})
{	
	if(expression.isEmpty())
	{
		return "0";
	}
	
	let coefficientLatex = LatexConverter.RationalExpressionInProduct(expression.coefficient, constantsNameLookup);
	let insideLatex = "";
	for(let summant of expression.variableSummants)
	{
		let summantLatex = LatexConverter.LinearSummant(summant, constantsNameLookup, variablesNameLookup);
		if(summantLatex[0] !== "-"){
			summantLatex = "+" + summantLatex;
		}
		insideLatex += summantLatex;
	}
	for(let summant of expression.freeSummants)
	{
		let summantLatex = LatexConverter.RationalExpression(summant, constantsNameLookup);
		if(summantLatex[0] !== "-"){
			summantLatex = "+" + summantLatex;
		}
		insideLatex += summantLatex;
	}
	if(insideLatex[0] === "+")
	{
		insideLatex = insideLatex.slice(1);
	}
	if(expression.diffLevel === 0)
	{
		if(coefficientLatex === "")
		{
			return insideLatex;
		}
		return coefficientLatex + "(" + insideLatex + ")";
	}
	if(expression.diffLevel > 0)
	{
		return coefficientLatex + LatexConverter.TimeDifferential(expression.diffLevel) + "(" + insideLatex + ")";
	}
	return coefficientLatex + LatexConverter.TimeIntegral(-expression.diffLevel, "(" + insideLatex + ")");
	
}

LatexConverter.LinearVariable = function(variable, constantsNameLookup = {}, variablesNameLookup = {})
{	
	let coefficientLatex = LatexConverter.RationalExpressionInProduct(variable.coefficient, constantsNameLookup);
	let variableLatex = variablesNameLookup[variable.variableId] || `[${variable.variableId}]`;
	if(variable.diffLevel > 0)
	{
		return coefficientLatex + LatexConverter.TimeDifferential(variable.diffLevel, variableLatex);
	}
	else if(variable.diffLevel < 0)
	{
		return coefficientLatex + LatexConverter.TimeIntegral(-variable.diffLevel, variableLatex);
	}
	return coefficientLatex + variableLatex;
}