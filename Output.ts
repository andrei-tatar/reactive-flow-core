const outputs = Symbol('outputs');

export function Output(name?: string) {
    return (target, key: string) => {
        if (!name) { name = key; }
        let existing = target[outputs];
        if (!existing) { target[outputs] = existing = []; }
        existing.push({ name, key });
    };
}

/** @internal */
export function GetOutputs(target): { name: string, key: string }[] {
    return target[outputs] || [];
}
