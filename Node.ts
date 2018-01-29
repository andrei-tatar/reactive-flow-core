import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { GetInputs } from './Input';
import { GetOutputs } from "./Output";

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/empty';

export abstract class Node {
    private _inputs: Dictionary<ReplaySubject<any>> = {};
    private _outputs: Dictionary<ReplaySubject<any>> = {};

    protected getInput<T>(name: string) {
        const subject = this.getSubject(this._inputs, name);
        return subject.switchMap(i => i);
    }

    protected setOutput<T>(name: string, value: Observable<T>) {
        const subject = this.getSubject(this._outputs, name);
        subject.next(value);
    }

    public setInput(name: string, value: Observable<any>) {
        const subject = this.getSubject(this._inputs, name);
        subject.next(value);
    }

    public getOutput(name: string) {
        return this.getSubject(this._outputs, name).switchMap(i => i);
    }

    private getSubject(dict: Dictionary<ReplaySubject<any>>, name: string) {
        let existing = dict[name];
        if (!existing) {
            dict[name] = existing = new ReplaySubject(1);
        }
        return existing;
    }


    private closeDict(dict: Dictionary<ReplaySubject<any>>) {
        for (const key of Object.getOwnPropertyNames(dict)) {
            dict[key].next(Observable.empty());
            dict[key].complete();
        }
    }

    public close() {
        this.closeDict(this._inputs);
        this.closeDict(this._outputs);
    }

    constructor() {
        const attrInputs = GetInputs(this);
        for (const attrInput of attrInputs) {
            this[attrInput.key] = this.getInput(attrInput.name);
        }

        const attrOutputs = GetOutputs(this);
        for (const attrOutput of attrOutputs) {
            let value;
            Object.defineProperty(this, attrOutput.key, {
                get: () => value,
                set: (v) => {
                    this.setOutput(attrOutput.name, v);
                    value = v;
                }
            });
        }
    }
}

interface Dictionary<T> {
    [key: string]: T;
}
