import test from "tape";
import jsc from "jsverify";

// #region Money Type
const CurrencyError = () => {
    const name = "currency is not a valid string";
    return { name, toString: () => name };
};
const assertCurrency = currency =>
    typeof currency === "string" && currency.length > 0;
const AmountError = () => {
    const name = "amount is not a safe integer";
    return { name, toString: () => name };
};
const assertAmount = amount => Number.isSafeInteger(amount);
const MoneyError = () => {
    const name = "money object has invalid methods";
    return { name, toString: () => name };
};
const assertMoney = money => {
    return (
        typeof money === "object" &&
        typeof money.currency === "function" &&
        typeof money.amount === "function"
    );
};
const AddCurrencyError = () => {
    const name = "cannot add money from different currencies";
    return { name, toString: () => name };
};
const assertAddCurrency = (currencyA, currencyB) => currencyA === currencyB;

const Money = ({ Currency, Amount }) => {
    if (!assertCurrency(Currency)) {
        throw CurrencyError();
    }
    if (!assertAmount(Amount)) {
        throw AmountError();
    }

    const currency = () => Currency;
    const amount = () => Amount;
    const print = () => {
        console.log(`${amount()} ${currency()}`);
    };
    const add = money => {
        if (!assertMoney(money)) {
            throw MoneyError();
        }
        if (!assertAddCurrency(money.currency(), currency())) {
            throw AddCurrencyError();
        }
        if (!assertAmount(Amount + money.amount())) {
            throw AmountError();
        }
        Amount += money.amount();
    };
    const toString = () => `${currency()} - ${amount()}`;
    return {
        amount,
        currency,
        print,
        add,
        toString,
    };
};
// #endregion

test("Money", t => {
    const options = { tests: 100 };
    // #region correctnes
    const validCurrency = jsc.elements(["EUR", "USD", "GBP"]);

    const validAmount = jsc.oneof([
        jsc.integer,
        jsc.elements([Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]),
    ]);

    const validParams = jsc.record({
        Currency: validCurrency,
        Amount: validAmount,
    });

    const correctnessPositive = jsc.forall(validParams, params => {
        return assertMoney(Money(params));
    });
    t.equal(jsc.check(correctnessPositive, options), true);
    // #endregion

    // #region correctnes negative
    const invalidCurrency = jsc.oneof([
        jsc.constant(""),
        jsc.integer,
        jsc.constant({}),
        jsc.constant([]),
        jsc.constant(null),
        jsc.constant(undefined),
    ]);

    const invalidAmount = jsc.oneof([
        jsc.constant(Number.NEGATIVE_INFINITY),
        jsc.constant(Number.POSITIVE_INFINITY),
        jsc.constant(Number.MIN_VALUE),
        jsc.constant(Number.MAX_VALUE),
        jsc.constant(Number.NaN),
        jsc.asciistring,
        jsc.constant({}),
        jsc.constant([]),
        jsc.constant(null),
        jsc.constant(undefined),
    ]);

    const invalidParams = jsc.record({
        Currency: invalidCurrency,
        Amount: invalidAmount,
    });

    const correctnessNegative = jsc.forall(invalidParams, params => {
        try {
            Money(params);
        } catch (error) {
            const { Currency, Amount } = params;
            if (
                (!assertCurrency(Currency) &&
                    CurrencyError().name === error.name) ||
                (!assertAmount(Amount) && AmountError().name === error.name)
            ) {
                return true;
            } else {
                throw error;
            }
        }
    });
    t.equal(jsc.check(correctnessNegative, options), true);
    // #endregion

    // #region robustness
    const validMoney = jsc
        .record({ Currency: validCurrency, Amount: validAmount })
        .smap(
            params => Money(params),
            x => ({ Currency: x.currency(), Amount: x.amount() }),
        );

    const fakeMoney = jsc
        .pair(invalidCurrency, invalidAmount)
        .smap(
            ([x, y]) => ({ currency: () => x, amount: () => y }),
            x => [x.currency(), x.amount()],
        );

    const moneyPair = jsc.pair(validMoney, jsc.oneof([validMoney, fakeMoney]));

    const robustness = jsc.forall(moneyPair, ([x, y]) => {
        try {
            const xAmount = x.amount();
            const yAmount = y.amount();
            x.add(y);
            return x.amount() === xAmount + yAmount && yAmount === y.amount();
        } catch (error) {
            if (!assertMoney(y) && MoneyError().name === error.name) {
                return true;
            } else if (
                !assertAddCurrency(x.currency(), y.currency()) &&
                AddCurrencyError().name === error.name
            ) {
                return true;
            } else if (
                !assertAmount(x.amount() + y.amount()) &&
                AmountError().name === error.name
            ) {
                return true;
            } else {
                throw error;
            }
        }
    });
    t.equal(jsc.check(robustness, options), true);
    // #endregion
    t.end();
});
