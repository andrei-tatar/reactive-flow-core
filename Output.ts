/** @internal */
import 'reflect-metadata';

const outputs = Symbol('outputs');

export function Output(name?: string) {
    return (target, key: string) => {
        if (!name) { name = key; }
        const outputsArray = Reflect.getMetadata(outputs, target) || [];
        outputsArray.push({ name, key });
        Reflect.defineMetadata(outputs, outputsArray, target);
    };
}

/** @internal */
export function GetOutputs(target): { name: string, key: string }[] {
    return Reflect.getMetadata(outputs, target) || [];
}
