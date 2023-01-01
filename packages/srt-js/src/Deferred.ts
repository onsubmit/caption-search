/**
 * Deferred promise.
 *
 * @export
 * @class Deferred
 * @template T Type of resolved value.
 */
export default class Deferred<T = void> {
  private _promise: Promise<T>;
  private _resolve!: (response: T | PromiseLike<T>) => void;
  private _reject!: (reason?: any) => void;

  /**
   * Creates an instance of Deferred.
   * @memberof Deferred
   */
  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Gets the underlying promise.
   *
   * @readonly
   * @type {Promise<T>}
   * @memberof Deferred
   */
  get promise(): Promise<T> {
    return this._promise;
  }

  /**
   * Resolves the promise.
   *
   * @param {(T | PromiseLike<T>)} value The resolved value.
   * @memberof Deferred
   */
  resolve = (value: T | PromiseLike<T>) => {
    this._resolve(value);
  };

  /**
   * Rejects the promise.
   *
   * @param {*} [reason] Rejection reason.
   * @memberof Deferred
   */
  reject = (reason?: any) => {
    this._reject(reason);
  };
}
