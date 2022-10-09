//validation
export interface validatable {
  value: string | number;
  required?: boolean;
  max_length?: number;
  min_length?: number;
  max?: number;
  min?: number;
}

export function validate(validateInputs: validatable): boolean {
  let result = true;
  if (validateInputs.required) {
    result = result && validateInputs.value.toString().trim().length !== 0;
  }
  if (
    validateInputs.max_length != null &&
    typeof validateInputs.value === "string"
  ) {
    result =
      result && validateInputs.value.trim().length <= validateInputs.max_length;
  }
  if (
    validateInputs.min_length != null &&
    typeof validateInputs.value === "string"
  ) {
    result =
      result && validateInputs.value.trim().length >= validateInputs.min_length;
  }
  if (validateInputs.max != null && typeof validateInputs.value === "number") {
    result = result && validateInputs.value <= validateInputs.max;
  }
  if (validateInputs.min != null && typeof validateInputs.value === "number") {
    result = result && validateInputs.value >= validateInputs.min;
  }
  return result;
}
