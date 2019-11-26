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
            code: "no.jpath('.a.' + myVar, data)",
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
            code: "no.jpath(`.foo.${ bar }`, data)",
            errors: [{ message: "Only static no.jpath allowed" }]
        }
    ]
});
