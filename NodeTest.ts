import { Observable } from 'rxjs/Observable';
import { Node } from './node';
import { Input } from './Input';
import { Output } from './Output';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

export class NodeTest extends Node {
    @Input()
    a: Observable<number>;

    @Input()
    b: Observable<number>;

    @Output()
    sum = Observable.combineLatest(this.a, this.b).map(([a, b]) => a + b)
}
