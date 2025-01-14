interface OperatorConfig {
    name: string;
    operator: string;
    code: number[];
    validationConfig?: {
      minLength?: number;
      maxLength?: number;
    };
  }
  
  interface ValidationResponse {
    valid: boolean;
    message: string;
    operator?: string;
    card?: string;
  }
  
  const operators: OperatorConfig[] = [
    { name: "kartuHalo", operator: "Telkomsel", code: [11] },
    { name: "simPATI", operator: "Telkomsel", code: [12, 13, 21] },
    { name: "LOOP", operator: "Telkomsel", code: [22] },
    { name: "KARTU As", operator: "Telkomsel", code: [21, 23, 52, 53] },
    { name: "by.U / Kartu As", operator: "Telkomsel", code: [51] },
    { name: "IndosatM2", operator: "Indosat Ooredoo", code: [14] },
    { name: "Matrix", operator: "Indosat Ooredoo", code: [55] },
    { name: "Mentari", operator: "Indosat Ooredoo", code: [58] },
    { name: "Mentari/Matrix", operator: "Indosat Ooredoo", code: [15, 16] },
    { name: "IM3", operator: "Indosat Ooredoo", code: [56, 57] },
    { name: "XL", operator: "XL Axiata", code: [17, 18, 19, 59, 77, 78, 79] },
    { name: "Axis", operator: "XL Axiata", code: [31, 32, 33, 38] },
    {
      name: "3",
      operator: "3",
      code: [95, 96, 97, 98, 99],
      validationConfig: { maxLength: 13 },
    },
    { name: "Smartfren", operator: "Smartfren", code: [81, 82, 83, 84, 85, 86, 87, 88, 89] },
    { name: "Net1", operator: "Net1", code: [27, 28] },
    { name: "ByRU", operator: "ByRU", code: [68] },
  ];
  
  const VALID = "VALID";
  const INVALID = "INVALID";
  const BELOW_MINIMUM_LENGTH = "BELOW MINIMUM LENGTH";
  const ABOVE_MAXIMUM_LENGTH = "ABOVE MAXIMUM LENGTH";
  const NOT_FOUND = "NOT FOUND";
  
  const defaultValidationConfig = { minLength: 10, maxLength: 12 };
  
  export const getOperator = (phoneNumber: string, validateLength = false): ValidationResponse => {
    let response: ValidationResponse = { valid: false, message: INVALID };
  
    if (!phoneNumber) return response;
  
    // Normalize phone number
    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.substring(1);
    }
    if (phoneNumber.startsWith("62")) {
      phoneNumber = "0" + phoneNumber.substring(2);
    }
    phoneNumber = phoneNumber.replace(/\D/g, "");
  
    if (!phoneNumber.startsWith("08")) return response;
  
    const prefix = phoneNumber.substring(2, 4);
  
    for (const operator of operators) {
      if (operator.code.includes(Number(prefix))) {
        response.operator = operator.operator;
        response.card = operator.name;
        response.message = VALID;
        response.valid = true;
  
        if (validateLength) {
          const validationConfig = operator.validationConfig || defaultValidationConfig;
          if (phoneNumber.length < (validationConfig.minLength || 10)) {
            response.valid = false;
            response.message = BELOW_MINIMUM_LENGTH;
          } else if (phoneNumber.length > (validationConfig.maxLength || 12)) {
            response.valid = false;
            response.message = ABOVE_MAXIMUM_LENGTH;
          }
        }
        return response;
      }
    }
  
    response.message = NOT_FOUND;
    return response;
  };