import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Dictionary } from './Types';

/** @internal */
import 'rxjs/add/observable/empty';
/** @internal */
import 'rxjs/add/operator/switchMap';

const inputsKey = Symbol('inputs');
const outputsKey = Symbol('outputs');

export abstract class Node<TConfig = any> {
    public static Input(name?: string): any {
        return (target, key: string) => {
            if (!name) { name = key; }
            return {
                get(this: Node<any>) {
                    return this.getInput(name);
                },
            };
        };
    }

    public static Output(name?: string): any {
        return (target, key: string) => {
            if (!name) { name = key; }
            let value;
            return {
                get: () => value,
                set(this: Node<any>, v: any) {
                    this.setOutput(name, v);
                    value = v;
                },
            };
        };
    }

    private readonly _inputDict: Dictionary<ReplaySubject<any>> = {};
    private readonly _outputDict: Dictionary<ReplaySubject<any>> = {};
    private readonly _inputNames = new ReplaySubject<string>();
    private readonly _outputNames = new ReplaySubject<string>();

    get inputs() {
        return this._inputNames.asObservable();
    }
    get outputs() {
        return this._outputNames.asObservable();
    }

    constructor(
        public readonly id: string,
        public readonly config: TConfig,
    ) {
    }

    init(): void | Promise<void> {
        // for inheritance
    }

    close(): void | Promise<void> {
        // for inheritance
    }

    setInput(name: string, value: Observable<any>) {
        const subject = this.getInputSubject(name);
        subject.next(value);
    }

    getOutput(name: string) {
        return this.getOutputSubject(name).switchMap(i => i);
    }

    async initInternal() {
        await this.init();
    }

    async closeInternal() {
        await this.close();
        this._inputNames.complete();
        this._outputNames.complete();
        this.closeDict(this._inputDict);
        this.closeDict(this._outputDict);
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
        return this.getSubject(name, this._inputDict, this._inputNames);
    }

    private getOutputSubject(name: string) {
        return this.getSubject(name, this._outputDict, this._outputNames);
    }

    private closeDict(dict: Dictionary<ReplaySubject<any>>) {
        for (const key of Object.getOwnPropertyNames(dict)) {
            dict[key].next(Observable.empty());
            dict[key].complete();
        }
    }
}
