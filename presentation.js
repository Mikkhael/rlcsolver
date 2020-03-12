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