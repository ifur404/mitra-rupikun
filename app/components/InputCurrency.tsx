import React, { useState, ForwardedRef, useEffect } from 'react';
import { Input } from './ui/input';

interface InputCurrencyProps {
  onChange?: (value: string) => void;
  defaultValue: string;
  required?: boolean;
  name: string;
  id: string;
  disabled?: boolean
}

export const currencyMaskOptionsIDR = {
  prefix: 'Rp ',
  suffix: '',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: '.',
  allowDecimal: false,
  decimalSymbol: ',',
  decimalLimit: 0, // how many digits allowed after the decimal
  integerLimit: 14, // limit length of integer numbers
  allowNegative: true,
  allowLeadingZeroes: false,
}

export const currencyMaskOptions = {
  prefix: '$',
  suffix: '',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ',',
  allowDecimal: true,
  decimalSymbol: '.',
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 10, // limit length of integer numbers
  allowNegative: true,
  allowLeadingZeroes: false,
}


export function convertCurrencyToDecimal(currencyString: string, format = "IDR"): number {
  const { prefix, suffix, includeThousandsSeparator, thousandsSeparatorSymbol, decimalSymbol } = format === "USD" ? currencyMaskOptions : currencyMaskOptionsIDR;

  let decimalString = currencyString;

  if (prefix) {
    decimalString = decimalString.replace(prefix, '');
  }

  if (suffix) {
    decimalString = decimalString.replace(suffix, '');
  }

  if (includeThousandsSeparator && thousandsSeparatorSymbol) {
    const thousandsSeparatorRegex = new RegExp(`\\${thousandsSeparatorSymbol}`, 'g');
    decimalString = decimalString.replace(thousandsSeparatorRegex, '');
  }

  // decimalString = decimalString.replace(decimalSymbol, '.');

  const decimalValue = parseFloat(decimalString) || 0.00;
  return decimalValue;
}

export const formatCurrency = (inputValue: string): string => {
  if(!inputValue) return ""
  let numericValue = inputValue.replace(/[^0-9-]/g, ""); // Allow '-' in addition to digits
  const isNegative = numericValue.startsWith("-"); // Check if the value is negative

  numericValue = numericValue.replace(/-/g, ""); // Remove '-' for now

  numericValue = numericValue.slice(0, currencyMaskOptionsIDR.integerLimit);

  let formattedCurrency = numericValue.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currencyMaskOptionsIDR.thousandsSeparatorSymbol
  );
  formattedCurrency = currencyMaskOptionsIDR.prefix + formattedCurrency;

  // Add back the '-' sign if the value was negative
  if (isNegative && currencyMaskOptionsIDR.allowNegative) {
    formattedCurrency = "-" + formattedCurrency;
  }

  return formattedCurrency;
};

const InputCurrency = React.forwardRef((props: InputCurrencyProps, ref: ForwardedRef<HTMLInputElement>) => {
  const [vvalue, setVvalue] = useState("");

  useEffect(() => {
    const formattedCurrency = formatCurrency(props.defaultValue || '');
    setVvalue(formattedCurrency);
  }, [props?.defaultValue]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = event.target.value;
    let formattedCurrency = formatCurrency(inputValue);
    setVvalue(formattedCurrency);
    if (props.onChange) {
      props.onChange(formattedCurrency);
    }
  };


  return <Input
    ref={ref}
    value={vvalue}
    id={props.id}
    name={props.name}
    onChange={handleChange}
    placeholder={currencyMaskOptionsIDR.prefix + " 0"}
    required={props?.required || false}
    disabled={props?.disabled ? true : false} 
  />;
});

InputCurrency.displayName = "InputCurrency"

export default InputCurrency;
