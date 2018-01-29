const inputs = Symbol('inputs');

export function Input(name?: string) {
    return (target, key: string) => {
        if (!name) { name = key; }
        let existing = target[inputs];
        if (!existing) { target[inputs] = existing = []; }
        existing.push({ name, key });
    };
}

export function GetInputs(target): { name: string, key: string }[] {
    return target[inputs] || [];
}
