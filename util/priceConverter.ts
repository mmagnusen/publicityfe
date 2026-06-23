/** Format a pence amount with a currency symbol (e.g. 1999 → "£19.99"). */
const priceConverter = ({
	price,
	currency,
}: {
	price?: number;
	currency: string;
}): string => {
	if (typeof price !== "number" || Number.isNaN(price)) {
		return `${currency}0.00`;
	}

	return `${currency}${(price / 100).toFixed(2)}`;
};

export default priceConverter;
