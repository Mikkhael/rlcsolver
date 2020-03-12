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

LatexConverter.RationalExpression = function(expression)
{
	switch(expression.getType())
	{
		case "sum": return LatexConverter.RationalSum(expression.subExpression);
		case "product": return LatexConverter.RationalProduct(expression.subExpression);
	}
}

LatexConverter.RationalSum = function(sum)
{
	if(sum.isEmpty())
	{
		return "0";
	}
	
	let sumLatex = LatexConverter.RationalExpression(sum.summants[0]);
	
	for(let i=1; i<sum.summants.length; i++)
	{
		let temp = LatexConverter.RationalExpression(sum.summants[i]);
		if(temp[0] !== "-")
		{
			sumLatex += "+";
		}
		sumLatex += temp;
	}
	
	return sumLatex;
}

LatexConverter.RationalProduct = function(product)
{	
	if(product.monomial.isZero())
	{
		return "0";
	}
	
	let monomialLatex = LatexConverter.RationalMonomial(product.monomial);
	
	if(product.isMonomial())
	{
		return monomialLatex;
	}
	
	let denominatorLatex, numeratorLatex;
	
	if(product.denominator.length === 0)
	{
		denominatorLatex = "";
	}
	else if(product.denominator.length === 1)
	{
		denominatorLatex = LatexConverter.RationalExpression(product.denominator[0]);
	}
	else
	{
		denominatorLatex = product.denominator.map(x => `(${LatexConverter.RationalExpression(x)})`).join("");
	}
	
	if(product.numerator.length === 0)
	{
		numeratorLatex = "";
	}
	else if(product.numerator.length === 1)
	{
		numeratorLatex = LatexConverter.RationalExpression(product.numerator[0]);
	}
	else
	{
		numeratorLatex = product.numerator.map(x => `(${LatexConverter.RationalExpression(x)})`).join("");
	}
	
	
	
	if(product.hasNumerator())
	{
		
		if(product.hasDenominator())
		{
			
			if(monomialLatex === "1")
			{
				monomialLatex = "";
			}
			else if(monomialLatex === "-1")
			{
				monomialLatex = "-";
			}
			else if(product.monomial.isNumeric())
			{
				monomialLatex += " \\cdot ";
			}
			return ` ${monomialLatex}\\frac{${numeratorLatex}}{${denominatorLatex}} `;
		}
		
		if(monomialLatex === "1")
		{
			monomialLatex = "";
		}
		else if(monomialLatex === "-1")
		{
			monomialLatex = "-";
		}
		return ` ${monomialLatex} (${numeratorLatex}) `
	}
	
	return ` \\frac{${monomialLatex}}{${denominatorLatex}} `;
	
}

LatexConverter.RationalMonomial = function(monomial)
{
	let numericLatex = LatexConverter.NumericValue(monomial.numericValue);
	
	if(monomial.isNumeric())
	{
		return numericLatex;
	}
	
	let namedValueProductLatex = LatexConverter.NamedValueProduct(monomial.namedValueProduct);
	
	if(numericLatex === "1")
	{
		return namedValueProductLatex;
	}
	
	if(numericLatex === "-1")
	{
		return "-" + namedValueProductLatex;
	}
	
	return numericLatex + namedValueProductLatex;
}

LatexConverter.NumericValue = function(numericValue)
{
	return "" + numericValue.value;
}

LatexConverter.NamedValueProduct = function(namedValueProduct)
{
	if(namedValueProduct.isEmpty())
	{
		return "";
	}
	
	let namedValueProductLatex = "";
	
	for(let id in namedValueProduct.data)
	{
		namedValueProductLatex += `[${id}]^{${namedValueProduct.data[id]}}`;
	}
	
	return namedValueProductLatex;
}