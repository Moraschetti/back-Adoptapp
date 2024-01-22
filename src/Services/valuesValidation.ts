/**
 * Function to verify that all body properties are included in the values.
 * @param body waits for an object to check its properties
 * @param values expects an array with necessary properties
 * @returns boolean
 */
export const checkValues = (body: Object, values: string[]) => {
    const keys = Object.keys(body);
    for (let value of values) {
        if (!keys.includes(value)) {
            return false;
        }
    }
    return true;
}
/**
 * Function to Check that the properties' values are not empty
 * @param body  waits for an object to check its properties
 * @returns boolean
 */
export const checkEmptyValues = (body: Object) => {
    const values = Object.values(body);
    const isComplete = values.every(value => !!value);
    return isComplete;
}