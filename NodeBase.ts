import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GetInputs } from './Input';
import { GetOutputs } from './Output';

import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/switchMap';

export abstract class NodeBase {
    private inputDict: Dictionary<ReplaySubject<any>> = {};
    private outputDict: Dictionary<ReplaySubject<any>> = {};
    private inputNames = new ReplaySubject<string>();
    private outputNames = new ReplaySubject<string>();

    get inputs() {
        return this.inputNames.asObservable();
    }
    get outputs() {
        return this.outputNames.asObservable();
    }

    constructor() {
        const attrInputs = GetInputs(this);
        for (const attrInput of attrInputs) {
            const input = this.getInput(attrInput.name);
            Object.defineProperty(this, attrInput.key, {
                get: () => input,
            });
        }

        const attrOutputs = GetOutputs(this);
        for (const attrOutput of attrOutputs) {
            let value;
            Object.defineProperty(this, attrOutput.key, {
                get: () => value,
                set: (v) => {
                    this.setOutput(attrOutput.name, v);
                    value = v;
                },
            });
        }
    }

    init(): void | Promise<void> {
        // do nothing
    }

    close(): void | Promise<void> {
        this.inputNames.complete();
        this.outputNames.complete();
        this.closeDict(this.inputDict);
        this.closeDict(this.outputDict);
    }

    setInput(name: string, value: Observable<any>) {
        const subject = this.getInputSubject(name);
        subject.next(value);
    }

    getOutput(name: string) {
        return this.getOutputSubject(name).switchMap(i => i);
    }

    protected getInput<T>(name: string) {
        const subject = this.getInputSubject(name);
        return subject.switchMap(i => i);
    }

    protected setOutput<T>(name: string, value: Observable<T>) {
        const subject = this.getOutputSubject(name);
        subject.next(value);
    }

    private getSubject(name: string, dict: Dictionary<ReplaySubject<any>>, names: ReplaySubject<string>) {
        let existing = dict[name];
        if (!existing) {
            dict[name] = existing = new ReplaySubject(1);
            names.next(name);
        }
        return existing;
    }

    private getInputSubject(name: string) {
        return this.getSubject(name, this.inputDict, this.inputNames);
    }

    private getOutputSubject(name: string) {
        return this.getSubject(name, this.outputDict, this.outputNames);
    }

    private closeDict(dict: Dictionary<ReplaySubject<any>>) {
        for (const key of Object.getOwnPropertyNames(dict)) {
            dict[key].next(Observable.empty());
            dict[key].complete();
        }
    }
}

interface Dictionary<T> {
    [key: string]: T;
}