function sepBy1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function parens(rule) {
  return seq("(", rule, ")");
}

module.exports = grammar({

  name: 'morloc',

  externals: $ => [$.indent, $.dedent, $.newline, $.left_aligned, /\s/],

  extras: $ => [/\s/, /\n/, /\r/],

  rules: {
    source_file: $ => repeat(seq($.left_aligned, $.declaration)),
    declaration: $ => seq(
      field("lhs", $.identifier),
      repeat(field("boundVar", $.identifier)),
      '=',
      field("rhs", $._expression),
      optional($.block)
    ),
    block: $ => seq(
      "where",
      $.indent,
      $.declaration, // There must be at least one
      repeat(seq($.left_aligned, $.declaration)),
      $.dedent
    ),

    _expression: $ => choice(
      $.identifier,
      $.number,
      $.application
    ),
    application: $ => choice(
      seq(
        $.identifier,
        repeat1($._expressionArg)
      ),
      seq(
        parens($.application),
        repeat1($._expressionArg)
      )
    ),
    _expressionArg: $ => choice(
      $.identifier,
      $.number,
      parens($.application)
    ),
    identifier: $ => /[a-z][a-z0-9_]*/,
    number: $ => /\d+/
  }
});





// module.exports = grammar({
//   name: "morloc",
//
//   extras: $ => [
//       /\p{Zs}/, // match all unicode space
//       /\r/,
//       /\n/,
//       $._comment
//       $._mordoc
//   ],
//
//   externals: $ => [
//     // increase the indent, count number of spaces after the newline, set this
//     // to indent, assuming it is greater than prior indent
//     $._indent,
//     // pop the indentation, returning to outer indent level
//     $._dedent,
//     // anchor expression requiring exactly INDENT spaces on the left
//     $._left
//     // newline, triggers check of indentation
//     /\n/
//   ],
//
//   rules: {
//     morloc: $ => repeat(choice(
//       $.module,
//       $.termdef,
//     )),
//
//     // non-newline whitespace or comments
//     _s: $ => repeat(choice(/(\t ]+/, _comment)),
//
//     _comment: $ => choice(
//       $._lineComment,
//       $._blockComment
//     ),
//
//
//     // general comment
//     _lineComment: $ => /--[^']?(?:[^\r\n])*/,
//
//     _blockComment: $ => token (
//       seq(
//         "{-",
//         /(.|[\r\n])*?/,
//         "-}"
//       )
//     ),
//
//     // morloc documentation
//     _mordoc: $ => /--'(?:[^\r\n])*/,
//
//     // module <module_name> ([export..])
//     module: $ => seq(
//       "module",
//       $.wsn,
//       $.moduleName,
//       $.wsn,
//       "(",
//       $.wsn,
//       choice(
//         "*",
//         seq($.exportExpr, repeat(seq(',', $.exportExpr)))
//       ),
//       $.wsn,
//       ")"
//     ),
//
//     exportExpr: $ => seq(
//       $.anyName,
//       optional(seq($.wsn, "as", $.wsn, $.anyName)),
//       $.wsn
//     ),
//
//     // module names must be lowercase, no quotes
//     moduleName: $ => /[a-z]+/,
//
//     anyName: $ => /[a-zA-Z][a-zA-Z0-9']*/,
//
//     termdef: $ => seq(
//       $.termName,
//       $.wsn
//       optional( seq(
//           $.termName,
//           repeat( seq(',', $.termName) )
//         )
//       ),
//       "=",
//       $._expression
//     ),
//
//     _expression: $ => choice(
//       $.primitiveExpr,
//       $.listExpr,
//       $.tupleExpr,
//       $.recordExpr,
//       $.parensExpr
//     ),
//
//     termName: $ => /[a-z][a-zA-Z']*/,
//
//     listExpr: $ => seq(
//       "[",
//       repeat( $._expression ),
//       "]"
//     ),
//
//     // a tuple, which must contain at least 2 elements
//     tupleExpr: $ => seq(
//       "(",
//       $._expression,
//       ",",
//       repeat1( $._expression ),
//       ")"
//     ),
//
//     recordExpr: $ => seq(
//       "{",
//       repeat( $.recordExprEntry ),
//       "}"
//     ),
//
//     recordExprEntry: $ => seq(
//       $.termName,
//       "=",
//       $._expression
//     ),
//
//     parensExpr: $ => seq(
//       "(",
//       $._expression,
//       ")"
//     ),
//
//     primitiveExpr: $ => choice(
//       $.string,
//       $.number,
//       $.boolean
//     ),
//
//     string: $ => /"(?:\\.|[^"\\])*"/,
//     number: $ => /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
//     boolean: $ => choice( $.true, $.false ),
//     true: $ => 'True',
//     false: $ => 'False'
//   }
// });


    // document: $ => choice(
    //   $.module,
    //   $.imports,
    //   $.source,
    //   $.signature,
    //   $.termdef,
    //   $.typedef
    // ),
    // // module <module_name> ([export..])
    // module: $ => seq(
    //   'module',
    //   $.name
    // ),
    //
    // // <name> <args> = <expr>
    // termdef: $ => seq(
    //   $.name,
    //   repeat($.name),
    //   "=",
    //   termexpr
    // ),
    //
    // // <primitive> | ( <termexpr> ) | <function>
    // termexpr: $ => choise(
    //   $.value
    //   $.name
    // ),
    //
    // // <typename>
    // signature: $ => seq(
    //   $.name
    // ),
    //
    // // any name, upper or lower case, may have single quotes
    // name: $ => /[A-Za-z][a-zA-Z0-9_-']*/,
    // value: $ => choice(
    //   $.object,
    //   $.array,
    //   $.string,
    //   $.number,
    //   $.true,
    //   $.false,
    //   $.null
    // ),
    //
    // // records
    // termobject: $ => seq(
    //   '{',
    //   optional(seq($.pair, repeat(seq(',', $.termpair)))),
    //   '}'
    // ),
    //
    // // key/val pair in record term
    // termpair: $ => seq($.name, '=', $.termexpr),
    //
    // array: $ => seq(
    //   '[',
    //   optional(seq($.value, repeat(seq(',', $.value)))),
    //   ']'
    // ),
