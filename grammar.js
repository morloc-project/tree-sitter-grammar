function sepBy1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function sepBy(rule, separator) {
  return optional(sepBy1(rule, separator));
}

function sepBy2(rule, separator) {
  return seq(rule, repeat1(seq(separator, rule)));
}

function parens(rule) {
  return seq("(", rule, ")");
}

function brackets(rule) {
  return seq("[", rule, "]");
}

function braces(rule) {
  return seq("{", rule, "}");
}

module.exports = grammar({

  name: 'morloc',

  externals: $ => [$._indent, $._dedent, $._left_aligned, /\n/],

  extras: $ => [/\s/, /\n/, /\r/],

  conflicts: $ => [[$.signature, $.declaration]],

  rules: {
    source_file: $ => sepBy1($._toplevel, $._left_aligned),

    _toplevel: $ => choice(
      $.comment,
      $.module,
      $.import,
      $.source,
      $.typedef,
      $.signature,
      $.declaration
    ),


    // --------- COMMENT ------------------------------------------------------

    comment: $ => choice(
      $._lineComment,
      $._blockComment
    ),

    // general comment
    _lineComment: $ => /--[^']?(?:[^\r\n])*/,
    _blockComment: $ => token(
      seq( 
        "{-",
        repeat(choice(
          /-[^}]/,
          /[^-]/
        )),
        "-}"
      )
    ),


    // --------- MODULE --------------------------------------------------------

    // module <module_name> ([export..])
    module: $ => seq(
      "module",
      $.identifier,
      parens(
        choice(
          "*",
          sepBy1($.exportOrImportExpr, ",")
        )
      )
    ),

    exportOrImportExpr: $ => seq(
      field("name", $.identifier),
      optional(seq("as", field("alias", $.identifier)))
    ),

    // --------- IMPORT --------------------------------------------------------

    import: $ => seq(
      "import",
      $.identifier,
      optional(parens(repeat($.exportOrImportExpr)))
    ),

    // --------- SOURCE --------------------------------------------------------

    source: $ => seq(
      "source",
      $.upperIdentifier,
      optional(seq( "from", $.string)),
      parens(repeat1(seq($.string, optional(seq("as", $.identifier)))))
    ),

    // --------- SIGNATURE -----------------------------------------------------

    signature: $ => seq(
      $.identifier,
      repeat($.identifier),
      "::",
      $.type
    ),

    // --------- TYPEDEF -------------------------------------------------------

    typedef: $ => seq(
      "type",
      optional(seq($.upperIdentifier, "=>")),
      $.type,
      "=",
      choice($.type, seq($.string, repeat($.identifier)))
    ),

    // --------- TYPE -------------------------------------------------------

    type: $ => choice(
      seq($.taggableIdentifierLU, repeat($._typeGroup)),
      $._sugarTypes,
      parens($.type),
      sepBy2($._typeGroup, "->"),
      seq("(", ")")
    ),

    // types
    _typeGroup: $ => choice(
      $.taggableIdentifierLU,
      $._sugarTypes,
      parens($.type),
      seq("(", ")")
    ),

    _sugarTypes: $ => choice(
      brackets($.type),
      parens(sepBy2($.type, ","))
    ),

    // --------- DECLARATION ---------------------------------------------------

    declaration: $ => seq(
      field("lhs", $.identifier),
      repeat(field("boundVar", $.identifier)),
      '=',
      field("rhs", $._expression),
      optional($.block)
    ),

    block: $ => seq(
      "where",
      $._indent,
      repeat1(seq($._left_aligned, $.declaration)),
      $._dedent
    ),

    _expression: $ => choice(
      $.application,
      $.composition,
      $._expressionSimple
    ),

    application: $ => choice(
      seq(
        $.taggableIdentifierL,
        repeat1($._expressionSimple)
      ),
      seq(
        parens(choice(
          $.application,
          $.composition,
          $.taggableIdentifierL
        )),
        repeat1($._expressionSimple)
      )
    ),

    composition: $ => sepBy2($._expressionSimple, "."),

    _expressionSimple: $ => choice(
      $.taggableIdentifierL,
      $._primitiveExpr,
      $.listExpr,
      $.tupleExpr,
      $.recordExpr,
      parens($.application)
    ),

    taggableIdentifierL: $ => seq(optional($.tag), $.identifier),
    taggableIdentifierLU: $ => seq(optional($.tag), choice($.identifier, $.upperIdentifier)),

    tag: $ => /[a-z][a-zA-Z0-9]*:/,

    identifier: $ => /[a-z][a-zA-Z0-9_']*/,

    upperIdentifier: $ => /[A-Z][a-zA-Z0-9]*/,

    listExpr: $ => brackets(sepBy($._expression, ",")),

    // a tuple, which must contain at least 2 elements
    tupleExpr: $ => parens(sepBy2($._expression, ",")),

    recordExpr: $ => braces(sepBy($.recordExprEntry, ",")),

    recordExprEntry: $ => seq(
      $.identifier,
      "=",
      $._expression
    ),

    _primitiveExpr: $ => choice(
      $.string,
      $.number,
      $._boolean
    ),

    string: $ => /"(?:\\.|[^"\\])*"/,
    number: $ => /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
    _boolean: $ => choice( $.true, $.false ),
    true: $ => 'True',
    false: $ => 'False'
  }
});
