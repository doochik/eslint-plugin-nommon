"use strict";

const rule = require("../../../lib/rules/no-jpath-dynamic"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015 }
});

ruleTester.run("no-jpath-dynamic", rule, {
    valid: [
        {
            code: "fn('.a', data)"
        },
        {
            code: "obj.prop('.a', data)"
        },
        {
            code: "no.date('.a', data)"
        },
        {
            code: "no.jpath('.a', data)"
        },
        {
            code: "no.jpath(`.a`, data)"
        },
        {
            code: "no.jpath(\".a\", data)"
        }
    ],

    invalid: [
        {
            code: "no.jpath('.foo.' + myVar, data)",
            output: "no.jpath('.foo[myVar]', data, { myVar })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "var bar_baz = 'bar_baz'; no.jpath('.foo.' + bar_baz, data)",
            output: "var bar_baz = 'bar_baz'; no.jpath('.foo[bar_baz]', data, { bar_baz })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath('.foo.' + myVar1 + myVar2, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(myVar, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(foo.bar, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.foo.${ bar.baz }`, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.foo.${ bar }`, data)",
            output: "no.jpath(`.foo[bar]`, data, { bar })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.foo.${ bar }.${ baz }`, data)",
            output: "no.jpath(`.foo[bar][baz]`, data, { bar, baz })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.[${SOME_VALUE}]`, data)",
            output: "no.jpath(`.[SOME_VALUE]`, data, { SOME_VALUE })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.foo{.id === \"${foo}\"}`, data)",
            output: "no.jpath(`.foo{.id === foo}`, data, { foo })",
            errors: [{ message: "Only static no.jpath allowed" }]
        },
        {
            code: "no.jpath(`.foo.${foo}-${bar}`, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        }
    ]
});
