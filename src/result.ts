export class Reason {
  public static None: Reason = new Reason("");

  constructor(private readonly reason: string) {
  }

  public toString(): string {
    return this.reason;
  }
}

export class Result<T> {
  public readonly invalid: boolean;
  public readonly reason: string;

  private constructor(public readonly valid: boolean, public readonly value: T, reasons: Reason[] = []) {
    this.invalid = !valid;
    this.reason = reasons.join(", ");
  }

  public static pass<T>(value: T = null, ...reasons: Reason[]): Result<T> {
    return new Result<T>(true, value, reasons);
  }

  public static fail<T>(...reasons: Reason[]): Result<T> {
    return new Result<T>(false, null, reasons);
  }

  public static condition<T>(value: T = null): ConditionBuilder<T> {
    return new ConditionBuilder<T>(value);
  }
}

class FailCondition {
  constructor(public readonly fails: () => boolean, public readonly reason: Reason) {
  }
}

class PassCondition {
  constructor(public readonly passes: () => boolean, public readonly reason: Reason) {
  }
}

interface IFailWhen<T> {
  failWhen(predicate: () => boolean, reason: Reason): FailConditionBuilder<T>;
}

interface IPassWhen<T> {
  passWhen(predicate: () => boolean, reason: Reason): PassConditionBuilder<T>;
}

class ConditionBuilder<T> implements IFailWhen<T> {
  constructor(private readonly guardedValue: T) {
  }

  public failWhen(predicate: () => boolean, reason: Reason): FailConditionBuilder<T> {
    return new FailConditionBuilder(this.guardedValue, new FailCondition(predicate, reason));
  }

  public passWhen(predicate: () => boolean, reason: Reason): PassConditionBuilder<T> {
    return new PassConditionBuilder(this.guardedValue, new PassCondition(predicate, reason));
  }
}

class FailConditionBuilder<T> implements IFailWhen<T> {
  private readonly conditions: FailCondition[] = [];

  constructor(private readonly guardedValue: T, private readonly condition: FailCondition) {
    this.conditions.push(condition);
  }

  public failWhen(predicate: () => boolean, reason: Reason): FailConditionBuilder<T> {
    this.conditions.push(new FailCondition(predicate, reason));
    return this;
  }

  /**
   * Tests conditions and fails when the first condition fails or passes when no conditions fails.
   * @returns a Result<T> indicating wheter the condition passed or failed.
   */
  public pass(reason: Reason = null): Result<T> {
    for (const condition of this.conditions) {
      if (condition.fails()) {
        return Result.fail(condition.reason);
      }
    }

    return Result.pass(this.guardedValue, reason ?? Reason.None);
  }
}

class PassConditionBuilder<T> implements IPassWhen<T> {
  private readonly conditions: PassCondition[] = [];

  constructor(private readonly guardedValue: T, private readonly condition: PassCondition) {
    this.conditions.push(condition);
  }

  public passWhen(predicate: () => boolean, reason: Reason): PassConditionBuilder<T> {
    this.conditions.push(new PassCondition(predicate, reason));
    return this;
  }

  /**
   * Tests conditions and passes when the first condition passes or fails when no conditions passes.
   * @returns a Result<T> indicating wheter the condition passed or failed.
   */
  public fail(reason: Reason = null): Result<T> {
    for (const condition of this.conditions) {
      if (condition.passes()) {
        return Result.pass(this.guardedValue, condition.reason);
      }
    }

    return Result.fail(reason ?? Reason.None);
  }
}
