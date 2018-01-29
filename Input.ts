/** @internal */
import 'reflect-metadata';

const inputs = Symbol('inputs');

export function Input(name?: string) {
    return (target, key: string) => {
        if (!name) { name = key; }
        const inputsArray = Reflect.getMetadata(inputs, target) || [];
        inputsArray.push({ name, key });
        Reflect.defineMetadata(inputs, inputsArray, target);
    };
}

/** @internal */
export function GetInputs(target): { name: string, key: string }[] {
    return Reflect.getMetadata(inputs, target);
}
